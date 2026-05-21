import { Platform, Share } from "react-native";
import type { HvBehavior } from "hyperview";

const SHARE_NS = "https://hyperview.org/share";

function getShareAttr(element: Element, name: string): string | null {
  return (
    element.getAttributeNS(SHARE_NS, name) ??
    element.getAttribute(`share:${name}`)
  );
}

export const shareBookBehavior: HvBehavior = {
  action: "share",
  callback: async (element) => {
    const url = getShareAttr(element, "url")?.trim();
    const message = getShareAttr(element, "message")?.trim();
    const title = getShareAttr(element, "title")?.trim();

    if (!url && !message) {
      console.warn("share: missing url and message");
      return;
    }

    const shareMessage =
      message && url
        ? Platform.OS === "android"
          ? `${message}\n${url}`
          : message
        : (message ?? url ?? "");

    try {
      await Share.share(
        {
          message: shareMessage,
          url: Platform.OS === "ios" ? url : undefined,
          title: title ?? undefined,
        },
        title ? { dialogTitle: title, subject: title } : undefined,
      );
    } catch (error) {
      console.warn("share failed", error);
    }
  },
};
