// Shared helpers for the access-grant functions.
//
// A "grant" is one guest's time-boxed access to one building. It is looked up
// by the SHA-256 hash of the magic-link token, so the raw token is never
// stored. Grants live in the Netlify Blobs "grants" store.
import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

export type Grant = {
  buildingId: string;
  guestEmail?: string;
  /** epoch ms — access starts */
  validFrom: number;
  /** epoch ms — access ends */
  validUntil: number;
  revoked?: boolean;
  createdAt: number;
};

/** Optional secret mixed into the token hash so a Blobs leak can't be reversed. */
const PEPPER = process.env.TOKEN_PEPPER ?? "";

export const COOKIE_NAME = "joro_token";

export function generateToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token + PEPPER).digest("hex");
}

function grantsStore() {
  return getStore("grants");
}

export async function putGrant(token: string, grant: Grant): Promise<void> {
  await grantsStore().setJSON(hashToken(token), grant);
}

export async function getGrant(token: string): Promise<Grant | null> {
  const g = await grantsStore().get(hashToken(token), { type: "json" });
  return (g as Grant) ?? null;
}

export async function revokeGrantByKey(key: string): Promise<void> {
  const store = grantsStore();
  const grant = (await store.get(key, { type: "json" })) as Grant | null;
  if (grant) await store.setJSON(key, { ...grant, revoked: true });
}

export async function listAllGrants(): Promise<Array<{ key: string } & Grant>> {
  const store = grantsStore();
  const { blobs } = await store.list();
  const results = await Promise.all(
    blobs.map(async (b) => {
      const g = (await store.get(b.key, { type: "json" })) as Grant | null;
      return g ? { key: b.key, ...g } : null;
    })
  );
  return results.filter(Boolean) as Array<{ key: string } & Grant>;
}

export function isGrantValid(grant: Grant | null, now: number = Date.now()): boolean {
  return !!grant && !grant.revoked && now >= grant.validFrom && now <= grant.validUntil;
}

export function getCookie(req: Request, name: string): string | null {
  const header = req.headers.get("cookie");
  if (!header) return null;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}

export function buildSetCookie(name: string, value: string, maxAgeSeconds: number): string {
  return [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`,
  ].join("; ");
}

export function json(status: number, body: unknown, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...extraHeaders },
  });
}
