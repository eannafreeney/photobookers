import { createRoute } from "hono-fsr";
import { AppLayout } from "../+layout";
import { getBaseUrl } from "../../../lib/hyperview";
import { getUser } from "../../../utils";
import { hyperview } from "../../../lib/hxml";
import LegalText from "../../../features/hyperview/components/LegalText";
import { PRIVACY_SECTIONS } from "../../../features/legal/privacyContent";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

  return hv(
    <AppLayout
      title="Privacy Policy"
      user={user}
      showDock
      baseUrl={baseUrl}
      dockActive="about"
    >
      <view id="page-content" style="page-content">
        <LegalText sections={PRIVACY_SECTIONS} />
      </view>
    </AppLayout>,
  );
});
