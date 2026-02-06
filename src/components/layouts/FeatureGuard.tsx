import { FeatureFlagName, isFeatureEnabled } from "../../lib/features";
import { PropsWithChildren } from "hono/jsx";

type Props = PropsWithChildren<{
  flagName: FeatureFlagName;
  fallback?: null;
}>;

const FeatureGuard = ({ flagName, children, fallback = null }: Props) => {
  const isEnabled = isFeatureEnabled(flagName);
  if (!isEnabled) {
    return fallback;
  }
  return children;
};
export default FeatureGuard;
