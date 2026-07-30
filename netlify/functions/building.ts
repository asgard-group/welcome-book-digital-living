// GET /api/building
//
// Returns the guest's building data. If their session cookie maps to a
// currently-valid grant, it's derived from that grant (so a guest can't read
// another building's codes). Otherwise it falls back to DEFAULT_BUILDING_ID —
// the magic-link requirement is temporarily disabled (REQUIRE_GRANT = false)
// so the booklet is reachable with no link at all. Flip REQUIRE_GRANT back to
// true to re-enforce it once ready.
import buildings from "./_data/buildings.json";
import { COOKIE_NAME, getCookie, getGrant, isGrantValid, json } from "./_lib/grants";

const REQUIRE_GRANT = false;
const DEFAULT_BUILDING_ID = "haussmann-halevy";

export default async (req: Request) => {
  const token = getCookie(req, COOKIE_NAME);
  const grant = token ? await getGrant(token) : null;

  let buildingId = DEFAULT_BUILDING_ID;
  let validUntil: number | undefined;

  if (isGrantValid(grant)) {
    buildingId = grant!.buildingId;
    // Include validUntil so the client can hide values once the stay ends,
    // even while offline (cached).
    validUntil = grant!.validUntil;
  } else if (REQUIRE_GRANT) {
    return json(401, { error: token ? "invalid_or_expired" : "no_session" });
  }

  const data = (buildings as Record<string, unknown>)[buildingId];
  if (!data) return json(404, { error: "building_not_found" });

  return json(200, { ...(data as object), ...(validUntil ? { validUntil } : {}) });
};
