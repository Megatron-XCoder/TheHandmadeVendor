/**
 * Admin Authentication & Entry Gate Security Utility
 * Uses Web Crypto API for universal Edge + Node.js runtime compatibility.
 */

export const ADMIN_ENTRY_COOKIE = "thv_admin_entry_pass";
export const ADMIN_SESSION_COOKIE = "thv_admin_session";

// Entry token valid for 30 minutes
export const ENTRY_TOKEN_MAX_AGE = 60 * 30; // 30 minutes in seconds

// Session token valid for 24 hours
export const SESSION_TOKEN_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

const DEFAULT_SECRET = "thv_artisan_vault_admin_secret_key_2026_cinzel";

function getSecretKey(): string {
  return process.env.ADMIN_SECRET_KEY || DEFAULT_SECRET;
}

/**
 * Creates an HMAC-SHA256 signature for data using the admin secret
 */
async function hmacSign(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Generates an authorized entry token when clicking the store icon in the footer
 */
export async function generateEntryToken(): Promise<string> {
  const timestamp = Date.now().toString();
  const payload = `thv_gate:${timestamp}`;
  const sig = await hmacSign(payload, getSecretKey());
  const encodedPayload = typeof btoa === "function" ? btoa(payload) : Buffer.from(payload).toString("base64");
  return `${encodedPayload}.${sig}`;
}

/**
 * Verifies if an entry token is valid and unexpired (within 30 mins)
 */
export async function verifyEntryToken(tokenString?: string | null): Promise<boolean> {
  if (!tokenString) return false;
  try {
    const parts = tokenString.split(".");
    if (parts.length !== 2) return false;
    const [encodedPayload, providedSig] = parts;
    const decodedPayload = typeof atob === "function" ? atob(encodedPayload) : Buffer.from(encodedPayload, "base64").toString("utf-8");

    const expectedSig = await hmacSign(decodedPayload, getSecretKey());
    if (expectedSig !== providedSig) return false;

    // Check expiration
    const [prefix, timestampStr] = decodedPayload.split(":");
    if (prefix !== "thv_gate") return false;

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;

    // Expire after 30 minutes
    const isExpired = Date.now() - timestamp > ENTRY_TOKEN_MAX_AGE * 1000;
    return !isExpired;
  } catch (err) {
    return false;
  }
}

/**
 * Generates an authenticated session token for the admin
 */
export async function generateAdminSession(username: string): Promise<string> {
  const timestamp = Date.now().toString();
  const payload = `thv_admin:${username}:${timestamp}`;
  const sig = await hmacSign(payload, getSecretKey());
  const encodedPayload = typeof btoa === "function" ? btoa(payload) : Buffer.from(payload).toString("base64");
  return `${encodedPayload}.${sig}`;
}

/**
 * Verifies if an admin session token is valid and unexpired (within 24 hours)
 */
export async function verifyAdminSession(tokenString?: string | null): Promise<{ valid: boolean; username?: string }> {
  if (!tokenString) return { valid: false };
  try {
    const parts = tokenString.split(".");
    if (parts.length !== 2) return { valid: false };
    const [encodedPayload, providedSig] = parts;
    const decodedPayload = typeof atob === "function" ? atob(encodedPayload) : Buffer.from(encodedPayload, "base64").toString("utf-8");

    const expectedSig = await hmacSign(decodedPayload, getSecretKey());
    if (expectedSig !== providedSig) return { valid: false };

    const [prefix, username, timestampStr] = decodedPayload.split(":");
    if (prefix !== "thv_admin" || !username) return { valid: false };

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return { valid: false };

    // Expire after 24 hours
    const isExpired = Date.now() - timestamp > SESSION_TOKEN_MAX_AGE * 1000;
    if (isExpired) return { valid: false };

    return { valid: true, username };
  } catch (err) {
    return { valid: false };
  }
}

