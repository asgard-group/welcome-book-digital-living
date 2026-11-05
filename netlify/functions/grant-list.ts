// GET  /api/grant-list              → list all grants (admin)
// GET  /api/grant-list?building=xxx → filter by buildingId
// DELETE /api/grant-list?key=xxx    → revoke a grant by its blob key
import { isAdminRequest } from "./_lib/admin";
import { listAllGrants, revokeGrantByKey, json } from "./_lib/grants";
import { getBuilding } from "./_lib/building-store";
import staticBuildings from "./_data/buildings.json";

type StaticBuilding = { id: string; name?: string };

async function getBuildingName(id: string): Promise<string> {
  const blob = await getBuilding(id);
  if (blob?.name) return blob.name;
  const stat = (staticBuildings as Record<string, StaticBuilding>)[id];
  return stat?.name ?? id;
}

export default async (req: Request) => {
  if (!(await isAdminRequest(req))) return json(401, { error: "unauthorized" });

  const url = new URL(req.url);

  if (req.method === "DELETE") {
    const key = url.searchParams.get("key");
    if (!key) return json(400, { error: "missing_key" });
    await revokeGrantByKey(key);
    return json(200, { ok: true });
  }

  if (req.method === "GET") {
    const buildingFilter = url.searchParams.get("building");
    const grants = await listAllGrants();

    // Resolve building names once (deduplicated)
    const slugs = [...new Set(grants.map((g) => g.buildingId))];
    const names: Record<string, string> = {};
    await Promise.all(slugs.map(async (s) => { names[s] = await getBuildingName(s); }));

    const now = Date.now();
    const enriched = grants
      .filter((g) => !buildingFilter || g.buildingId === buildingFilter)
      .map((g) => ({
        key: g.key,
        buildingId: g.buildingId,
        buildingName: names[g.buildingId] ?? g.buildingId,
        guestEmail: g.guestEmail,
        validFrom: g.validFrom,
        validUntil: g.validUntil,
        createdAt: g.createdAt,
        revoked: g.revoked ?? false,
        status: g.revoked ? "revoked" : now > g.validUntil ? "expired" : "active",
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    return json(200, { grants: enriched });
  }

  return json(405, { error: "method_not_allowed" });
};
