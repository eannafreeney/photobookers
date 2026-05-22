import { createRoute } from "hono-fsr";
import type { Context } from "hono";
import { loginFormSchema } from "../../../features/auth/schema";
import {
  getMustResetPasswordState,
  loginAndSetCookies,
} from "../../../features/auth/services";
import { getIsHyperview } from "../../../features/hyperview/lib";
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

/** Target for login form POST responses (`action="replace"`). */
export const LOGIN_FORM_PANEL_ID = "login-form-panel";

export const GET = createRoute(async (c: Context) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const featured = `${baseUrl}/hyperview/featured`;
  // Web only: skip login when already authenticated. Hyperview always shows the
  // form so a stale client Bearer after logout cannot bounce back to featured.
  if (user && !getIsHyperview(c)) {
    return c.redirect(featured);
  }

  return hv(
    <AppLayout title="Sign in" showBackButton extraStyles={pageStyles()}>
      <LoginFormPanel baseUrl={baseUrl} />
    </AppLayout>,
  );
});

export const POST = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const form = await c.req.parseBody();
  const parsed = loginFormSchema.safeParse(form);
  const isHyperview = getIsHyperview(c);

  if (!parsed.success) {
    return hv(
      <LoginFormPanel
        baseUrl={baseUrl}
        error="Enter a valid email and password (at least 8 characters)."
      />,
      400,
    );
  }

  const { email, password } = parsed.data;

  const [loginErr, login] = await loginAndSetCookies(c, email, password);

  if (loginErr || !login) {
    return hv(
      <LoginFormPanel
        baseUrl={baseUrl}
        error="Invalid email or password. Try again."
      />,
      401,
    );
  }

  const [mustErr, mustReset] = await getMustResetPasswordState(login.userId);
  if (mustErr) {
    return hv(
      <LoginFormPanel
        baseUrl={baseUrl}
        error="Something went wrong. Try again later."
      />,
      500,
    );
  }

  if (mustReset) {
    const resetUrl = `${baseUrl}/auth/force-reset-password?redirectUrl=${encodeURIComponent(`${baseUrl}/hyperview/featured`)}`;
    return hv(
      <View
        id={LOGIN_FORM_PANEL_ID}
        style="login-page"
        xmlns="https://hyperview.org/hyperview"
      >
        <Text style="login-hint">
          You must set a new password before continuing.
        </Text>
        <View style="login-submit-wrap">
          <Behavior trigger="press" action="deep-link" href={resetUrl} />
          <Text style="login-submit-label">Open reset in browser</Text>
        </View>
      </View>,
    );
  }

  if (isHyperview) {
    const featured = `${baseUrl}/hyperview/featured`;
    return hv(
      <View xmlns="https://hyperview.org/hyperview">
        <Behavior
          trigger="load"
          action="set-supabase-session"
          href={featured}
          access-token={xmlText(login.session.access_token)}
          refresh-token={xmlText(login.session.refresh_token)}
        />
      </View>,
    );
  }

  return c.redirect(`${baseUrl}/hyperview/featured`);
});

const LoginFormPanel = ({
  baseUrl,
  error,
}: {
  baseUrl: string;
  error?: string;
}) => (
  <View
    id={LOGIN_FORM_PANEL_ID}
    style="login-page"
    xmlns="https://hyperview.org/hyperview"
  >
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
        secure-text="true"
        text-content-type="password"
      />
      <View style="login-submit-wrap">
        <Behavior
          trigger="press"
          verb="post"
          action="replace"
          target={LOGIN_FORM_PANEL_ID}
          href={`${baseUrl}/hyperview/login`}
        />
        <Text style="login-submit-label">Sign in</Text>
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
      color="#111111"
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
      alignSelf="stretch"
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
