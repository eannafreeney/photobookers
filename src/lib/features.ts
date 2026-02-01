import flags from "../../features.json";

export type FeatureFlagName = keyof typeof flags;

const featureFlags = flags as Record<FeatureFlagName, boolean>;

export const isFeatureEnabled = (flagName: FeatureFlagName): boolean => {
  return Boolean(featureFlags[flagName] ?? false);
};
