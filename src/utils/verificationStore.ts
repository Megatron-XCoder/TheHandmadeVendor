import crypto from "crypto";

interface VerificationRecord {
  email: string;
  code: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  userData: {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
  };
}

// Global in-memory storage across Next.js API requests
declare global {
  var __verificationStore: Map<string, VerificationRecord> | undefined;
}

const store = global.__verificationStore || new Map<string, VerificationRecord>();
if (process.env.NODE_ENV !== "production") {
  global.__verificationStore = store;
}

// 5 minutes expiry
const CODE_LIFETIME_MS = 5 * 60 * 1000;
// 60 seconds resend cooldown
const RESEND_COOLDOWN_MS = 60 * 1000;
// Max verification attempts before invalidation
const MAX_ATTEMPTS = 5;

export const verificationStore = {
  createVerification(email: string, userData: VerificationRecord["userData"]) {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = store.get(normalizedEmail);

    // Rate-limiting check: minimum 60s between code dispatches
    if (existing && Date.now() - existing.createdAt < RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil(
        (RESEND_COOLDOWN_MS - (Date.now() - existing.createdAt)) / 1000
      );
      throw new Error(`Please wait ${waitSeconds} seconds before requesting a new code.`);
    }

    // Generate secure 6-digit verification code
    const code = crypto.randomInt(100000, 999999).toString();
    const now = Date.now();

    const record: VerificationRecord = {
      email: normalizedEmail,
      code,
      createdAt: now,
      expiresAt: now + CODE_LIFETIME_MS,
      attempts: 0,
      userData,
    };

    store.set(normalizedEmail, record);
    return { code, expiresAt: record.expiresAt };
  },

  verify(email: string, codeInput: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const record = store.get(normalizedEmail);

    if (!record) {
      return {
        success: false,
        error: "No active verification found. Please request a new code.",
      };
    }

    // Check expiry (5 minutes)
    if (Date.now() > record.expiresAt) {
      store.delete(normalizedEmail);
      return {
        success: false,
        error: "Verification code has expired (5-minute limit exceeded). Please request a new code.",
      };
    }

    // Check max attempts
    record.attempts += 1;
    if (record.attempts > MAX_ATTEMPTS) {
      store.delete(normalizedEmail);
      return {
        success: false,
        error: "Maximum verification attempts exceeded for security. Please request a new code.",
      };
    }

    // Verify code string
    if (record.code !== codeInput.trim()) {
      const remainingAttempts = MAX_ATTEMPTS - record.attempts;
      return {
        success: false,
        error: `Invalid verification code. ${remainingAttempts} attempts remaining.`,
      };
    }

    // Code matches and is valid! Consume it.
    store.delete(normalizedEmail);
    return {
      success: true,
      userData: record.userData,
    };
  },

  getRecord(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const record = store.get(normalizedEmail);
    if (!record) return null;
    if (Date.now() > record.expiresAt) {
      store.delete(normalizedEmail);
      return null;
    }
    return record;
  },
};
