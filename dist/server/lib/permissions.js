function canUploadImage(user, book) {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (user.creator?.status !== "verified" && user.id === book?.createdByUserId)
    return true;
  return true;
}
function canLikeBook(user, book) {
  return user?.creator?.id !== book.artistId && user?.creator?.id !== book.publisherId;
}
function canEditBook(user, book) {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (!user.creator) return false;
  const isCreatorProfileCreatedByUser = user.creator.createdByUserId === user.id;
  const isBookOwnedByCreator = user.creator.id === book.artistId || user.creator.id === book.publisherId;
  if (!isCreatorProfileCreatedByUser && user.creator.status !== "verified") {
    if (book.createdByUserId !== user.id) return false;
  }
  if (user.id === book.createdByUserId && book.approvalStatus !== "approved")
    return true;
  if (isBookOwnedByCreator) return true;
  return false;
}
function canDeleteBook(user, book) {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (!user.creator) return false;
  const isCreatorProfileCreatedByUser = user.creator.createdByUserId === user.id;
  const isBookOwnedByCreator = user.creator.id === book.artistId || user.creator.id === book.publisherId;
  if (!isCreatorProfileCreatedByUser && user.creator.status !== "verified") {
    return false;
  }
  if (user.id === book.createdByUserId && book.approvalStatus !== "approved")
    return true;
  if (isBookOwnedByCreator) return true;
  return false;
}
function canPreviewBook(user, book) {
  if (user.isAdmin) return true;
  if (!book.coverUrl) return false;
  const isDraftMode = book.publicationStatus === "draft";
  if (user.creator?.id === book.artistId && isDraftMode) return true;
  if (user.creator?.id === book.publisherId && isDraftMode) return true;
  return false;
}
function canEditCreator(user, creator) {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (user.creator?.status !== "verified") return false;
  return user.id === creator.ownerUserId;
}
function canClaimCreator(user, creator) {
  if (user?.creator?.id) return false;
  if (user?.id === creator.ownerUserId) return false;
  return true;
}
function canPublishBook(user, book) {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (user.creator?.status !== "verified") return false;
  if (book.approvalStatus !== "approved") return false;
  const coverUrlIsSet = book.coverUrl !== null;
  if (coverUrlIsSet) {
    return true;
  }
  return false;
}
function canUnpublishBook(user, book) {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (user.creator?.status !== "verified") return false;
  return book.publicationStatus === "published";
}
function canFollowCreator(user, creator) {
  return user?.creator?.id !== creator.id && user?.creator?.id !== null;
}
function canWishlistBook(user, book) {
  return user?.creator?.id !== book.artistId && user?.creator?.id !== book.publisherId;
}
function canCollectBook(user, book) {
  return user?.creator?.id !== book.artistId && user?.creator?.id !== book.publisherId;
}
function canClaimFairAttendance(user, fair) {
  if (!user?.creator) return false;
  if (user.creator.status !== "verified") return false;
  const today = new Date((/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0));
  return fair.status === "published" && fair.approvalStatus === "approved" && new Date(fair.endDate) >= today;
}
function canWithdrawFairAttendance(user, fair, creatorId) {
  if (!user?.creator) return false;
  if (user.creator.id !== creatorId) return false;
  if (user.creator.status !== "verified") return false;
  const today = new Date((/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0));
  return new Date(fair.endDate) >= today;
}
export {
  canClaimCreator,
  canClaimFairAttendance,
  canCollectBook,
  canDeleteBook,
  canEditBook,
  canEditCreator,
  canFollowCreator,
  canLikeBook,
  canPreviewBook,
  canPublishBook,
  canUnpublishBook,
  canUploadImage,
  canWishlistBook,
  canWithdrawFairAttendance
};
