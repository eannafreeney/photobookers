const MIN_OPEN_MS = 3e3;
function isContactSpam(input, now = Date.now()) {
  if (input.website) return { spam: true, reason: "honeypot" };
  const ts = Number(input.ts);
  if (!ts || now - ts < MIN_OPEN_MS) {
    return { spam: true, reason: "timing" };
  }
  const msg = String(input.message || "");
  if ((msg.match(/http/gi) || []).length > 2) {
    return { spam: true, reason: "links" };
  }
  if (msg.length < 10 || msg.length > 2e3) {
    return { spam: true, reason: "length" };
  }
  if (/viagra|casino|crypto|loan/gi.test(msg)) {
    return { spam: true, reason: "keywords" };
  }
  return { spam: false };
}
export {
  isContactSpam
};
