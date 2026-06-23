import flags from "../../featureFlags.json";

export type FeatureFlagName = keyof typeof flags;

const featureFlags = flags as Record<FeatureFlagName, boolean>;

export const isFeatureEnabled = (flagName: FeatureFlagName): boolean => {
  return Boolean(featureFlags[flagName] ?? false);
};

export const isFeatureEnabledForUser = (
  flagName: FeatureFlagName,
  user?: { isAdmin?: boolean } | null,
): boolean => {
  return isFeatureEnabled(flagName) || Boolean(user?.isAdmin);
};
