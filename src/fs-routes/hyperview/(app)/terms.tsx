import { createRoute } from "hono-fsr";
import { TERMS_SECTIONS } from "../../../features/legal/termsContent";
import { AppLayout } from "../+layout";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import { hyperview } from "../../../lib/hxml";
import LegalText from "../../../features/hyperview/components/LegalText";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

  return hv(
    <AppLayout
      title="Terms and Conditions"
      user={user}
      showDock
      baseUrl={baseUrl}
      dockActive="about"
    >
      <view id="page-content" style="page-content">
        <LegalText sections={TERMS_SECTIONS} />
      </view>
    </AppLayout>,
  );
});
