import { FC } from "hono/jsx";
import {
  Behavior,
  Image,
  ScrollView,
  Style,
  Text,
  View,
} from "../../../lib/hxml-comps";

export type FeaturedSpotlightItem = {
  id: string;
  label: string;
  title: string;
  imageUrl: string | null;
  href: string;
};

type CardProps = FeaturedSpotlightItem;

const FeaturedSpotlightCard: FC<CardProps> = ({
  label,
  title,
  imageUrl,
  href,
}) => (
  <View style="featured-spotlight-card">
    <Behavior href={href} />
    {imageUrl ? (
      <Image
        source={imageUrl}
        style="featured-spotlight-card-image"
        resize-mode="cover"
      />
    ) : (
      <View style="featured-spotlight-card-placeholder" />
    )}
    <View style="featured-spotlight-card-overlay">
      <Text style="featured-spotlight-card-label">{label.toUpperCase()}</Text>
      <Text style="featured-spotlight-card-title">{title}</Text>
    </View>
  </View>
);

type Props = {
  items: FeaturedSpotlightItem[];
};

const FeaturedSpotlightCarousel: FC<Props> = ({ items }) => {
  if (items.length === 0) return <></>;

  return (
    <View style="featured-spotlight-carousel">
      <ScrollView
        style="featured-spotlight-scroll"
        horizontal="true"
        shows-scroll-indicator="false"
      >
        {items.map((item) => (
          <FeaturedSpotlightCard key={item.id} {...item} />
        ))}
      </ScrollView>
    </View>
  );
};

export default FeaturedSpotlightCarousel;

export const featuredSpotlightCarouselStyles = () => (
  <>
    <Style id="featured-spotlight-carousel" />
    <Style id="featured-spotlight-scroll" flexDirection="row" />
    <Style
      id="featured-spotlight-card"
      width={220}
      height={280}
      borderRadius={0}
      overflow="hidden"
      marginRight={12}
    />
    <Style id="featured-spotlight-card-image" width={220} height={280} />
    <Style
      id="featured-spotlight-card-placeholder"
      width={220}
      height={280}
      backgroundColor="#e4e0d5"
    />
    <Style
      id="featured-spotlight-card-overlay"
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0,0,0,0.45)"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-end"
      padding={16}
      gap={4}
    />
    <Style
      id="featured-spotlight-card-label"
      fontSize={10}
      fontWeight="600"
      letterSpacing={2}
      color="rgba(255,255,255,0.8)"
      textAlign="center"
    />
    <Style
      id="featured-spotlight-card-title"
      fontFamily="Fraunces-Medium"
      fontSize={19}
      color="#fbfaf7"
      textAlign="center"
    />
  </>
);
