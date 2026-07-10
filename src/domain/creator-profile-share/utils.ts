export const CREATOR_PROFILE_SHARE_DAILY_LIMIT = 10;

export function resolveCreatorProfileShareDailyLimit(
  override?: number,
): number {
  if (override !== undefined && !Number.isNaN(override) && override > 0) {
    return override;
  }
  const fromEnv = process.env.CREATOR_PROFILE_SHARE_DAILY_LIMIT;
  if (!fromEnv?.trim()) return CREATOR_PROFILE_SHARE_DAILY_LIMIT;
  const parsed = Number(fromEnv);
  return Number.isNaN(parsed) || parsed <= 0
    ? CREATOR_PROFILE_SHARE_DAILY_LIMIT
    : parsed;
}
