import { Behavior, Style, Text, View } from "../../../lib/hxml-comps";

type Props = {
  hint: string;
  baseUrl: string;
  loginHref?: string;
  buttonLabel?: string;
  /** "fragment" wraps in tab-fragment for replace-inner targets; "inline" for page content */
  variant?: "fragment" | "inline";
};

const SignInPromptBody = ({
  hint,
  baseUrl,
  loginHref,
  buttonLabel = "Sign in",
}: Omit<Props, "variant">) => (
  <View style="sign-in-prompt">
    <Text style="featured-signin-hint">{hint}</Text>
    <View style="sign-in-prompt-btn">
      <Text style="sign-in-prompt-btn-label">{buttonLabel}</Text>
      <Behavior
        trigger="press"
        action="push"
        href={loginHref ?? `${baseUrl}/hyperview/login`}
      />
    </View>
  </View>
);

const SignInPrompt = ({
  hint,
  baseUrl,
  loginHref,
  buttonLabel,
  variant = "inline",
}: Props) => {
  const body = (
    <SignInPromptBody
      hint={hint}
      baseUrl={baseUrl}
      loginHref={loginHref}
      buttonLabel={buttonLabel}
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
    <Style id="sign-in-prompt" flexDirection="column" padding={16} />
    <Style
      id="sign-in-prompt-btn"
      marginTop={20}
      backgroundColor="#111111"
      borderRadius={10}
      paddingTop={14}
      paddingBottom={14}
      alignItems="center"
    />
    <Style
      id="sign-in-prompt-btn-label"
      color="#ffffff"
      fontWeight="600"
      fontSize={16}
    />
  </>
);
