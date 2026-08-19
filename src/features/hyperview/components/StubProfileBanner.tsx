import { Behavior, Style, Text, View } from "../../../lib/hxml-comps";

type Props = {
  displayName: string;
  claimHref: string;
  show: boolean;
};

const StubProfileBanner = ({ displayName, claimHref, show }: Props) => {
  if (!show) return <></>;

  return (
    <View style="stub-profile-banner">
      <Text style="stub-profile-banner-text">
        {`This profile was created by the Photobookers community. Are you ${displayName}?`}
      </Text>
      <View style="stub-profile-banner-link">
        <Text style="stub-profile-banner-cta">Claim your profile</Text>
        <Behavior action="deep-link" href={claimHref} />
      </View>
    </View>
  );
};

export default StubProfileBanner;

export const stubProfileBannerStyles = () => (
  <>
    <Style
      id="stub-profile-banner"
      backgroundColor="#eef4fc"
      borderRadius={8}
      padding={12}
      marginBottom={12}
    />
    <Style
      id="stub-profile-banner-text"
      fontSize={13}
      color="#45413a"
      lineHeight={20}
      marginBottom={8}
    />
    <Style id="stub-profile-banner-link" alignSelf="flex-start" />
    <Style
      id="stub-profile-banner-cta"
      fontSize={14}
      fontWeight="600"
      color="#2563eb"
    />
  </>
);
