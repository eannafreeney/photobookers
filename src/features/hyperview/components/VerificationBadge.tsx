import { Image, Style } from "../../../lib/hxml-comps";

type Props = {
  isVerified?: boolean;
  baseUrl?: string;
};

const VerificationBadge = ({ isVerified, baseUrl }: Props) => {
  if (!isVerified || !baseUrl) return null;
  return (
    <Image
      source={`${baseUrl}/icons/verified.png`}
      style="verified-badge"
      resize-mode="contain"
    />
  );
};

export default VerificationBadge;

export const verificationBadgeStyles = () => (
  <>
    <Style id="verified-badge" width={16} height={16} />
  </>
);
