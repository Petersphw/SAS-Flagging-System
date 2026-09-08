export interface VerificationEntry {
  code: string;
  expiresAt: number;
}

// Global in-memory verification store across API route invocations
const globalForAuth = globalThis as unknown as {
  verificationStore?: Map<string, VerificationEntry>;
};

export const verificationStore =
  globalForAuth.verificationStore ?? new Map<string, VerificationEntry>();

if (process.env.NODE_ENV !== 'production') {
  globalForAuth.verificationStore = verificationStore;
}
