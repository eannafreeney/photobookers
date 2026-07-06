const TRUST_VERIFIED_AGE_DAYS = 30;
const TRUST_MIN_BOOKS_SINCE_VERIFY = 2;
function daysSince(date, now = /* @__PURE__ */ new Date()) {
  return (now.getTime() - date.getTime()) / (24 * 60 * 60 * 1e3);
}
function shouldModerateNewBook(args) {
  if (args.creatorStatus !== "verified" || !args.creatorVerifiedAt) return true;
  if (args.approvedBooksSinceVerificationBeforeInsert >= TRUST_MIN_BOOKS_SINCE_VERIFY)
    return false;
  if (daysSince(args.creatorVerifiedAt, args.now) < TRUST_VERIFIED_AGE_DAYS)
    return true;
  if (args.booksUploadedSinceVerificationBeforeInsert < TRUST_MIN_BOOKS_SINCE_VERIFY)
    return true;
  return false;
}
export {
  TRUST_MIN_BOOKS_SINCE_VERIFY,
  TRUST_VERIFIED_AGE_DAYS,
  shouldModerateNewBook
};
