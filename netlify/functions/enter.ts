// POST /api/enter   { token }
//
// Exchanges a magic-link token for an HttpOnly session cookie scoped to the
// stay. The raw token never touches JavaScript after this — subsequent
// requests authenticate via the cookie. The token stays reusable until the
// grant expires (so the guest can re-open the link on another device).
import { COOKIE_NAME, buildSetCookie, getGrant, isGrantValid, json } from "./_lib/grants";

export default async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  let token = "";
  try {
    const body = await req.json();
    token = typeof body?.token === "string" ? body.token : "";
  } catch {
    // fall through to the missing-token response
  }
  if (!token) return json(400, { error: "missing_token" });

  const grant = await getGrant(token);
  if (!isGrantValid(grant)) return json(401, { error: "invalid_or_expired" });

  const maxAgeSeconds = (grant!.validUntil - Date.now()) / 1000;
  return json(
    200,
    { ok: true, buildingId: grant!.buildingId, validUntil: grant!.validUntil },
    { "Set-Cookie": buildSetCookie(COOKIE_NAME, token, maxAgeSeconds) },
  );
};
