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
      backgroundColor="#fbfaf7"
      borderRadius={12}
      borderWidth={1}
      borderColor="#e4e0d5"
      padding={16}
    />
    <Style
      id="sign-in-prompt-title"
      fontFamily="Fraunces-SemiBold"
      fontSize={22}
      color="#191613"
      marginBottom={10}
    />
    <Style
      id="sign-in-prompt-subtitle"
      fontSize={15}
      color="#45413a"
      lineHeight={22}
      marginBottom={28}
    />
    <Style
      id="sign-in-prompt-primary-btn"
      backgroundColor="#191613"
      borderRadius={0}
      paddingTop={16}
      paddingBottom={16}
      alignItems="center"
      marginBottom={12}
    />
    <Style
      id="sign-in-prompt-primary-label"
      color="#fbfaf7"
      fontWeight="600"
      fontSize={16}
    />
    <Style
      id="sign-in-prompt-secondary-btn"
      borderWidth={1}
      borderColor="#a39d90"
      borderRadius={0}
      paddingTop={16}
      paddingBottom={16}
      alignItems="center"
      backgroundColor="#fbfaf7"
    />
    <Style
      id="sign-in-prompt-secondary-label"
      color="#191613"
      fontWeight="600"
      fontSize={16}
    />
  </>
);
