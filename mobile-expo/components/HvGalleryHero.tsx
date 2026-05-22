import * as Namespaces from "hyperview/src/services/namespaces";
import { createStyleProp } from "hyperview/src/services";
import type { HvComponentProps } from "hyperview/src/types";
import { LOCAL_NAME } from "hyperview/src/types";
import React, { useCallback } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  View,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import urlParse from "url-parse";
import { registerScrollRef } from "../lib/scrollRefRegistry";

const slideWidth = Dimensions.get("window").width;

const HvGalleryHero = (props: HvComponentProps) => {
  const { element, stylesheets, options } = props;
  const id = element.getAttribute("id");
  const { screenUrl } = options;

  const scrollStyle = createStyleProp(
    element,
    stylesheets,
    options,
  ) as StyleProp<ViewStyle>;

  const images = Array.from(
    element.getElementsByTagNameNS(Namespaces.HYPERVIEW, LOCAL_NAME.IMAGE),
  );

  const setScrollRef = useCallback(
    (node: ScrollView | null) => {
      if (id) registerScrollRef(id, node);
    },
    [id],
  );

  return (
    <ScrollView
      ref={setScrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={scrollStyle}
    >
      {images.map((imgEl, i) => {
        const source = imgEl.getAttribute("source");
        if (!source) return null;

        const imageStyle = createStyleProp(
          imgEl,
          stylesheets,
          options,
        ) as StyleProp<ImageStyle>;

        return (
          <View key={i} style={{ width: slideWidth, height: 320 }}>
            <Image
              source={{ uri: urlParse(source, screenUrl, true).toString() }}
              style={[imageStyle, { width: slideWidth, height: 320 }]}
              resizeMode="cover"
            />
          </View>
        );
      })}
    </ScrollView>
  );
};

HvGalleryHero.namespaceURI = Namespaces.HYPERVIEW;
HvGalleryHero.localName = "gallery-hero";
HvGalleryHero.supportsHyperRef = true;

export default HvGalleryHero;
