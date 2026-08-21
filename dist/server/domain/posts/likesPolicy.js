function canLikePost(params) {
  if (!params.userId) return false;
  if (params.userId === params.postAuthorUserId) return true;
  if (params.isAdmin) return true;
  if (params.authorCreatorIds.length === 0) return true;
  return params.authorCreatorIds.some(
    (id) => params.followedCreatorIds.includes(id)
  );
}
export {
  canLikePost
};
