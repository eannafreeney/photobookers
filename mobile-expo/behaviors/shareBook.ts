import { Alert, Platform, Share } from "react-native";
import type { HvBehavior } from "hyperview";

const SHARE_NS = "https://hyperview.org/share";

function getShareAttr(element: Element, name: string): string | null {
  const hyphen = element.getAttribute(`share-${name}`);
  if (hyphen) return hyphen;

  const colon = element.getAttribute(`share:${name}`);
  if (colon) return colon;

  return element.getAttributeNS(SHARE_NS, name);
}

export const shareBookBehavior: HvBehavior = {
  action: "share",
  callback: async (element) => {
    const url =
      getShareAttr(element, "url")?.trim() ??
      element.getAttribute("href")?.trim() ??
      null;
    const message = getShareAttr(element, "message")?.trim() ?? null;
    const title = getShareAttr(element, "title")?.trim() ?? null;

    if (!url && !message) {
      if (__DEV__) {
        Alert.alert(
          "Share failed",
          "Missing share URL and message in the behavior element.",
        );
      }
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
      const content =
        Platform.OS === "ios" && url
          ? { url, message: message || undefined, title: title || undefined }
          : { message: shareMessage, title: title || undefined };

      const result = await Share.share(
        content,
        title ? { dialogTitle: title, subject: title } : undefined,
      );

      if (result.action === Share.dismissedAction && __DEV__) {
        console.log("share dismissed");
      }
    } catch (error) {
      if (__DEV__) {
        Alert.alert("Share failed", String(error));
      }
      console.warn("share failed", error);
    }
  },
};
