type SubmitterContactSource = {
  displayName: string | null;
  email: string | null;
} | null;

type SubmitterUserSource = {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
} | null;

/** Prefer artist/publisher contact when set; otherwise the uploading user. Name tracks the email source. */
export function resolveBookSubmitterContact(params: {
  artist: SubmitterContactSource;
  publisher: SubmitterContactSource;
  notifyFollowersCreatorId: string | null;
  artistId: string | null;
  creatorUser: SubmitterUserSource;
}): { recipientEmail: string | null; displayName: string } {
  const submittingCreator =
    params.notifyFollowersCreatorId === params.artistId
      ? params.artist
      : params.publisher;

  const userName =
    [params.creatorUser?.firstName, params.creatorUser?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || null;

  const creatorEmail = submittingCreator?.email?.trim() || null;
  if (creatorEmail) {
    return {
      recipientEmail: creatorEmail,
      displayName:
        submittingCreator?.displayName?.trim() || userName || "there",
    };
  }

  return {
    recipientEmail: params.creatorUser?.email?.trim() || null,
    displayName: userName || submittingCreator?.displayName?.trim() || "there",
  };
}
