import { isFeatureEnabled } from "../../lib/features.js";
const FeatureGuard = ({ flagName, children, fallback = null }) => {
  const isEnabled = isFeatureEnabled(flagName);
  if (!isEnabled) {
    return fallback ?? null;
  }
  return children ?? null;
};
var FeatureGuard_default = FeatureGuard;
export {
  FeatureGuard_default as default
};
