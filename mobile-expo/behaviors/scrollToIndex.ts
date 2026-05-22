import type { HvBehavior } from "hyperview";
import { scrollToIndex } from "../lib/scrollRefRegistry";

const SCROLL_NS = "https://hyperview.org/hyperview-scroll";

export const scrollToIndexBehavior: HvBehavior = {
  action: "scroll-to-index",
  callback: (element) => {
    const target = element.getAttribute("target");
    if (!target) return;

    const index = Number.parseInt(element.getAttribute("new-value") ?? "", 10);
    if (Number.isNaN(index) || index < 0) return;

    const animated =
      element.getAttributeNS(SCROLL_NS, "animated") !== "false";
    scrollToIndex(target, index, animated);
  },
};
