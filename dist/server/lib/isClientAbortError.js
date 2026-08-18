function isClientAbortError(err) {
  if (err == null) return false;
  if (typeof err !== "object") {
    return String(err).toLowerCase() === "aborted";
  }
  const e = err;
  if (e.name === "AbortError") return true;
  if (e.code === "ECONNRESET" || e.code === "EPIPE" || e.code === "ABORT_ERR") {
    return true;
  }
  const msg = (e.message ?? "").toLowerCase();
  return msg === "aborted" || msg === "request aborted" || msg.includes("aborted by the client") || msg.includes("the operation was aborted");
}
export {
  isClientAbortError
};
