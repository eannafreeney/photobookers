import flags from "../../featureFlags.json" with { type: "json" };
const featureFlags = flags;
const isFeatureEnabled = (flagName) => {
  return Boolean(featureFlags[flagName] ?? false);
};
const isFeatureEnabledForUser = (flagName, user) => {
  return isFeatureEnabled(flagName) || Boolean(user?.isAdmin);
};
export {
  isFeatureEnabled,
  isFeatureEnabledForUser
};
