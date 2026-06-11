import { Style } from "../../lib/hxml-comps";

/** Shared copy + list styles for Hyperview tab fragments and full-screen routes */
export const signInEmptyHintStyles = () => (
  <>
    <Style
      id="featured-signin-hint"
      fontSize={14}
      color="#45413a"
      lineHeight={22}
      paddingTop={8}
    />
    <Style
      id="featured-empty-hint"
      fontSize={14}
      color="#45413a"
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
      borderBottomColor="#e4e0d5"
    />
    <Style
      id="message-from"
      fontSize={15}
      fontWeight="600"
      color="#191613"
      marginBottom={4}
    />
    <Style id="message-date" fontSize={12} color="#a39d90" marginBottom={8} />
    <Style id="message-preview" fontSize={14} color="#45413a" lineHeight={20} />
  </>
);
