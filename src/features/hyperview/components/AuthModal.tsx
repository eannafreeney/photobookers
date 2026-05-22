import { xmlText } from "../../../lib/hxml-components";
import {
  Behavior,
  Body,
  Doc,
  Screen,
  Style,
  Styles,
  Text,
  View,
} from "../../../lib/hxml-comps";

type Props = {
  actionPhrase: string;
  baseUrl: string;
};

const AuthModal = ({ actionPhrase, baseUrl }: Props) => {
  return (
    <Doc xmlns="https://hyperview.org/hyperview">
      <Screen>
        <Styles>{modalStyles()}</Styles>
        <Body style="auth-modal-body" scroll="false">
          <View style="auth-modal-top">
            <View style="auth-modal-close-hit">
              <Behavior action="close" href="#" />
              <Text style="auth-modal-close-label">Cancel</Text>
            </View>
          </View>
          <View style="auth-modal-card">
            <Text style="auth-modal-title">Sign in</Text>
            <Text style="auth-modal-subtitle">
              {xmlText(`Please log in or register ${actionPhrase}`)}
            </Text>
            <View style="auth-modal-primary-btn">
              <Behavior href={`${baseUrl}/hyperview/login`} />
              <Text style="auth-modal-primary-label">Log in</Text>
            </View>
            <View style="auth-modal-secondary-btn">
              <Behavior href={`${baseUrl}/hyperview/accounts`} />
              <Text style="auth-modal-secondary-label">Create account</Text>
            </View>
          </View>
        </Body>
      </Screen>
    </Doc>
  );
};

export default AuthModal;

const modalStyles = () => (
  <>
    <Style
      id="auth-modal-body"
      flex={1}
      backgroundColor="#f8f7f5"
      paddingLeft={20}
      paddingRight={20}
      paddingTop={64}
      paddingBottom={32}
    />
    <Style id="auth-modal-top" flexDirection="row" justifyContent="flex-end" />
    <Style
      id="auth-modal-close-hit"
      paddingTop={8}
      paddingBottom={8}
      paddingLeft={12}
      paddingRight={12}
    />
    <Style
      id="auth-modal-close-label"
      fontSize={16}
      color="#555555"
      fontWeight="600"
    />
    <Style
      id="auth-modal-card"
      backgroundColor="#ffffff"
      borderRadius={12}
      borderWidth={1}
      borderColor="#e8e8e6"
      padding={24}
      marginTop={8}
    />
    <Style
      id="auth-modal-title"
      fontSize={22}
      fontWeight="700"
      color="#111111"
      marginBottom={10}
    />
    <Style
      id="auth-modal-subtitle"
      fontSize={15}
      color="#555555"
      lineHeight={22}
      marginBottom={28}
    />
    <Style
      id="auth-modal-primary-btn"
      backgroundColor="#111111"
      borderRadius={10}
      paddingTop={16}
      paddingBottom={16}
      alignItems="center"
      marginBottom={12}
    />
    <Style
      id="auth-modal-primary-label"
      color="#ffffff"
      fontWeight="600"
      fontSize={16}
    />
    <Style
      id="auth-modal-secondary-btn"
      borderWidth={1}
      borderColor="#d1d5db"
      borderRadius={10}
      paddingTop={16}
      paddingBottom={16}
      alignItems="center"
      backgroundColor="#ffffff"
    />
    <Style
      id="auth-modal-secondary-label"
      color="#111111"
      fontWeight="600"
      fontSize={16}
    />
  </>
);
