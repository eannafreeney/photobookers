function resolveBookSubmitterContact(params) {
  const submittingCreator = params.notifyFollowersCreatorId === params.artistId ? params.artist : params.publisher;
  const userName = [params.creatorUser?.firstName, params.creatorUser?.lastName].filter(Boolean).join(" ").trim() || null;
  const creatorEmail = submittingCreator?.email?.trim() || null;
  if (creatorEmail) {
    return {
      recipientEmail: creatorEmail,
      displayName: submittingCreator?.displayName?.trim() || userName || "there"
    };
  }
  return {
    recipientEmail: params.creatorUser?.email?.trim() || null,
    displayName: userName || submittingCreator?.displayName?.trim() || "there"
  };
}
export {
  resolveBookSubmitterContact
};
