import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Style, View } from "../../../../lib/hxml-comps.js";
import { newsletterCardStyles } from "../NewsletterCard.js";
import { sectionHeaderStyles } from "../SectionHeader.js";
import { signInPromptStyles } from "../SignInPrompt.js";
import { spotlightHeaderStyles } from "./SpotlightHeader.js";
import { spotlightShareStyles } from "./SpotlightShare.js";
import ThisWeekBookEntry, {
  thisWeekBookEntryStyles
} from "./ThisWeekBookEntry.js";
import ThisWeekCreatorSection, {
  thisWeekCreatorSectionStyles
} from "./ThisWeekCreatorSection.js";
import ThisWeekNav, { thisWeekNavStyles } from "./ThisWeekNav.js";
import NewsletterCard from "../NewsletterCard.js";
import SectionHeader from "../SectionHeader.js";
import SpotlightHeader from "./SpotlightHeader.js";
import { aotwPath, potwPath } from "../../../app/spotlightUrls.js";
const ThisWeekSpotlightBody = ({
  baseUrl,
  weekStart,
  weekRangeLabel,
  botdEntries,
  artistOfTheWeek,
  publisherOfTheWeek
}) => /* @__PURE__ */ jsxs(View, { children: [
  /* @__PURE__ */ jsx(
    SpotlightHeader,
    {
      title: "This week on Photobookers",
      subtitle: weekRangeLabel
    }
  ),
  botdEntries.length > 0 && /* @__PURE__ */ jsxs(View, { style: "spotlight-books-of-the-day", children: [
    /* @__PURE__ */ jsx(SectionHeader, { title: "Books of the Day" }),
    botdEntries.map((entry) => /* @__PURE__ */ jsx(ThisWeekBookEntry, { entry, baseUrl }, entry.id))
  ] }),
  artistOfTheWeek && /* @__PURE__ */ jsx(
    ThisWeekCreatorSection,
    {
      spotlight: artistOfTheWeek,
      spotlightHref: `${baseUrl}/hyperview${aotwPath(weekStart)}`
    }
  ),
  publisherOfTheWeek && /* @__PURE__ */ jsx(
    ThisWeekCreatorSection,
    {
      spotlight: publisherOfTheWeek,
      spotlightHref: `${baseUrl}/hyperview${potwPath(weekStart)}`
    }
  ),
  /* @__PURE__ */ jsx(NewsletterCard, { baseUrl }),
  /* @__PURE__ */ jsx(ThisWeekNav, { baseUrl, weekStart })
] });
var ThisWeekSpotlightBody_default = ThisWeekSpotlightBody;
const thisWeekSpotlightPageStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "spotlight-books-of-the-day",
      borderBottomWidth: 1,
      borderBottomColor: "#e4e0d5",
      paddingBottom: 16,
      marginBottom: 16,
      gap: 8
    }
  ),
  spotlightHeaderStyles(),
  spotlightShareStyles(),
  thisWeekBookEntryStyles(),
  thisWeekCreatorSectionStyles(),
  thisWeekNavStyles(),
  newsletterCardStyles(),
  sectionHeaderStyles(),
  signInPromptStyles()
] });
export {
  ThisWeekSpotlightBody_default as default,
  thisWeekSpotlightPageStyles
};
