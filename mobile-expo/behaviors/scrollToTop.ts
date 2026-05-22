import type { HvBehavior } from "hyperview";
import { scrollToTop } from "../lib/scrollRefRegistry";

const SCROLL_NS = "https://hyperview.org/hyperview-scroll";

export const scrollToTopBehavior: HvBehavior = {
  action: "scroll-to-top",
  callback: (element) => {
    const target = element.getAttribute("target");
    if (!target) return;

    const animated =
      element.getAttributeNS(SCROLL_NS, "animated") !== "false";
    scrollToTop(target, animated);
  },
};
