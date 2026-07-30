// Shared helpers for admin authentication.
//
// Separate from the guest grant system: the admin logs in with a single
// shared password (ADMIN_KEY), checked here on the server. On success we
// hand back an opaque session token (stored server-side in Blobs, looked up
// by its hash) via an HttpOnly cookie — the password itself never sits in a
// cookie or reaches the browser again after login.
import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

export const ADMIN_COOKIE_NAME = "joro_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h

type AdminSession = {
  createdAt: number;
  expiresAt: number;
};

function adminSessionsStore() {
  return getStore("admin_sessions");
}

function hashSessionToken(token: string): string {
  const pepper = process.env.TOKEN_PEPPER ?? "";
  return crypto.createHash("sha256").update(token + pepper).digest("hex");
}

/** Constant-time password check against the server-side ADMIN_KEY secret. */
export function isCorrectAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_KEY;
  if (!expected || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function createAdminSession(): Promise<{ token: string; maxAgeSeconds: number }> {
  const token = crypto.randomBytes(32).toString("base64url");
  const now = Date.now();
  const session: AdminSession = { createdAt: now, expiresAt: now + SESSION_TTL_MS };
  await adminSessionsStore().setJSON(hashSessionToken(token), session);
  return { token, maxAgeSeconds: SESSION_TTL_MS / 1000 };
}

export async function revokeAdminSession(token: string): Promise<void> {
  await adminSessionsStore().delete(hashSessionToken(token));
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

export async function isAdminRequest(req: Request): Promise<boolean> {
  const token = getCookie(req, ADMIN_COOKIE_NAME);
  if (!token) return false;
  const session = (await adminSessionsStore().get(hashSessionToken(token), { type: "json" })) as
    | AdminSession
    | null;
  return !!session && Date.now() <= session.expiresAt;
}

export function buildAdminCookie(token: string, maxAgeSeconds: number): string {
  return [
    `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    `Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`,
  ].join("; ");
}

export function clearAdminCookie(): string {
  return [`${ADMIN_COOKIE_NAME}=`, "Path=/", "HttpOnly", "Secure", "SameSite=Lax", "Max-Age=0"].join("; ");
}
