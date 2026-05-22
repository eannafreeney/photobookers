import { FC } from "hono/jsx";
import {
  Behavior,
  Image,
  ScrollView,
  Style,
  Text,
  View,
} from "../../../lib/hxml-comps";
import { getPublishedInterviews } from "../../app/services";
import { formatDate } from "../../../utils";
import SectionHeader from "./SectionHeader";

type InterviewsProps = {
  baseUrl?: string;
};

const Interviews: FC<InterviewsProps> = async ({ baseUrl = "" }) => {
  const [error, interviews] = await getPublishedInterviews();

  if (error || !interviews?.length) return <></>;

  return (
    <View style="interviews-section">
      <SectionHeader
        title="Interviews"
        viewAllHref={`${baseUrl}/hyperview/interviews`}
      />

      <ScrollView
        style="interviews-scroll"
        horizontal="true"
        shows-scroll-indicator="false"
      >
        {interviews.map((interview) => (
          <View key={interview.id} style="interview-card">
            <Behavior
              href={`${baseUrl}/hyperview/interviews/view/${interview.creator.slug}`}
            />
            {interview.promoImageUrl && (
              <Image
                source={interview.promoImageUrl}
                style="interview-card-image"
                resize-mode="cover"
              />
            )}
            <View style="interview-card-overlay">
              <Text style="interview-card-eyebrow">Interview</Text>
              <Text style="interview-card-name">
                {interview.creator.displayName}
              </Text>
              {interview.completedAt && (
                <Text style="interview-card-date">
                  {formatDate(interview.completedAt)}
                </Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default Interviews;

export const interviewsStyles = () => (
  <>
    <Style
      id="interviews-section"
      flexDirection="column"
      gap={12}
      marginBottom={24}
    />
    <Style
      id="interviews-header"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
    />
    <Style id="interviews-scroll" flexDirection="row" />
    <Style
      id="interview-card"
      width={220}
      height={256}
      borderRadius={10}
      overflow="hidden"
      marginRight={12}
    />
    <Style id="interview-card-image" width={220} height={256} />
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
      id="interview-card-eyebrow"
      fontSize={11}
      color="rgba(255,255,255,0.7)"
    />
    <Style
      id="interview-card-name"
      fontSize={22}
      fontWeight="600"
      color="#ffffff"
      textAlign="center"
    />
    <Style
      id="interview-card-date"
      fontSize={11}
      color="rgba(255,255,255,0.7)"
    />
  </>
);
