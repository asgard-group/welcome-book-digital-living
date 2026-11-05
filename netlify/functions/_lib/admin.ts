// Shared helpers for admin authentication.
//
// Stateless HMAC-signed session tokens: no Blobs lookup on every request.
// Token format: base64url(expiresAt_ms) + "." + HMAC-SHA256(payload, ADMIN_KEY)
// Logout = clear the cookie (token is self-contained, no server state to remove).
import crypto from "node:crypto";

export const ADMIN_COOKIE_NAME = "joro_admin";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

/** Constant-time password check against the server-side ADMIN_KEY secret. */
export function isCorrectAdminPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_KEY;
  if (!expected || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function hmacSign(payload: string): string {
  const key = process.env.ADMIN_KEY ?? "fallback-key";
  return crypto.createHmac("sha256", key).update(payload).digest("base64url");
}

/** Create a stateless signed session token. No Blobs write needed. */
export async function createAdminSession(): Promise<{ token: string; maxAgeSeconds: number }> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = expiresAt.toString();
  const payloadB64 = Buffer.from(payload).toString("base64url");
  const sig = hmacSign(payload);
  return { token: `${payloadB64}.${sig}`, maxAgeSeconds: SESSION_TTL_MS / 1000 };
}

/** No-op: stateless tokens can't be server-side revoked; clearing the cookie is enough. */
export async function revokeAdminSession(_token: string): Promise<void> {}

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

/** Verify a stateless HMAC-signed session token — no Blobs lookup. */
export async function isAdminRequest(req: Request): Promise<boolean> {
  const token = getCookie(req, ADMIN_COOKIE_NAME);
  if (!token) return false;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return false;
  const payload = Buffer.from(payloadB64, "base64url").toString();
  const expectedSig = hmacSign(payload);
  if (sig !== expectedSig) return false;
  const expiresAt = parseInt(payload, 10);
  return !isNaN(expiresAt) && Date.now() <= expiresAt;
}

export function buildAdminCookie(token: string, maxAgeSeconds: number, secure = true): string {
  const parts = [
    `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function clearAdminCookie(secure = true): string {
  const parts = [`${ADMIN_COOKIE_NAME}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}
