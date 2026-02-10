import { FeatureFlagName, isFeatureEnabled } from "../../lib/features";
import { FC, PropsWithChildren } from "hono/jsx";

type Props = PropsWithChildren<{
  flagName: FeatureFlagName;
  fallback?: null;
}>;

const FeatureGuard = ({ flagName, children, fallback = null }: Props) => {
  const isEnabled = isFeatureEnabled(flagName);
  if (!isEnabled) {
    return fallback ?? null;
  }
  return (children ?? null) as ReturnType<FC>;
};
export default FeatureGuard;
