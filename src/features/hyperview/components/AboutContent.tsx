import { Style, Text, View } from "../../../lib/hxml-comps";
import {
  aboutAudienceSections,
  aboutDifferentiators,
  aboutEditorialLinks,
  aboutPageMeta,
} from "../../app/content/aboutPageContent";

const AboutContent = () => (
  <View style="about-content">
    <View style="about-section">
      <Text style="about-section-title">About</Text>
      <Text style="about-section-body">{aboutPageMeta.intro}</Text>
      <Text style="about-section-body">{aboutPageMeta.lead}</Text>
    </View>

    {aboutAudienceSections.map((section) => (
      <View key={section.id} style="about-section">
        <Text style="about-section-kicker">{section.kicker}</Text>
        <Text style="about-section-title">{section.title}</Text>
        <Text style="about-section-body">{section.intro}</Text>
        {section.bullets.map((bullet, index) => (
          <Text key={index} style="about-section-bullet">
            {"• "}
            {bullet}
          </Text>
        ))}
        <Text style="about-section-body">{section.closing}</Text>
      </View>
    ))}

    <View style="about-section">
      <Text style="about-section-kicker">{aboutDifferentiators.kicker}</Text>
      <Text style="about-section-title">{aboutDifferentiators.title}</Text>
      <Text style="about-section-body">{aboutDifferentiators.body}</Text>
      {aboutDifferentiators.pillars.map((pillar, index) => (
        <View key={index} style="about-pillar">
          <Text style="about-pillar-title">{pillar.title}</Text>
          <Text style="about-section-body">{pillar.description}</Text>
        </View>
      ))}
    </View>

    <View style="about-section">
      <Text style="about-section-kicker">Every week</Text>
      <Text style="about-section-title">An editorial rhythm</Text>
      <Text style="about-section-body">
        {`Every day we feature a ${aboutEditorialLinks[0].label}, and every week an ${aboutEditorialLinks[1].label} and a ${aboutEditorialLinks[2].label}, alongside ${aboutEditorialLinks[3].label} with the people behind the books. The best way to keep up is the ${aboutEditorialLinks[4].label}.`}
      </Text>
    </View>
  </View>
);

export default AboutContent;

export const aboutContentStyles = () => (
  <>
    <Style
      id="about-content"
      flexDirection="column"
      paddingLeft={16}
      paddingRight={16}
      paddingTop={16}
      paddingBottom={8}
    />
    <Style id="about-section" marginBottom={24} />
    <Style
      id="about-section-kicker"
      fontSize={12}
      color="#8a8274"
      fontWeight="600"
      textTransform="uppercase"
      letterSpacing={1.2}
      marginBottom={4}
    />
    <Style
      id="about-section-title"
      fontFamily="Fraunces-SemiBold"
      fontSize={18}
      color="#191613"
      marginBottom={8}
    />
    <Style
      id="about-section-body"
      fontSize={14}
      color="#45413a"
      lineHeight={22}
      marginBottom={12}
    />
    <Style
      id="about-section-bullet"
      fontSize={14}
      color="#45413a"
      lineHeight={22}
      marginBottom={8}
      paddingLeft={4}
    />
    <Style id="about-pillar" marginTop={8} marginBottom={4} />
    <Style
      id="about-pillar-title"
      fontFamily="Fraunces-SemiBold"
      fontSize={16}
      color="#191613"
      marginBottom={4}
    />
  </>
);
