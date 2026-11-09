// Admin CRUD for building/welcome-book data stored in Netlify Blobs.
// All routes require a valid admin session cookie.
//
//   GET    /api/building-admin           → list all building summaries
//   GET    /api/building-admin?slug=xxx  → get one building's full data
//   POST   /api/building-admin           → create or update a building (upsert)
//   DELETE /api/building-admin?slug=xxx  → delete a building
import { isAdminRequest } from "./_lib/admin";
import { json } from "./_lib/grants";
import { getBuilding, putBuilding, deleteBuilding, listBuildingSlugs } from "./_lib/building-store";
import staticBuildings from "./_data/buildings.json";

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
const DEEPL_URL = DEEPL_API_KEY?.endsWith(":fx")
  ? "https://api-free.deepl.com/v2/translate"
  : "https://api.deepl.com/v2/translate";

async function translateText(text: string): Promise<string> {
  if (!DEEPL_API_KEY || !text.trim()) return text;
  try {
    const res = await fetch(DEEPL_URL, {
      method: "POST",
      headers: { authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({ text: [text], source_lang: "FR", target_lang: "EN" }),
    });
    if (!res.ok) return text;
    const data = await res.json();
    return data?.translations?.[0]?.text ?? text;
  } catch {
    return text;
  }
}

type Bilingual = { fr: string; en: string };

async function translateBilingual(b: Bilingual): Promise<Bilingual> {
  return { fr: b.fr, en: await translateText(b.fr) };
}

async function translateBuilding(raw: Record<string, unknown>): Promise<Record<string, unknown>> {
  const data = raw as Record<string, unknown>;

  const tr = async (b: unknown) => {
    if (!b || typeof b !== "object") return b;
    const bil = b as Bilingual;
    if (typeof bil.fr === "string" && typeof bil.en === "string") return translateBilingual(bil);
    return b;
  };

  const trArr = async <T>(arr: T[], fn: (item: T) => Promise<T>) =>
    Promise.all((arr ?? []).map(fn));

  const access = await trArr((data.access as Record<string, unknown>[]) ?? [], async (s) => ({
    ...s, name: await tr(s.name), detail: await tr(s.detail),
  }));

  const extraInfo = await trArr((data.extraInfo as Record<string, unknown>[]) ?? [], async (s) => ({
    ...s, name: await tr(s.name), detail: await tr(s.detail),
  }));

  const stay = await trArr((data.stay as Record<string, unknown>[]) ?? [], async (s) => ({
    ...s, name: await tr(s.name), detail: await tr(s.detail),
  }));

  const svc = (data.services ?? { included: [], quote: [] }) as { included: Record<string, unknown>[]; quote: Record<string, unknown>[] };
  const services = {
    included: await trArr(svc.included ?? [], async (s) => ({ ...s, name: await tr(s.name) })),
    quote: await trArr(svc.quote ?? [], async (s) => ({ ...s, name: await tr(s.name) })),
  };

  const addr = (data.addresses ?? {}) as Record<string, Record<string, unknown>[]>;
  const addresses: Record<string, unknown[]> = {};
  for (const cat of Object.keys(addr)) {
    addresses[cat] = await trArr(addr[cat] ?? [], async (p) => ({ ...p, description: await tr(p.description) }));
  }

  const fac = (data.facilities ?? { sections: [] }) as { sections: Record<string, unknown>[] };
  const facilities = {
    sections: await trArr(fac.sections ?? [], async (sec) => ({
      ...sec,
      title: await tr(sec.title),
      items: await trArr((sec.items as Record<string, unknown>[]) ?? [], async (item) => ({
        ...item, name: await tr(item.name), detail: await tr(item.detail),
      })),
    })),
  };

  return { ...data, access, extraInfo, stay, services, addresses, facilities };
}

type StaticBuilding = { id: string; name: string };

export default async (req: Request) => {
  if (!(await isAdminRequest(req))) return json(401, { error: "unauthorized" });

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  // ── GET ─────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    if (slug) {
      // Try Blobs first, fallback to static
      const data =
        (await getBuilding(slug)) ??
        ((staticBuildings as Record<string, unknown>)[slug] as object | undefined) ?? null;
      if (!data) return json(404, { error: "not_found" });
      return json(200, data);
    }
    // List: merge Blobs keys with static keys, deduplicate, return summaries
    const blobSlugs = await listBuildingSlugs();
    const staticSlugs = Object.keys(staticBuildings);
    const allSlugs = [...new Set([...blobSlugs, ...staticSlugs])];
    const summaries = await Promise.all(
      allSlugs.map(async (s) => {
        const blob = await getBuilding(s);
        const stat = (staticBuildings as Record<string, StaticBuilding>)[s];
        const hasDefault = !!stat;
        if (blob) return { id: blob.id, name: blob.name, hasDefault };
        return stat ? { id: stat.id, name: stat.name, hasDefault } : null;
      })
    );
    return json(200, { buildings: summaries.filter(Boolean) });
  }

  // ── POST ?restore=<slug> : recopie le contenu d'origine (buildings.json) dans Blobs ──
  const restore = url.searchParams.get("restore");
  if (req.method === "POST" && restore) {
    const original = (staticBuildings as Record<string, unknown>)[restore] as
      | Parameters<typeof putBuilding>[0]
      | undefined;
    if (!original) return json(404, { error: "no_default_content" });
    // Le contenu d'origine est déjà bilingue : pas de passage par DeepL.
    await putBuilding(original);
    return json(200, { ok: true });
  }

  // ── POST (upsert) ────────────────────────────────────────────────────────
  if (req.method === "POST") {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json(400, { error: "invalid_json" });
    }
    if (!body.id || typeof body.id !== "string") return json(400, { error: "missing_id" });
    if (!body.name || typeof body.name !== "string") return json(400, { error: "missing_name" });
    // Basic slug validation: lowercase, hyphens only
    if (!/^[a-z0-9-]+$/.test(body.id)) return json(400, { error: "invalid_id" });
    const translated = await translateBuilding(body);
    await putBuilding(translated as Parameters<typeof putBuilding>[0]);
    return json(200, { ok: true });
  }

  // ── DELETE ───────────────────────────────────────────────────────────────
  if (req.method === "DELETE") {
    if (!slug) return json(400, { error: "missing_slug" });
    await deleteBuilding(slug);
    return json(200, { ok: true });
  }

  return json(405, { error: "method_not_allowed" });
};
