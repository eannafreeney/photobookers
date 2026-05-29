import { FC } from "hono/jsx";
import { ScrollView, Style, View } from "../../../lib/hxml-comps";
import { getPublishedInterviews } from "../../app/services";
import SectionHeader from "./SectionHeader";
import InterviewCard, { interviewCardStyles } from "./InterviewCard";

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
          <InterviewCard
            key={interview.id}
            interview={interview}
            href={`${baseUrl}/hyperview/interviews/view/${interview.creator.slug}`}
          />
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
    <Style id="interviews-scroll" flexDirection="row" />
    {interviewCardStyles()}
  </>
);
