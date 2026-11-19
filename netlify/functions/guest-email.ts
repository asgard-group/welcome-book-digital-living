// POST /api/guest-email   { email, slug, lang?, marketing? }
//
// Enregistre l'email laissé par un voyageur sur l'écran de première connexion du logement
// `slug`. Public, comme /api/building : le livret s'ouvre par son URL ou son QR code, sans
// session. Les emails sont consultés dans l'admin (/api/guest-emails).
import { getBuilding } from "./_lib/building-store";
import { COOKIE_NAME, getCookie, getGrant, putGrant, isGrantValid, json } from "./_lib/grants";
import { saveGuestEmail } from "./_lib/guest-emails";
import staticBuildings from "./_data/buildings.json";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  let body: { email?: unknown; slug?: unknown; lang?: unknown; marketing?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (email.length > 254 || !EMAIL_RE.test(email)) return json(400, { error: "invalid_email" });

  // Seuls les logements existants acceptent un email (pas d'écriture sous un slug arbitraire).
  const slug = typeof body.slug === "string" ? body.slug : "";
  const exists = /^[a-z0-9-]+$/.test(slug) && ((await getBuilding(slug)) || slug in staticBuildings);
  if (!exists) return json(404, { error: "building_not_found" });

  await saveGuestEmail({ email, buildingId: slug, lang: body.lang === "en" ? "en" : "fr", marketing: body.marketing === true });

  // Voyageur arrivé par un lien magique : l'email est aussi rattaché à son accès, s'il n'en a pas déjà un.
  const token = getCookie(req, COOKIE_NAME);
  const grant = token ? await getGrant(token) : null;
  if (token && isGrantValid(grant) && grant!.buildingId === slug && !grant!.guestEmail) {
    await putGrant(token, { ...grant!, guestEmail: email });
  }

  return json(200, { ok: true });
};
