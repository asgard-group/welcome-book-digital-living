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

type Bilingual = { fr: string; en: string };

/** Appelle `fn` sur chaque texte bilingue ({ fr, en }) trouvé dans `node`, à n'importe quelle profondeur. */
function walkBilingual(node: unknown, fn: (b: Bilingual) => void): void {
  if (!node || typeof node !== "object") return;
  const b = node as Partial<Bilingual>;
  if (typeof b.fr === "string" && typeof b.en === "string") return fn(b as Bilingual);
  for (const value of Object.values(node as Record<string, unknown>)) walkBilingual(value, fn);
}

const DEEPL_BATCH = 40; // textes par requête
const DEEPL_ATTEMPTS = 3;

/** Traduit un lot de textes en une requête ; null si DeepL refuse malgré les nouvelles tentatives. */
async function deeplBatch(texts: string[]): Promise<string[] | null> {
  for (let attempt = 0; attempt < DEEPL_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(DEEPL_URL, {
        method: "POST",
        headers: { authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({ text: texts, source_lang: "FR", target_lang: "EN" }),
      });
      if (res.ok) {
        const data = await res.json();
        const out = (data?.translations ?? []).map((t: { text?: string }) => t?.text);
        if (out.length === texts.length && out.every((t: unknown) => typeof t === "string")) return out;
        return null;
      }
      // 429 (trop de requêtes) et 5xx sont passagers : on réessaie. Le reste (clé invalide, quota épuisé) ne l'est pas.
      if (res.status !== 429 && res.status < 500) return null;
    } catch {
      // Erreur réseau : on réessaie.
    }
    await new Promise((resolve) => setTimeout(resolve, 600 * (attempt + 1)));
  }
  return null;
}

/**
 * Dictionnaire français → anglais pour tous les textes de `raw`.
 *
 * Un texte dont on connaît déjà une vraie traduction (dans `known` : version enregistrée, puis
 * contenu d'origine) n'est pas renvoyé à DeepL. Les autres partent par lots, l'un après l'autre :
 * une requête par texte, toutes en parallèle, laissait une partie des textes sans traduction.
 * `failed` compte les textes restés en français faute de traduction.
 */
async function buildDictionary(raw: unknown, known: unknown[]): Promise<{ dict: Map<string, string>; failed: number }> {
  const memory = new Map<string, string>();
  for (const source of known) {
    walkBilingual(source, (b) => {
      if (b.fr.trim() && b.en.trim() && b.en !== b.fr && !memory.has(b.fr)) memory.set(b.fr, b.en);
    });
  }

  const dict = new Map<string, string>();
  const missing: string[] = [];
  walkBilingual(raw, (b) => {
    if (!b.fr.trim() || dict.has(b.fr) || missing.includes(b.fr)) return;
    const en = memory.get(b.fr);
    if (en) dict.set(b.fr, en);
    else missing.push(b.fr);
  });

  let failed = 0;
  if (!DEEPL_API_KEY) return { dict, failed: missing.length };
  for (let i = 0; i < missing.length; i += DEEPL_BATCH) {
    const batch = missing.slice(i, i + DEEPL_BATCH);
    const out = await deeplBatch(batch);
    if (!out) failed += batch.length;
    else batch.forEach((fr, j) => dict.set(fr, out[j]));
  }
  return { dict, failed };
}

async function translateBuilding(raw: Record<string, unknown>, dict: Map<string, string>): Promise<Record<string, unknown>> {
  const data = raw as Record<string, unknown>;
  // Faute de traduction, l'anglais reprend le français (jamais de texte vide).
  const translateBilingual = async (b: Bilingual): Promise<Bilingual> => ({ fr: b.fr, en: dict.get(b.fr) ?? b.fr });

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
    included: await trArr(svc.included ?? [], async (s) => ({ ...s, name: await tr(s.name), description: await tr(s.description) })),
    quote: await trArr(svc.quote ?? [], async (s) => ({ ...s, name: await tr(s.name), description: await tr(s.description) })),
  };

  const addr = (data.addresses ?? {}) as Record<string, Record<string, unknown>[]>;
  const addresses: Record<string, unknown[]> = {};
  for (const cat of Object.keys(addr)) {
    // `type` (filtre cuisine) est saisi en français : `typeEn` est sa traduction, absente si elle a échoué.
    addresses[cat] = await trArr(addr[cat] ?? [], async (p) => {
      const type = typeof p.type === "string" ? p.type.trim() : "";
      const typeEn = type ? dict.get(type) : undefined;
      return { ...p, description: await tr(p.description), typeEn: typeEn && typeEn !== type ? typeEn : undefined };
    });
  }

  const fac = (data.facilities ?? { sections: [] }) as { sections: Record<string, unknown>[] };
  const facilities = {
    sections: await trArr(fac.sections ?? [], async (sec) => ({
      ...sec,
      title: await tr(sec.title),
      items: await trArr((sec.items as Record<string, unknown>[]) ?? [], async (item) => ({
        ...item, name: await tr(item.name), detail: await tr(item.detail), notice: await tr(item.notice),
      })),
    })),
  };

  // Titres / sous-titres / boutons personnalisés : saisis en français, traduits ici.
  const rawTexts = (data.texts ?? {}) as {
    menu?: Record<string, Bilingual>;
    menuOrder?: string[];
    pages?: Record<string, { title?: Bilingual; subtitle?: Bilingual; hideSubtitle?: boolean; notice?: Bilingual }>;
  };
  const texts = {
    ...(Array.isArray(rawTexts.menuOrder) ? { menuOrder: rawTexts.menuOrder.filter((k) => typeof k === "string") } : {}),
    menu: Object.fromEntries(
      await Promise.all(
        Object.entries(rawTexts.menu ?? {})
          .filter(([, v]) => v?.fr?.trim())
          .map(async ([k, v]) => [k, await translateBilingual(v)] as const),
      ),
    ),
    pages: Object.fromEntries(
      await Promise.all(
        Object.entries(rawTexts.pages ?? {}).map(async ([k, v]) => {
          const out: { title?: Bilingual; subtitle?: Bilingual; hideSubtitle?: boolean; notice?: Bilingual } = {};
          if (v?.hideSubtitle) out.hideSubtitle = true;
          if (v?.notice?.fr?.trim()) out.notice = await translateBilingual(v.notice);
          if (v?.title?.fr?.trim()) out.title = await translateBilingual(v.title);
          if (v?.subtitle?.fr?.trim()) out.subtitle = await translateBilingual(v.subtitle);
          return [k, out] as const;
        }),
      ),
    ),
  };

  // Encarts libres de la page Infos pratiques ; les encarts vides ne sont pas enregistrés.
  const notes = await trArr(
    ((data.notes as { title?: Bilingual; detail?: Bilingual }[]) ?? []).filter((n) => n?.title?.fr?.trim() || n?.detail?.fr?.trim()),
    async (n) => ({ ...n, title: await tr(n.title), detail: await tr(n.detail) }),
  );

  // Bandeau Check-in/out : seuls les libellés sont traduits, les heures restent telles quelles.
  const rawSchedule = data.schedule as
    | { arrivalLabel?: Bilingual; arrivalTime?: string; departureLabel?: Bilingual; departureTime?: string }
    | undefined;
  const schedule = rawSchedule
    ? {
        arrivalTime: rawSchedule.arrivalTime?.trim() || undefined,
        departureTime: rawSchedule.departureTime?.trim() || undefined,
        arrivalLabel: rawSchedule.arrivalLabel?.fr?.trim() ? await translateBilingual(rawSchedule.arrivalLabel) : undefined,
        departureLabel: rawSchedule.departureLabel?.fr?.trim() ? await translateBilingual(rawSchedule.departureLabel) : undefined,
      }
    : undefined;

  // Page Urgences : seul le texte d'information est traduit (noms, rôles et numéros restent tels quels).
  const rawEmergency = data.emergency as { info?: Bilingual } | undefined;
  const emergency = rawEmergency
    ? { ...rawEmergency, info: rawEmergency.info?.fr?.trim() ? await translateBilingual(rawEmergency.info) : undefined }
    : undefined;

  return { ...data, access, extraInfo, stay, services, addresses, facilities, texts, notes, schedule, emergency };
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
    // Les types de cuisine sont de simples chaînes : on les présente au dictionnaire comme des textes bilingues.
    const placeTypes = (building: unknown) =>
      Object.values(((building as { addresses?: Record<string, { type?: string; typeEn?: string }[]> } | null)?.addresses ?? {}))
        .flat()
        .filter((p) => typeof p?.type === "string" && p.type.trim())
        .map((p) => ({ fr: p.type!.trim(), en: p.typeEn ?? "" }));
    const stored = await getBuilding(body.id);
    const original = (staticBuildings as Record<string, unknown>)[body.id];
    const { dict, failed } = await buildDictionary(
      [body, placeTypes(body).map((t) => ({ fr: t.fr, en: "" }))],
      [stored, placeTypes(stored), original],
    );
    const translated = await translateBuilding(body, dict);
    await putBuilding(translated as Parameters<typeof putBuilding>[0]);
    // `untranslated` : nombre de textes restés en français côté anglais (DeepL indisponible ou refus).
    return json(200, { ok: true, untranslated: failed });
  }

  // ── DELETE ───────────────────────────────────────────────────────────────
  if (req.method === "DELETE") {
    if (!slug) return json(400, { error: "missing_slug" });
    await deleteBuilding(slug);
    return json(200, { ok: true });
  }

  return json(405, { error: "method_not_allowed" });
};
