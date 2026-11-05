// POST /api/guest-email   { email }
//
// Saves the guest's email on their grant. Requires a valid session cookie.
import { COOKIE_NAME, getCookie, getGrant, putGrant, isGrantValid, json } from "./_lib/grants";

export default async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const token = getCookie(req, COOKIE_NAME);
  if (!token) return json(401, { error: "no_session" });

  const grant = await getGrant(token);
  if (!isGrantValid(grant)) return json(401, { error: "invalid_or_expired" });

  let email = "";
  try {
    const body = await req.json();
    email = typeof body?.email === "string" ? body.email.trim() : "";
  } catch {}

  if (!email || !email.includes("@")) return json(400, { error: "invalid_email" });

  if (!grant!.guestEmail) {
    await putGrant(token, { ...grant!, guestEmail: email });
  }

  return json(200, { ok: true });
};
