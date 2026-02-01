import { FeatureFlagName, isFeatureEnabled } from "../../lib/features";

type Props = {
  flagName: FeatureFlagName;
  children: JSX.Element;
  fallback?: JSX.Element;
};

const FeatureGuard = ({ flagName, children, fallback = <></> }: Props) => {
  const isEnabled = isFeatureEnabled(flagName);
  if (!isEnabled) {
    return fallback;
  }
  return children;
};
export default FeatureGuard;
