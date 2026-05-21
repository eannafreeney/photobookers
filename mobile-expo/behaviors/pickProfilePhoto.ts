import * as ImagePicker from "expo-image-picker";
import { Parser } from "hyperview/src/services/dom";
import { HTTP_METHODS } from "hyperview/src/services/dom/types";
import { getElementById } from "hyperview/src/services/dom/helpers";
import { performUpdate } from "hyperview/src/services/behaviors";
import { NO_OP } from "hyperview/src/types";
import type { HvBehavior } from "hyperview";

export function createPickProfilePhotoBehavior(
  getFetch: () => typeof fetch,
): HvBehavior {
  return {
    action: "pick-profile-photo",
    callback: async (element, _onUpdate, getRoot, updateRoot) => {
      const href = element.getAttribute("href");
      const targetId = element.getAttribute("target");
      if (!href || !targetId) {
        console.warn("pick-profile-photo: missing href or target");
        return;
      }

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        console.warn("pick-profile-photo: media library permission denied");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      const formData = new FormData();
      formData.append(
        "userImageProfile",
        {
          uri: asset.uri,
          name: "profile.jpg",
          type: asset.mimeType ?? "image/jpeg",
        } as unknown as Blob,
      );

      try {
        const parser = new Parser(getFetch(), null, null);
        const loaded = await parser.loadElement(
          href,
          formData,
          HTTP_METHODS.POST,
          undefined,
          undefined,
        );

        if (loaded === NO_OP) return;

        const { doc } = loaded;
        const newElement = doc.documentElement;
        const root = getRoot();
        if (!root) return;

        const targetElement = getElementById(root, targetId);
        if (!targetElement) {
          console.warn(`pick-profile-photo: target #${targetId} not found`);
          return;
        }

        updateRoot(performUpdate("replace", targetElement, newElement));
      } catch (error) {
        console.error("pick-profile-photo: upload failed", error);
      }
    },
  };
}
