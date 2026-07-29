// GET /api/building
//
// Returns the guest's building data — but only if their session cookie maps to
// a currently-valid grant. The client never says which building it wants; the
// server derives it from the grant, so a guest can't read another building's
// codes.
import buildings from "./_data/buildings.json";
import { COOKIE_NAME, getCookie, getGrant, isGrantValid, json } from "./_lib/grants";

export default async (req: Request) => {
  const token = getCookie(req, COOKIE_NAME);
  if (!token) return json(401, { error: "no_session" });

  const grant = await getGrant(token);
  if (!isGrantValid(grant)) return json(401, { error: "invalid_or_expired" });

  const data = (buildings as Record<string, unknown>)[grant!.buildingId];
  if (!data) return json(404, { error: "building_not_found" });

  // Include validUntil so the client can hide values once the stay ends,
  // even while offline (cached).
  return json(200, { ...(data as object), validUntil: grant!.validUntil });
};
