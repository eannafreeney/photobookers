// Shared self-follow guard for collector follow UI + API helpers.
export const canFollowCollector = (
  followerUserId: string | null | undefined,
  targetUserId: string,
) => Boolean(followerUserId) && followerUserId !== targetUserId;
