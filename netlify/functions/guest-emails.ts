// Emails des voyageurs, pour l'admin.
//
//   GET    /api/guest-emails          → liste, du plus récent au plus ancien
//   DELETE /api/guest-emails?key=xxx  → supprime un email
import { isAdminRequest } from "./_lib/admin";
import { getBuilding } from "./_lib/building-store";
import { json } from "./_lib/grants";
import { deleteGuestEmail, listGuestEmails } from "./_lib/guest-emails";
import staticBuildings from "./_data/buildings.json";

export default async (req: Request) => {
  if (!(await isAdminRequest(req))) return json(401, { error: "unauthorized" });

  if (req.method === "DELETE") {
    const key = new URL(req.url).searchParams.get("key");
    if (!key) return json(400, { error: "missing_key" });
    await deleteGuestEmail(key);
    return json(200, { ok: true });
  }

  if (req.method === "GET") {
    const emails = await listGuestEmails();
    const names: Record<string, string> = {};
    await Promise.all(
      [...new Set(emails.map((e) => e.buildingId))].map(async (id) => {
        const stat = (staticBuildings as Record<string, { name?: string }>)[id];
        names[id] = (await getBuilding(id))?.name ?? stat?.name ?? id;
      }),
    );
    return json(200, {
      emails: emails
        .map((e) => ({ ...e, buildingName: names[e.buildingId] ?? e.buildingId }))
        .sort((a, b) => b.createdAt - a.createdAt),
    });
  }

  return json(405, { error: "method_not_allowed" });
};
