export type ContactSpamInput = {
  website?: string;
  ts?: number;
  message: string;
};

export type ContactSpamResult =
  | { spam: false }
  | { spam: true; reason: "honeypot" | "timing" | "links" | "length" | "keywords" };

const MIN_OPEN_MS = 3000;

export function isContactSpam(
  input: ContactSpamInput,
  now = Date.now(),
): ContactSpamResult {
  if (input.website) return { spam: true, reason: "honeypot" };

  const ts = Number(input.ts);
  if (!ts || now - ts < MIN_OPEN_MS) {
    return { spam: true, reason: "timing" };
  }

  const msg = String(input.message || "");

  if ((msg.match(/http/gi) || []).length > 2) {
    return { spam: true, reason: "links" };
  }

  if (msg.length < 10 || msg.length > 2000) {
    return { spam: true, reason: "length" };
  }

  if (/viagra|casino|crypto|loan/gi.test(msg)) {
    return { spam: true, reason: "keywords" };
  }

  return { spam: false };
}
