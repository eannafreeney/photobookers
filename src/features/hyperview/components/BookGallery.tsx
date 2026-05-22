import {
  Behavior,
  GalleryHero,
  Image,
  ScrollView,
  Style,
  View,
} from "../../../lib/hxml-comps";

type Props = {
  galleryImages: string[];
};

const BookGallery = ({ galleryImages }: Props) => {
  const urls = galleryImages.filter((url): url is string => Boolean(url));
  if (urls.length === 0) return null;

  return (
    <view xmlns="https://hyperview.org/hyperview">
      <View style="gallery-stack">
        <GalleryHero id="gallery-hero-scroll" style="gallery-hero-scroll">
          {urls.map((url, i) => (
            <Image
              key={`slide-${i}`}
              source={url}
              style="gallery-hero-image"
              resize-mode="cover"
            />
          ))}
        </GalleryHero>
        <ScrollView style="gallery-thumbs" horizontal="true">
          {urls.map((url, i) => (
            <View key={`thumb-${i}`} style="gallery-thumb-cell">
              <Behavior
                action="scroll-to-index"
                target="gallery-hero-scroll"
                new-value={String(i)}
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
      id="gallery-hero-scroll"
      width="100%"
      height={320}
      backgroundColor="#f0f0ee"
    />
    <Style id="gallery-hero-image" width="100%" height={320} />
    <Style
      id="gallery-thumbs"
      flexDirection="row"
      height={56}
      marginTop={4}
      paddingLeft={4}
      paddingRight={4}
    />
    <Style
      id="gallery-thumb-cell"
      width={56}
      height={56}
      marginRight={4}
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
