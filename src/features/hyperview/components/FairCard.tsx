import { FC } from "hono/jsx";
import type { BookFair } from "../../../db/schema";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";
import { formatDate, formatDateWithoutYear } from "../../../utils";

export type HyperviewFairCardData = Pick<
  BookFair,
  "slug" | "name" | "coverUrl" | "startDate" | "endDate" | "city" | "country" | "venue"
>;

type Props = {
  fair: HyperviewFairCardData;
  href: string;
  variant?: "carousel" | "list";
};

const formatLocation = (fair: HyperviewFairCardData) => {
  if (fair.city && fair.country) return `${fair.city}, ${fair.country}`;
  return fair.city || fair.country || null;
};

const FairCard: FC<Props> = ({ fair, href, variant = "carousel" }) => {
  const cardStyle = variant === "list" ? "fair-list-card" : "fair-card";
  const imageStyle =
    variant === "list" ? "fair-list-card-image" : "fair-card-image";
  const overlayStyle =
    variant === "list" ? "fair-list-card-overlay" : "fair-card-overlay";
  const location = formatLocation(fair);

  return (
    <View style={cardStyle}>
      <Behavior href={href} />
      {fair.coverUrl ? (
        <Image
          source={fair.coverUrl}
          style={imageStyle}
          resize-mode="cover"
        />
      ) : (
        <View style={imageStyle} />
      )}
      <View style={overlayStyle}>
        <Text style="fair-card-eyebrow">BOOK FAIR</Text>
        <Text style="fair-card-name">{fair.name}</Text>
        <Text style="fair-card-date">
          {formatDateWithoutYear(fair.startDate)} – {formatDate(fair.endDate)}
        </Text>
        {location ? (
          <Text style="fair-card-location">{location}</Text>
        ) : null}
      </View>
    </View>
  );
};

export default FairCard;

export const fairCardStyles = () => (
  <>
    <Style
      id="fair-card"
      width={220}
      height={256}
      borderRadius={0}
      overflow="hidden"
      marginRight={12}
    />
    <Style id="fair-card-image" width={220} height={256} backgroundColor="#e4e0d5" />
    <Style
      id="fair-list-card"
      width="100%"
      height={280}
      borderRadius={0}
      overflow="hidden"
      marginBottom={16}
    />
    <Style
      id="fair-list-card-image"
      width="100%"
      height={280}
      backgroundColor="#e4e0d5"
    />
    <Style
      id="fair-card-overlay"
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
      id="fair-list-card-overlay"
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
      id="fair-card-eyebrow"
      fontSize={10}
      fontWeight="600"
      letterSpacing={2}
      color="rgba(255,255,255,0.75)"
    />
    <Style
      id="fair-card-name"
      fontFamily="Fraunces-Medium"
      fontSize={22}
      color="#fbfaf7"
      textAlign="center"
    />
    <Style
      id="fair-card-date"
      fontSize={11}
      color="rgba(255,255,255,0.7)"
      textAlign="center"
    />
    <Style
      id="fair-card-location"
      fontSize={11}
      color="rgba(255,255,255,0.7)"
      textAlign="center"
    />
  </>
);
