import { FC } from "hono/jsx";
import {
  Behavior,
  Image,
  ScrollView,
  Style,
  Text,
  View,
} from "../../../lib/hxml-comps";
import { getThisWeeksBookOfTheWeek } from "../../app/BOTWServices";
import {
  getThisWeeksArtistOfTheWeek,
  getThisWeeksPublisherOfTheWeek,
} from "../../app/CreatorSpotlightServices";
import {
  buildHeroCarouselItems,
  loadHeroCarouselCoverStacks,
} from "../../app/utils";

type HeroCarouselProps = {
  baseUrl?: string;
};

const HeroCarousel: FC<HeroCarouselProps> = async ({ baseUrl = "" }) => {
  const [bookRes, artistRes, publisherRes] = await Promise.all([
    getThisWeeksBookOfTheWeek(),
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek(),
  ]);

  const [bookErr, bookOfTheWeek] = bookRes;
  const [artistErr, artistOfTheWeek] = artistRes;
  const [publisherErr, publisherOfTheWeek] = publisherRes;

  const { publisherCoverStack, artistCoverStack } =
    await loadHeroCarouselCoverStacks({
      publisherCreatorId:
        !publisherErr && publisherOfTheWeek
          ? publisherOfTheWeek.creatorId
          : null,
      artistCreatorId:
        !artistErr && artistOfTheWeek ? artistOfTheWeek.creatorId : null,
    });

  const items = buildHeroCarouselItems(
    bookErr ? null : bookOfTheWeek,
    artistErr ? null : artistOfTheWeek,
    publisherErr ? null : publisherOfTheWeek,
    publisherCoverStack,
    artistCoverStack,
  );

  if (!items.length) return <></>;

  return (
    <ScrollView
      style="hero-carousel"
      horizontal="true"
      shows-scroll-indicator="false"
    >
      {items.map((item, i) => {
        const image = item.coverStack?.[0] ?? item.image;
        const detailUrl = `${baseUrl}/hyperview${item.link}`;

        return (
          <View key={String(i)} style="hero-slide">
            <Behavior trigger="press" action="push" href={detailUrl} />
            {image && (
              <Image
                source={image}
                style="hero-slide-image"
                resize-mode="cover"
              />
            )}
            <View style="hero-slide-body">
              <Text style="hero-slide-label">{item.label}</Text>
              <Text style="hero-slide-title">{item.title}</Text>
              {item.text && <Text style="hero-slide-text">{item.text}</Text>}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

export default HeroCarousel;

export const heroCarouselStyles = () => (
  <>
    <Style id="hero-carousel" flexDirection="row" marginBottom={24} />
    <Style
      id="hero-slide"
      width={300}
      marginRight={12}
      borderRadius={12}
      overflow="hidden"
      backgroundColor="#f5f5f5"
    />
    <Style id="hero-slide-image" width={300} height={200} />
    <Style id="hero-slide-body" padding={14} flexDirection="column" gap={4} />
    <Style id="hero-slide-label" fontSize={11} color="#666666" />
    <Style
      id="hero-slide-title"
      fontSize={17}
      fontWeight="700"
      color="#111111"
    />
    <Style id="hero-slide-text" fontSize={13} color="#444444" />
  </>
);
