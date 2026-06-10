import React from "react";
import { Behavior, Style, Text, View } from "../../../../lib/hxml-comps";
import SectionHeader from "../SectionHeader";
import { Creator } from "../../../../db/schema";
import InterviewCard from "../InterviewCard";
import { InterviewPreview } from "../../../app/components/InterviewPreviewSection";

type Props = {
  publishedInterview: InterviewPreview;
  interviewUrl: string;
  interviewTeaser?: string;
  creator: Creator;
};

const InterviewSection = ({
  publishedInterview,
  interviewUrl,
  interviewTeaser,
  creator,
}: Props) => (
  <View>
    <SectionHeader title="Interview" />
    {publishedInterview.promoImageUrl ? (
      <InterviewCard
        interview={publishedInterview}
        href={interviewUrl}
        variant="list"
      />
    ) : null}
    {interviewTeaser ? (
      <Text style="spotlight-interview-teaser">{interviewTeaser}</Text>
    ) : null}
    <View>
      <Text style="spotlight-interview-link">
        Read the full interview with {creator.displayName}
      </Text>
      <Behavior href={interviewUrl} />
    </View>
  </View>
);

export default InterviewSection;

export const interviewSectionStyles = () => (
  <>
    <Style
      id="spotlight-interview-teaser"
      fontSize={14}
      color="#444444"
      lineHeight={20}
      marginBottom={8}
    />
    <Style
      id="spotlight-interview-link"
      fontSize={14}
      color="#3366cc"
      marginBottom={16}
    />
  </>
);
