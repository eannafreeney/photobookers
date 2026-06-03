import { xmlText } from "../../../lib/hxml-components";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";
import HeaderIconButton, { headerIconButtonStyles } from "./HeaderIconButton";
import VerificationBadge, {
  verificationBadgeStyles,
} from "./VerificationBadge";

type Props = {
  title: string;
  artist?: string | null;
  publisher?: string | null;
  showBackButton: boolean;
  isVerified?: boolean;
  coverUrl?: string | null;
  isSearch?: boolean;
  baseUrl?: string;
  searchToggleTarget?: string;
  searchScrollToTopTarget?: string;
  showClaimButton?: boolean;
  claimHref?: string;
};

const CustomHeader = ({
  title,
  artist,
  publisher,
  showBackButton,
  isVerified,
  coverUrl,
  isSearch,
  baseUrl,
  searchToggleTarget,
  searchScrollToTopTarget,
  showClaimButton = false,
  claimHref,
}: Props) => (
  <View style="custom-header-safe" safe-area="true">
    <View style="custom-header">
      {showBackButton ? (
        <View style="custom-header-back">
          <Behavior action="back" />
          <Text style="back-btn">←</Text>
        </View>
      ) : null}
      <View style="header-title-container">
        {coverUrl ? (
          <Image source={coverUrl} style="header-cover" resize-mode="cover" />
        ) : null}
        <View style="header-title-container-inner">
          <View style="header-title-row">
            <Text style={artist ? "header-title-artist" : "header-title"}>
              {xmlText(title)}
            </Text>
            <VerificationBadge isVerified={isVerified} baseUrl={baseUrl} />
          </View>
          {artist ? (
            <Text style="header-artist">
              {`by ${artist}`}
              {publisher && ` — ${publisher}`}
            </Text>
          ) : null}
        </View>
      </View>
      <View style="header-actions">
        {showClaimButton && claimHref ? (
          <View style="header-claim-btn">
            <Text style="header-claim-label">Is this you?</Text>
            <Behavior action="deep-link" href={claimHref} />
          </View>
        ) : null}
        {isSearch && baseUrl ? (
          searchToggleTarget ? (
            <HeaderIconButton
              icon={`${baseUrl}/icons/header/search-dark.png`}
              action="toggle"
              target={searchToggleTarget}
              scrollToTopTarget={searchScrollToTopTarget}
            />
          ) : (
            <HeaderIconButton
              href={`${baseUrl}/hyperview/search`}
              icon={`${baseUrl}/icons/header/search-dark.png`}
            />
          )
        ) : null}
      </View>
    </View>
  </View>
);

export default CustomHeader;

export const customHeaderStyles = () => (
  <>
    <Style
      id="custom-header-safe"
      backgroundColor="#ffffff"
      borderBottomWidth={1}
      borderBottomColor="#e5e5e5"
    />
    <Style
      id="custom-header"
      paddingTop={12}
      paddingBottom={12}
      paddingLeft={16}
      paddingRight={16}
      flexDirection="row"
      alignItems="center"
      minHeight={64}
    />
    <Style
      id="header-cover"
      width={40}
      height={40}
      borderRadius={4}
      overflow="hidden"
    />
    <Style
      id="header-title-container"
      flex={1}
      flexDirection="row"
      alignItems="center"
      gap={16}
    />
    <Style id="header-title-container-inner" flexDirection="column" gap={2} />
    <Style
      id="header-title-row"
      flexDirection="row"
      alignItems="center"
      gap={6}
      flexShrink={1}
    />
    <Style
      id="header-title"
      fontSize={18}
      fontWeight="700"
      color="#111111"
      lineHeight={20}
    />
    <Style
      id="header-title-artist"
      fontSize={16}
      fontWeight="700"
      color="#111111"
      lineHeight={18}
    />
    <Style id="header-artist" fontSize={12} color="#555555" lineHeight={14} />
    <Style id="custom-header-back" flexDirection="row" alignItems="center" />
    <Style id="back-btn" fontSize={16} color="#3366cc" marginRight={12} />
    <Style
      id="header-actions"
      flexDirection="row"
      alignItems="center"
      gap={8}
    />
    <Style
      id="header-claim-btn"
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={10}
      paddingRight={10}
      borderRadius={6}
      borderWidth={1}
      borderColor="#111111"
      backgroundColor="#ffffff"
      alignItems="center"
      justifyContent="center"
    />
    <Style
      id="header-claim-label"
      fontSize={12}
      fontWeight="600"
      color="#111111"
    />
    {headerIconButtonStyles()}
    {verificationBadgeStyles()}
  </>
);
