import { createRoute } from "hono-fsr";
import type { Context } from "hono";
import { formValidator } from "../../../lib/validator";
import { loginFormSchema } from "../../../features/auth/schema";
import {
  getMustResetPasswordState,
  loginAndSetCookies,
} from "../../../features/auth/services";
import { getUser } from "../../../utils";
import { getBaseUrl } from "../../../lib/hyperview";
import { hyperview } from "../../../lib/hxml";
import { xmlText } from "../../../lib/hxml";
import { AppLayout } from "../+layout";
import {
  Behavior,
  Form,
  Style,
  Text,
  TextField,
  View,
} from "../../../lib/hxml-comps";

export const GET = createRoute(async (c: Context) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  if (user) return c.redirect(`${baseUrl}/hyperview/featured`);

  const hv = hyperview(c);
  return hv(
    <AppLayout title="Sign in" showBackButton extraStyles={pageStyles()}>
      <LoginFormBody baseUrl={baseUrl} />
    </AppLayout>,
  );
});

export const POST = createRoute(formValidator(loginFormSchema), async (c) => {
  const baseUrl = getBaseUrl(c);
  const hv = hyperview(c);
  const form = c.req.valid("form");
  const email = form.email as string;
  const password = form.password as string;

  console.log(email, password, "email, password");

  const [loginErr, login] = await loginAndSetCookies(c, email, password);

  console.log(loginErr, login, "loginErr, login");

  if (loginErr || !login) {
    return hv(
      <AppLayout title="Sign in" showBackButton extraStyles={pageStyles()}>
        <LoginFormBody
          baseUrl={baseUrl}
          error="Invalid email or password. Try again."
        />
      </AppLayout>,
      401,
    );
  }

  const [mustErr] = await getMustResetPasswordState(login.userId);
  if (mustErr) {
    return hv(
      <AppLayout title="Sign in" showBackButton extraStyles={pageStyles()}>
        <LoginFormBody
          baseUrl={baseUrl}
          error="Something went wrong. Try again later."
        />
      </AppLayout>,
      500,
    );
  }

  const [, mustReset] = await getMustResetPasswordState(login.userId);
  if (mustReset) {
    const resetUrl = `${baseUrl}/auth/force-reset-password?redirectUrl=${encodeURIComponent(`${baseUrl}/hyperview/featured`)}`;
    return hv(
      <AppLayout
        title="Password reset"
        showBackButton
        extraStyles={pageStyles()}
      >
        <View style="login-page">
          <Text style="login-hint">
            You must set a new password before continuing.
          </Text>
          <View style="login-submit-wrap">
            <Text style="login-submit-label">Open reset in browser</Text>
            <Behavior trigger="press" action="deep-link" href={resetUrl} />
          </View>
        </View>
      </AppLayout>,
    );
  }

  return hv(
    <view xmlns="https://hyperview.org/hyperview">
      <Behavior
        trigger="load"
        action="navigate"
        href={`${baseUrl}/hyperview/featured`}
      />
    </view>,
  );

  return c.redirect(`${baseUrl}/hyperview/featured`, 303);

  return hv(
    <AppLayout title="Signed in" showBackButton extraStyles={pageStyles()}>
      <View style="login-page">
        <Text style="login-success">You are signed in.</Text>
        <Behavior
          trigger="load"
          action="push"
          href={`${baseUrl}/hyperview/featured`}
        />
      </View>
    </AppLayout>,
  );
});

const LoginFormBody = ({
  baseUrl,
  error,
}: {
  baseUrl: string;
  error?: string;
}) => (
  <View style="login-page">
    {error ? <Text style="login-error">{xmlText(error)}</Text> : null}
    <Form id="hv-login-form">
      <Text style="login-label">Email</Text>
      <TextField
        style="login-field"
        name="email"
        placeholder="you@example.com"
        keyboard-type="email-address"
      />
      <Text style="login-label">Password</Text>
      <TextField
        style="login-field"
        name="password"
        placeholder="Password"
        secure-text-entry="true"
      />
      <View style="login-submit-wrap">
        <Text style="login-submit-label">Sign in</Text>
        <Behavior
          trigger="press"
          action="replace-inner"
          verb="post"
          href={`${baseUrl}/hyperview/login`}
        />
      </View>
    </Form>
  </View>
);

const pageStyles = () => (
  <>
    <Style
      id="login-page"
      marginLeft={16}
      marginRight={16}
      paddingTop={24}
      flexDirection="column"
    />
    <Style
      id="login-label"
      fontSize={13}
      fontWeight="600"
      color="#444444"
      marginBottom={6}
      marginTop={12}
    />
    <Style
      id="login-field"
      borderWidth={1}
      borderColor="#e5e5e5"
      borderRadius={8}
      paddingTop={12}
      paddingBottom={12}
      paddingLeft={12}
      paddingRight={12}
      fontSize={15}
      backgroundColor="#ffffff"
      marginBottom={4}
      textTransform="lowercase"
    />
    <Style
      id="login-submit-wrap"
      marginTop={24}
      backgroundColor="#111111"
      borderRadius={8}
      paddingTop={14}
      paddingBottom={14}
      alignItems="center"
    />
    <Style
      id="login-submit-label"
      color="#ffffff"
      fontWeight="600"
      fontSize={16}
    />
    <Style id="login-error" fontSize={14} color="#b91c1c" marginBottom={12} />
    <Style
      id="login-hint"
      fontSize={14}
      color="#444444"
      lineHeight={22}
      marginBottom={16}
    />
    <Style id="login-success" fontSize={16} fontWeight="600" color="#111111" />
  </>
);
