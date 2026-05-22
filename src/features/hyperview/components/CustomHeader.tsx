import { xmlText } from "../../../lib/hxml-components";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";
import HeaderIconButton, { headerIconButtonStyles } from "./HeaderIconButton";

type Props = {
  title: string;
  artist?: string | null;
  publisher?: string | null;
  showBackButton: boolean;
  verified?: boolean;
  coverUrl?: string | null;
  isSearch?: boolean;
  baseUrl?: string;
  searchToggleTarget?: string;
};

const CustomHeader = ({
  title,
  artist,
  publisher,
  showBackButton,
  verified,
  coverUrl,
  isSearch,
  baseUrl,
  searchToggleTarget,
}: Props) => (
  <View style="custom-header-safe" sticky="true" safe-area="true">
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
          <Text style={artist ? "header-title-artist" : "header-title"}>
            {xmlText(title)}{" "}
            {verified ? <Text style="verified-badge">✓</Text> : null}
          </Text>
          {artist ? (
            <Text style="header-artist">
              {`by ${xmlText(artist)}`}
              {publisher && ` — ${xmlText(publisher)}`}
            </Text>
          ) : null}
        </View>
      </View>
      {isSearch && baseUrl ? (
        searchToggleTarget ? (
          <HeaderIconButton
            icon={`${baseUrl}/icons/header/search-dark.png`}
            action="toggle"
            target={searchToggleTarget}
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
    <Style id="verified-badge" fontSize={14} fontWeight="700" color="#2563eb" />
    <Style id="custom-header-back" flexDirection="row" alignItems="center" />
    <Style id="back-btn" fontSize={16} color="#3366cc" marginRight={12} />
    {headerIconButtonStyles()}
  </>
);
