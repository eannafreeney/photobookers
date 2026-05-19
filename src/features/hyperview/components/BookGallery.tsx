import { Behavior, Image, Style, View } from "../../../lib/hxml-comps";
import { ScrollView } from "../../../lib/hxml-comps";

type Props = {
  galleryImages: string[];
};

const BookGallery = ({ galleryImages }: Props) => {
  const urls = galleryImages.filter((url): url is string => Boolean(url));
  if (urls.length === 0) return null;

  return (
    <view xmlns="https://hyperview.org/hyperview">
      <View style="gallery-stack">
        <View id="gallery-hero-slot" style="gallery-hero-wrap">
          <Image
            source={urls[0]!}
            style="gallery-hero-image"
            resize-mode="cover"
          />
        </View>
        <View hide="true">
          {urls.map((url, i) => (
            <View key={`frag-${i}`} id={`gallery-hero-frag-${i}`}>
              <Image
                source={url}
                style="gallery-hero-image"
                resize-mode="cover"
              />
            </View>
          ))}
        </View>
        <ScrollView style="gallery-thumbs" horizontal="true">
          {urls.map((url, i) => (
            <View key={`thumb-${i}`} style="gallery-thumb-cell">
              <Behavior
                trigger="press"
                action="replace-inner"
                target="gallery-hero-slot"
                href={`#gallery-hero-frag-${i}`}
              />
              <Image
                source={url}
                style="gallery-thumb-image"
                resize-mode="cover"
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </view>
  );
};

export default BookGallery;

export const bookGalleryStyles = () => (
  <>
    <Style id="gallery-stack" marginLeft={-16} marginRight={-16} />
    <Style
      id="gallery-hero-wrap"
      width="100%"
      height={320}
      backgroundColor="#f0f0ee"
    />
    <Style id="gallery-hero-image" width="100%" height={320} />
    <Style
      id="gallery-thumbs"
      flexDirection="row"
      height={56}
      marginTop={0}
      paddingLeft={0}
      paddingRight={0}
    />
    <Style
      id="gallery-thumb-cell"
      width={56}
      height={56}
      marginRight={0}
      alignItems="center"
      justifyContent="center"
    />
    <Style
      id="gallery-thumb-image"
      width={56}
      height={56}
      borderRadius={0}
      borderWidth={0}
      opacity={0.85}
    />
    <Style
      id="gallery-thumb-selected"
      width={56}
      height={56}
      borderRadius={0}
      borderWidth={0}
      opacity={1}
    />
  </>
);
