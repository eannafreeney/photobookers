import { createRoute } from "hono-fsr";
import type { Context } from "hono";
import { getUser } from "../../../utils";
import { getBaseUrl } from "../../../lib/hyperview";
import { hyperview } from "../../../lib/hxml";
import { xmlText } from "../../../lib/hxml";
import { accountMobileCards } from "../../../features/auth/accountsContent";
import { AppLayout } from "../+layout";
import { Behavior, Style, Text, View } from "../../../lib/hxml-comps";

export const GET = createRoute(async (c: Context) => {
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  if (user) return c.redirect(`${baseUrl}/hyperview/featured`);

  const hv = hyperview(c);
  return hv(
    <AppLayout title="Accounts" showBackButton extraStyles={pageStyles()}>
      <View style="accounts-page">
        <Text style="accounts-section-title">Accounts</Text>
        <Text style="accounts-lead">
          Pick an account type, then sign up in your browser.
        </Text>
        {accountMobileCards.map((card) => (
          <View key={card.slug} style="accounts-card">
            <Text style="accounts-type-title">{xmlText(card.type)}</Text>
            {card.features.map((f) => (
              <Text key={f.name} style="accounts-feature">
                {xmlText(`• ${f.name}`)}
              </Text>
            ))}
            <View style="accounts-signup-wrap">
              <Text style="accounts-signup-label">Sign up</Text>
              <Behavior
                href={`${baseUrl}/hyperview/register?type=${card.slug}`}
              />
            </View>
          </View>
        ))}
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    <Style
      id="accounts-page"
      marginLeft={16}
      marginRight={16}
      paddingTop={16}
      paddingBottom={32}
      flexDirection="column"
    />
    <Style
      id="accounts-section-title"
      fontSize={22}
      fontWeight="700"
      color="#111111"
      marginBottom={8}
    />
    <Style
      id="accounts-lead"
      fontSize={15}
      color="#555555"
      lineHeight={22}
      marginBottom={20}
    />
    <Style
      id="accounts-card"
      backgroundColor="#ffffff"
      borderRadius={12}
      borderWidth={1}
      borderColor="#e8e8e6"
      padding={16}
      marginBottom={16}
      flexDirection="column"
    />
    <Style
      id="accounts-type-title"
      fontSize={18}
      fontWeight="700"
      color="#111111"
      marginBottom={12}
    />
    <Style
      id="accounts-feature"
      fontSize={14}
      color="#444444"
      lineHeight={22}
      marginBottom={4}
    />
    <Style
      id="accounts-signup-wrap"
      marginTop={16}
      backgroundColor="#111111"
      borderRadius={10}
      paddingTop={14}
      paddingBottom={14}
      alignItems="center"
    />
    <Style
      id="accounts-signup-label"
      color="#ffffff"
      fontWeight="600"
      fontSize={16}
    />
  </>
);
