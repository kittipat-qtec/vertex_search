/**
 * Generates a UUID that works in both secure (HTTPS/localhost)
 * and non-secure (HTTP over IP) contexts.
 *
 * crypto.randomUUID() requires a secure context, so we fall back
 * to a Math.random-based UUID v4 implementation for HTTP deployments.
 */
export const generateId = (): string => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  // Fallback: RFC 4122 UUID v4
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
