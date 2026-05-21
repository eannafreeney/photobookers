import { createRoute } from "hono-fsr";
import { hyperview } from "../../../../../lib/hxml";
import { TERMS_SECTIONS } from "../../../../../features/legal/termsContent";
import LegalText from "../../../../../features/hyperview/components/LegalText";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      <LegalText sections={TERMS_SECTIONS} />
    </view>,
  );
});
