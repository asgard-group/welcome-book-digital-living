// POST /api/deploy  (admin only) — triggers a Netlify build via deploy hook
import { isAdminRequest } from "./_lib/admin";
import { json } from "./_lib/grants";

export default async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  if (!(await isAdminRequest(req))) return json(401, { error: "unauthorized" });

  const hookUrl = process.env.NETLIFY_DEPLOY_HOOK;
  if (!hookUrl) return json(503, { error: "deploy_hook_not_configured" });

  const res = await fetch(hookUrl, { method: "POST" });
  if (!res.ok) return json(502, { error: "hook_failed", status: res.status });

  return json(200, { ok: true });
};
