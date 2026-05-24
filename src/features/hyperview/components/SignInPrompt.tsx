import { Behavior, Style, Text, View } from "../../../lib/hxml-comps";

type Props = {
  hint: string;
  baseUrl: string;
  loginHref?: string;
  accountsHref?: string;
  title?: string;
  buttonLabel?: string;
  createAccountLabel?: string;
  /** "fragment" wraps in tab-fragment for replace-inner targets; "inline" for page content */
  variant?: "fragment" | "inline";
};

const SignInPromptBody = ({
  hint,
  baseUrl,
  loginHref,
  accountsHref,
  title = "Sign in",
  buttonLabel = "Log in",
  createAccountLabel = "Create account",
}: Omit<Props, "variant">) => (
  <View style="sign-in-prompt">
    <View style="sign-in-prompt-card">
      <Text style="sign-in-prompt-title">{title}</Text>
      <Text style="sign-in-prompt-subtitle">{hint}</Text>
      <View style="sign-in-prompt-primary-btn">
        <Behavior href={loginHref ?? `${baseUrl}/hyperview/login`} />
        <Text style="sign-in-prompt-primary-label">{buttonLabel}</Text>
      </View>
      <View style="sign-in-prompt-secondary-btn">
        <Behavior href={accountsHref ?? `${baseUrl}/hyperview/accounts`} />
        <Text style="sign-in-prompt-secondary-label">{createAccountLabel}</Text>
      </View>
    </View>
  </View>
);

const SignInPrompt = ({
  hint,
  baseUrl,
  loginHref,
  accountsHref,
  title,
  buttonLabel,
  createAccountLabel,
  variant = "inline",
}: Props) => {
  const body = (
    <SignInPromptBody
      hint={hint}
      baseUrl={baseUrl}
      loginHref={loginHref}
      accountsHref={accountsHref}
      title={title}
      buttonLabel={buttonLabel}
      createAccountLabel={createAccountLabel}
    />
  );

  if (variant === "fragment") {
    return (
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        {body}
      </view>
    );
  }

  return body;
};

export default SignInPrompt;

export const signInPromptStyles = () => (
  <>
    <Style id="sign-in-prompt" flexDirection="column" />
    <Style
      id="sign-in-prompt-card"
      backgroundColor="#ffffff"
      borderRadius={12}
      borderWidth={1}
      borderColor="#e8e8e6"
      padding={16}
    />
    <Style
      id="sign-in-prompt-title"
      fontSize={22}
      fontWeight="700"
      color="#111111"
      marginBottom={10}
    />
    <Style
      id="sign-in-prompt-subtitle"
      fontSize={15}
      color="#555555"
      lineHeight={22}
      marginBottom={28}
    />
    <Style
      id="sign-in-prompt-primary-btn"
      backgroundColor="#111111"
      borderRadius={10}
      paddingTop={16}
      paddingBottom={16}
      alignItems="center"
      marginBottom={12}
    />
    <Style
      id="sign-in-prompt-primary-label"
      color="#ffffff"
      fontWeight="600"
      fontSize={16}
    />
    <Style
      id="sign-in-prompt-secondary-btn"
      borderWidth={1}
      borderColor="#d1d5db"
      borderRadius={10}
      paddingTop={16}
      paddingBottom={16}
      alignItems="center"
      backgroundColor="#ffffff"
    />
    <Style
      id="sign-in-prompt-secondary-label"
      color="#111111"
      fontWeight="600"
      fontSize={16}
    />
  </>
);
