import { Style, Text, View } from "../../../lib/hxml-comps";

const SECTIONS = [
  {
    title: "About",
    body: "Photobookers is a place to discover and explore photobooks. We list books, artists, and publishers in one place so you can find what you're looking for and see where to get it.",
  },
  {
    title: "Photobookers for fans",
    body: "Browse books by artist and publisher, see covers and details, and follow links to buy or pre-order. Whether you collect photobooks or are just getting started, we help you find titles and keep track of who made them and who published them.",
  },
  {
    title: "Photobookers for artists",
    body: "Get a profile that ties your name to your books and makes your work easier to find. List your titles, add a short bio and links, and point people to your shop or publisher—so your books show up when people search.",
  },
  {
    title: "Photobookers for publishers",
    body: "Show your catalogue in one place: books, covers, and links to your store. We help fans and collectors discover your titles and see your list grow as you release new work.",
  },
] as const;

const AboutContent = () => (
  <View style="about-content">
    {SECTIONS.map((section, index) => (
      <View key={index} style="about-section">
        <Text style="about-section-title">{section.title}</Text>
        <Text style="about-section-body">{section.body}</Text>
      </View>
    ))}
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
    <Style id="about-section" marginBottom={16} />
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
    />
  </>
);
