// POST /api/grants   (admin only — header: x-admin-key, or an admin session cookie)
//   { buildingId, days, email?, validFrom? }
//
// Creates a time-boxed access grant and returns the magic link. If a guest
// email and RESEND_API_KEY are present, it also emails the link. The link is
// always returned in the response so it can be issued/tested without email.
import buildings from "./_data/buildings.json";
import { generateToken, putGrant, json, type Grant } from "./_lib/grants";
import { isAdminRequest } from "./_lib/admin";

const DAY_MS = 24 * 60 * 60 * 1000;

export default async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  const adminKey = process.env.ADMIN_KEY;
  const hasValidHeader = !!adminKey && req.headers.get("x-admin-key") === adminKey;
  if (!hasValidHeader && !(await isAdminRequest(req))) {
    return json(401, { error: "unauthorized" });
  }

  let body: {
    buildingId?: string;
    days?: number;
    email?: string;
    validFrom?: string | number;
  } = {};
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const { buildingId, email } = body;
  if (!buildingId || !(buildings as Record<string, unknown>)[buildingId]) {
    return json(400, { error: "unknown_building" });
  }

  const days = Number(body.days);
  if (!Number.isFinite(days) || days <= 0) {
    return json(400, { error: "invalid_days" });
  }

  const validFrom = body.validFrom ? new Date(body.validFrom).getTime() : Date.now();
  if (Number.isNaN(validFrom)) return json(400, { error: "invalid_validFrom" });
  const validUntil = validFrom + days * DAY_MS;

  const token = generateToken();
  const grant: Grant = {
    buildingId,
    guestEmail: email,
    validFrom,
    validUntil,
    createdAt: Date.now(),
  };
  await putGrant(token, grant);

  const base = process.env.APP_URL || new URL(req.url).origin;
  const link = `${base}/access?token=${token}`;

  let emailed = false;
  if (email && process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "Jöro <onboarding@resend.dev>",
          to: email,
          subject: "Votre accès — Jöro",
          html: `<p>Bienvenue !</p>
<p>Voici votre lien d'accès au livret d'accueil de votre logement :</p>
<p><a href="${link}">${link}</a></p>
<p>Ce lien est valable pour la durée de votre séjour.</p>`,
        }),
      });
      emailed = res.ok;
    } catch {
      emailed = false;
    }
  }

  return json(200, { ok: true, link, emailed, buildingId, validFrom, validUntil });
};
