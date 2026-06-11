import { FC } from "hono/jsx";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";
import { formatDate } from "../../../utils";

export type HyperviewInterviewCardData = {
  id: string;
  promoImageUrl: string | null;
  creator: { slug: string; displayName: string };
  completedAt: Date | null;
};

type Props = {
  interview: HyperviewInterviewCardData;
  href: string;
  variant?: "carousel" | "list";
};

const InterviewCard: FC<Props> = ({
  interview,
  href,
  variant = "carousel",
}) => {
  const cardStyle =
    variant === "list" ? "interview-list-card" : "interview-card";
  const imageStyle =
    variant === "list" ? "interview-list-card-image" : "interview-card-image";
  const overlayStyle =
    variant === "list"
      ? "interview-list-card-overlay"
      : "interview-card-overlay";

  return (
    <View style={cardStyle}>
      <Behavior href={href} />
      {interview.promoImageUrl && (
        <Image
          source={interview.promoImageUrl}
          style={imageStyle}
          resize-mode="cover"
        />
      )}
      <View style={overlayStyle}>
        <Text style="interview-card-eyebrow">INTERVIEW</Text>
        <Text style="interview-card-name">{interview.creator.displayName}</Text>
        {interview.completedAt && (
          <Text style="interview-card-date">
            {formatDate(interview.completedAt)}
          </Text>
        )}
      </View>
    </View>
  );
};

export default InterviewCard;

export const interviewCardStyles = () => (
  <>
    <Style
      id="interview-card"
      width={220}
      height={256}
      borderRadius={0}
      overflow="hidden"
      marginRight={12}
    />
    <Style id="interview-card-image" width={220} height={256} />
    <Style
      id="interview-list-card"
      width="100%"
      height={280}
      borderRadius={0}
      overflow="hidden"
      marginBottom={16}
    />
    <Style id="interview-list-card-image" width="100%" height={280} />
    <Style
      id="interview-card-overlay"
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
      id="interview-list-card-overlay"
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
      id="interview-card-eyebrow"
      fontSize={10}
      fontWeight="600"
      letterSpacing={2}
      color="rgba(255,255,255,0.75)"
    />
    <Style
      id="interview-card-name"
      fontFamily="Fraunces-Medium"
      fontSize={22}
      color="#fbfaf7"
      textAlign="center"
    />
    <Style
      id="interview-card-date"
      fontSize={11}
      color="rgba(255,255,255,0.7)"
    />
  </>
);
