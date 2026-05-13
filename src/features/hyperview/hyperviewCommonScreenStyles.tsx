import { Style } from "../../lib/hxml-comps";

/** Shared copy + list styles for Hyperview tab fragments and full-screen routes */
export const signInEmptyHintStyles = () => (
  <>
    <Style
      id="featured-signin-hint"
      fontSize={14}
      color="#666666"
      lineHeight={22}
      paddingTop={8}
    />
    <Style
      id="featured-empty-hint"
      fontSize={14}
      color="#666666"
      lineHeight={22}
      paddingTop={8}
    />
  </>
);

export const messageListStyles = () => (
  <>
    <Style
      id="message-row"
      paddingTop={14}
      paddingBottom={14}
      borderBottomWidth={1}
      borderBottomColor="#e5e5e5"
    />
    <Style
      id="message-from"
      fontSize={15}
      fontWeight="600"
      color="#111111"
      marginBottom={4}
    />
    <Style id="message-date" fontSize={12} color="#999999" marginBottom={8} />
    <Style id="message-preview" fontSize={14} color="#444444" lineHeight={20} />
  </>
);
