import { createRoute } from "hono-fsr";
import type { Context } from "hono";
import { capitalize, getUser } from "../../../utils";
import { getBaseUrl } from "../../../lib/hyperview";
import { hyperview } from "../../../lib/hxml";
import { xmlText } from "../../../lib/hxml";
import { AppLayout } from "../+layout";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps";

type RegisterType = "fan" | "artist" | "publisher";

function parseRegisterType(raw: string | undefined): RegisterType {
  if (raw === "fan" || raw === "artist" || raw === "publisher") return raw;
  return "fan";
}

export const GET = createRoute(async (c: Context) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  if (user) return c.redirect(`${baseUrl}/hyperview/featured`);

  const registerType = parseRegisterType(c.req.query("type"));
  const redirectUrl = (c.req.query("redirectUrl") ?? "").trim().slice(0, 2000);
  const isCreator = registerType === "artist" || registerType === "publisher";

  const params = new URLSearchParams();
  params.set("type", registerType);
  if (redirectUrl) params.set("redirectUrl", redirectUrl);
  const webRegisterUrl = `${baseUrl}/auth/register?${params.toString()}`;

  const headline =
    registerType === "fan"
      ? "Create account"
      : `Create ${capitalize(registerType)} account`;

  const intro = isCreator
    ? "You will finish creating your artist or publisher account in the browser. That step includes email verification and a short security check."
    : "You will finish creating your fan account in the browser. That step includes email verification and a short security check.";

  const bullets = isCreator
    ? [
        "Display name",
        "Website (optional)",
        "Email and password",
        "Terms acceptance",
        "Security verification",
      ]
    : [
        "First and last name",
        "Email and password",
        "Terms acceptance",
        "Security verification",
      ];

  const hv = hyperview(c);
  return hv(
    <AppLayout title="Create account" showBackButton extraStyles={pageStyles()}>
      <View style="register-page">
        <Text style="register-headline">{xmlText(headline)}</Text>
        <Text style="register-intro">{xmlText(intro)}</Text>
        {bullets.map((line) => (
          <Text key={line} style="register-bullet">
            {xmlText(`• ${line}`)}
          </Text>
        ))}
        <View style="register-primary-wrap">
          <Text style="register-primary-label">Continue in browser</Text>
          <Behavior trigger="press" action="deep-link" href={webRegisterUrl} />
        </View>
        <View style="register-secondary-wrap">
          <Text style="register-secondary-label">Already have an account?</Text>
          <Behavior
            trigger="press"
            action="push"
            href={`${baseUrl}/hyperview/login`}
          />
        </View>
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    <Style
      id="register-page"
      marginLeft={16}
      marginRight={16}
      paddingTop={16}
      paddingBottom={32}
      flexDirection="column"
    />
    <Style
      id="register-headline"
      fontSize={22}
      fontWeight="700"
      color="#111111"
      marginBottom={12}
    />
    <Style
      id="register-intro"
      fontSize={15}
      color="#555555"
      lineHeight={22}
      marginBottom={16}
    />
    <Style
      id="register-bullet"
      fontSize={14}
      color="#444444"
      lineHeight={22}
      marginBottom={6}
    />
    <Style
      id="register-primary-wrap"
      marginTop={24}
      backgroundColor="#111111"
      borderRadius={10}
      paddingTop={14}
      paddingBottom={14}
      alignItems="center"
    />
    <Style
      id="register-primary-label"
      color="#ffffff"
      fontWeight="600"
      fontSize={16}
    />
    <Style
      id="register-secondary-wrap"
      marginTop={20}
      borderWidth={1}
      borderColor="#d1d5db"
      borderRadius={10}
      paddingTop={14}
      paddingBottom={14}
      alignItems="center"
      backgroundColor="#ffffff"
    />
    <Style
      id="register-secondary-label"
      color="#111111"
      fontWeight="600"
      fontSize={16}
    />
  </>
);
