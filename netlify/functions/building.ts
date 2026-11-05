// GET /api/building?slug=<slug>
//
// Returns one apartment's booklet data (wifi, access steps, services, ...), but
// only to a guest whose session cookie maps to a currently-valid grant for that
// very apartment. The grant is created by an admin (see grants.ts) and handed
// to the guest as a magic link; /api/enter turns it into the cookie.
//
//   401 -> no session, or the stay is over
//   403 -> valid session, but for a different apartment than the one requested
//   404 -> unknown apartment
import buildings from "./_data/buildings.json";
import { COOKIE_NAME, getCookie, getGrant, isGrantValid, json } from "./_lib/grants";

export default async (req: Request) => {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return json(400, { error: "missing_slug" });

  const token = getCookie(req, COOKIE_NAME);
  const grant = token ? await getGrant(token) : null;
  if (!isGrantValid(grant)) {
    return json(401, { error: token ? "invalid_or_expired" : "no_session" });
  }
  if (grant!.buildingId !== slug) return json(403, { error: "wrong_building" });

  const data = (buildings as Record<string, unknown>)[slug];
  if (!data) return json(404, { error: "building_not_found" });

  return json(200, { ...(data as object), validUntil: grant!.validUntil });
};
