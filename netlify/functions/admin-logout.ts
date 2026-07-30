// POST /api/admin-logout
//
// Revokes the current admin session and clears its cookie.
import { json } from "./_lib/grants";
import { ADMIN_COOKIE_NAME, clearAdminCookie, getCookie, revokeAdminSession } from "./_lib/admin";

export default async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const token = getCookie(req, ADMIN_COOKIE_NAME);
  if (token) await revokeAdminSession(token);

  return json(200, { ok: true }, { "Set-Cookie": clearAdminCookie() });
};
