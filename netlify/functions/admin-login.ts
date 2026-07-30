// POST /api/admin-login   { password }
//
// Validates the admin password against the server-side ADMIN_KEY secret and,
// on success, sets an HttpOnly session cookie. The password is never checked
// in the browser.
import { json } from "./_lib/grants";
import { buildAdminCookie, createAdminSession, isCorrectAdminPassword } from "./_lib/admin";

export default async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  if (!process.env.ADMIN_KEY) return json(500, { error: "admin_not_configured" });

  let password = "";
  try {
    const body = await req.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return json(400, { error: "invalid_json" });
  }

  if (!isCorrectAdminPassword(password)) {
    return json(401, { error: "invalid_password" });
  }

  const { token, maxAgeSeconds } = await createAdminSession();
  return json(200, { ok: true }, { "Set-Cookie": buildAdminCookie(token, maxAgeSeconds) });
};
