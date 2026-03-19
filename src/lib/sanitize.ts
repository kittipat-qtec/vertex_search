const MAX_QUESTION_LENGTH = 2000;

const HTML_TAG_REGEX = /<[^>]*>/g;

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+(all\s+)?above/i,
  /you\s+are\s+now\s+/i,
  /act\s+as\s+/i,
  /pretend\s+(to\s+be|you\s+are)/i,
  /system\s*:?\s*prompt/i,
  /reveal\s+(your|the)\s+(system|initial)\s+prompt/i,
  /forget\s+(everything|all|your\s+instructions)/i,
  /override\s+(your|all)\s+(instructions|rules)/i,
  /new\s+instructions?\s*:/i,
  /\bDAN\b.*\bmode\b/i,
  /jailbreak/i,
];

export interface SanitizeResult {
  clean: string;
  flagged: boolean;
  reason?: string;
}

export const sanitizeQuestion = (input: string): SanitizeResult => {
  // 1. Trim whitespace
  let clean = input.trim();

  // 2. Length cap
  if (clean.length > MAX_QUESTION_LENGTH) {
    clean = clean.slice(0, MAX_QUESTION_LENGTH);
  }

  // 3. Strip HTML tags
  clean = clean.replace(HTML_TAG_REGEX, "");

  // 4. Normalize whitespace (collapse multiple spaces/newlines)
  clean = clean.replace(/\s{3,}/g, "  ");

  // 5. Detect prompt injection
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        clean,
        flagged: true,
        reason: "ตรวจพบรูปแบบคำถามที่อาจไม่เหมาะสม กรุณาตั้งคำถามใหม่",
      };
    }
  }

  return { clean, flagged: false };
};
