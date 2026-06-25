import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";
import { BookStore } from "../../../db/schema";

type Props = {
  store: BookStore;
  href: string;
  variant?: "carousel" | "list";
};

const formatLocation = (store: {
  city?: string | null;
  country?: string | null;
}) => [store.city, store.country].filter(Boolean).join(", ");

const StoreCard = ({ store, href, variant = "carousel" }: Props) => {
  const location = formatLocation(store);
  const cardStyle = variant === "list" ? "store-list-card" : "store-card";
  const imageStyle =
    variant === "list" ? "store-list-card-image" : "store-card-image";
  const overlayStyle =
    variant === "list" ? "store-list-card-overlay" : "store-card-overlay";

  return (
    <View key={store.id} style={cardStyle}>
      <Behavior href={href} />
      {store.coverUrl ? (
        <Image
          source={store.coverUrl}
          style={imageStyle}
          resize-mode="cover"
        />
      ) : (
        <View style={imageStyle} />
      )}
      <View style={overlayStyle}>
        <Text style="store-card-eyebrow">BOOKSTORE</Text>
        <Text style="store-card-name">{store.name}</Text>
        {location ? (
          <Text style="store-card-location">{location}</Text>
        ) : null}
      </View>
    </View>
  );
};

export default StoreCard;

export const storeCardStyles = () => (
  <>
    <Style
      id="store-card"
      width={220}
      height={256}
      overflow="hidden"
      marginRight={12}
      backgroundColor="#e4e0d5"
    />
    <Style
      id="store-card-image"
      width={220}
      height={256}
      backgroundColor="#e4e0d5"
    />
    <Style
      id="store-list-card"
      width="100%"
      height={280}
      overflow="hidden"
      marginBottom={16}
      backgroundColor="#e4e0d5"
    />
    <Style
      id="store-list-card-image"
      width="100%"
      height={280}
      backgroundColor="#e4e0d5"
    />
    <Style
      id="store-card-overlay"
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0,0,0,0.45)"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      padding={16}
      gap={4}
    />
    <Style
      id="store-list-card-overlay"
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="rgba(0,0,0,0.45)"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      padding={16}
      gap={4}
    />
    <Style
      id="store-card-eyebrow"
      fontSize={10}
      fontWeight="600"
      letterSpacing={2}
      color="rgba(255,255,255,0.75)"
    />
    <Style
      id="store-card-name"
      fontFamily="Fraunces-Medium"
      fontSize={22}
      color="#fbfaf7"
      textAlign="center"
    />
    <Style
      id="store-card-location"
      fontSize={11}
      color="rgba(255,255,255,0.7)"
      textAlign="center"
    />
  </>
);
