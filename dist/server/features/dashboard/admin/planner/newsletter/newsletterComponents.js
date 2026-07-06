import { jsx, jsxs } from "react/jsx-runtime";
import {
  MjmlSection,
  MjmlColumn,
  MjmlText,
  MjmlButton,
  MjmlImage,
  MjmlDivider
} from "mjml-react";
import { parseDateString } from "../../../../../lib/utils.js";
import {
  appBaseUrl,
  appStoreUrl,
  brand,
  newsletterAssets,
  newsletterLogoWidthPx,
  newsletterNavLinks,
  newsletterSocial,
  featureCardContentWidthPx
} from "./newsletterTokens.js";
const NewsletterLogo = ({ padding }) => /* @__PURE__ */ jsx(
  MjmlImage,
  {
    src: newsletterAssets.logo,
    alt: "Photobookers",
    href: appBaseUrl,
    width: `${newsletterLogoWidthPx}px`,
    fluidOnMobile: "false",
    align: "center",
    padding,
    cssClass: "newsletter-logo-img"
  }
);
const formatNewsletterDate = (dateStr) => {
  const date = parseDateString(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  });
};
const kickerTextProps = {
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  lineHeight: "1.2",
  align: "center"
};
const sectionPadding = "0 25px";
const SectionHeading = ({
  kicker,
  children
}) => /* @__PURE__ */ jsx(MjmlSection, { backgroundColor: brand.surface, padding: "28px", children: /* @__PURE__ */ jsxs(MjmlColumn, { children: [
  kicker ? /* @__PURE__ */ jsx(
    MjmlText,
    {
      ...kickerTextProps,
      color: brand.accent,
      padding: "0 0 6px",
      align: "left",
      cssClass: "section-kicker",
      children: kicker
    }
  ) : null,
  /* @__PURE__ */ jsx(
    MjmlText,
    {
      fontSize: "24px",
      fontWeight: 500,
      lineHeight: "1.2",
      color: brand.onSurfaceStrong,
      padding: "0 0 12px",
      align: "left",
      fontFamily: brand.fontDisplay,
      cssClass: "section-title",
      children
    }
  ),
  /* @__PURE__ */ jsx(
    MjmlDivider,
    {
      borderWidth: "2px",
      borderColor: brand.outlineStrong,
      padding: "0",
      cssClass: "section-heading-rule"
    }
  )
] }) });
const NewsletterHeader = () => /* @__PURE__ */ jsx(
  MjmlSection,
  {
    backgroundColor: brand.surface,
    padding: "24px 25px 0",
    cssClass: "newsletter-header",
    children: /* @__PURE__ */ jsxs(MjmlColumn, { children: [
      /* @__PURE__ */ jsx(NewsletterLogo, { padding: "0 0 20px" }),
      /* @__PURE__ */ jsx(
        MjmlDivider,
        {
          borderWidth: "2px",
          borderColor: brand.outlineStrong,
          padding: "0",
          cssClass: "newsletter-header-rule"
        }
      )
    ] })
  }
);
const NewsletterSubject = ({
  subject,
  weekLabel
}) => /* @__PURE__ */ jsx(
  MjmlSection,
  {
    backgroundColor: brand.surface,
    padding: "0",
    cssClass: "newsletter-subject",
    children: /* @__PURE__ */ jsxs(MjmlColumn, { padding: "0", children: [
      /* @__PURE__ */ jsx(
        MjmlText,
        {
          ...kickerTextProps,
          color: brand.accent,
          padding: "20px 25px 8px",
          cssClass: "newsletter-kicker",
          children: "Photobookers Weekly"
        }
      ),
      weekLabel ? /* @__PURE__ */ jsx(
        MjmlText,
        {
          ...kickerTextProps,
          color: brand.onSurfaceWeak,
          padding: "0 25px 12px",
          cssClass: "newsletter-week",
          children: weekLabel
        }
      ) : null,
      /* @__PURE__ */ jsx(
        MjmlText,
        {
          align: "center",
          fontSize: "32px",
          fontWeight: 500,
          lineHeight: "1.15",
          color: brand.onSurfaceStrong,
          padding: "0 25px 20px",
          fontFamily: brand.fontDisplay,
          cssClass: "newsletter-subject-text",
          children: subject
        }
      )
    ] })
  }
);
const NewsletterIntro = ({ introText }) => /* @__PURE__ */ jsx(MjmlSection, { backgroundColor: brand.surface, padding: "0", children: /* @__PURE__ */ jsx(MjmlColumn, { children: /* @__PURE__ */ jsx(
  MjmlText,
  {
    align: "center",
    fontSize: "15px",
    lineHeight: "1.65",
    color: brand.onSurface,
    padding: "0 25px 24px",
    children: introText
  }
) }) });
const NewsletterAppPromo = () => /* @__PURE__ */ jsx(MjmlSection, { backgroundColor: brand.surface, padding: "0 25px 24px", children: /* @__PURE__ */ jsx(MjmlColumn, { children: /* @__PURE__ */ jsx(
  MjmlButton,
  {
    href: appStoreUrl,
    backgroundColor: brand.primary,
    color: brand.onPrimary,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    borderRadius: "0",
    innerPadding: "14px 28px",
    align: "center",
    cssClass: "newsletter-cta-button",
    children: "Download iOS App"
  }
) }) });
const NewsletterOutro = ({ outroText }) => /* @__PURE__ */ jsx(MjmlSection, { backgroundColor: brand.surface, padding: "8px 0 0", children: /* @__PURE__ */ jsx(MjmlColumn, { children: /* @__PURE__ */ jsx(
  MjmlText,
  {
    fontSize: "15px",
    lineHeight: "1.65",
    color: brand.onSurface,
    padding: "0 25px 0",
    children: outroText
  }
) }) });
const NewsletterCtaButton = ({
  label,
  href
}) => /* @__PURE__ */ jsx(MjmlSection, { backgroundColor: brand.surface, padding: "24px 25px 8px", children: /* @__PURE__ */ jsx(MjmlColumn, { children: /* @__PURE__ */ jsx(
  MjmlButton,
  {
    href,
    backgroundColor: brand.primary,
    color: brand.onPrimary,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    borderRadius: "0",
    innerPadding: "14px 28px",
    align: "center",
    cssClass: "newsletter-cta-button",
    children: label
  }
) }) });
const NewsletterFooter = () => /* @__PURE__ */ jsx(MjmlSection, { backgroundColor: brand.surfaceAlt, padding: "0", children: /* @__PURE__ */ jsxs(MjmlColumn, { children: [
  /* @__PURE__ */ jsx(
    MjmlDivider,
    {
      borderWidth: "2px",
      borderColor: brand.outlineStrong,
      padding: "24px 25px 0"
    }
  ),
  /* @__PURE__ */ jsx(
    MjmlText,
    {
      align: "center",
      fontSize: "14px",
      lineHeight: "1.6",
      color: brand.onSurface,
      padding: "0 25px 16px",
      children: "The home for photobook lovers. Discover books, follow artists and publishers, and keep up with the photobook world."
    }
  ),
  /* @__PURE__ */ jsx(
    MjmlText,
    {
      align: "center",
      padding: "0 25px 16px",
      cssClass: "newsletter-nav-link",
      children: newsletterNavLinks.map((link, index) => /* @__PURE__ */ jsxs("span", { children: [
        index > 0 ? /* @__PURE__ */ jsx("span", { style: { color: brand.onSurfaceWeak }, children: " \xB7 " }) : null,
        /* @__PURE__ */ jsx(
          "a",
          {
            href: link.href,
            style: { color: brand.onSurface, textDecoration: "none" },
            children: link.label
          }
        )
      ] }, link.href))
    }
  ),
  /* @__PURE__ */ jsx(MjmlText, { align: "center", padding: "0 25px 8px", children: /* @__PURE__ */ jsx("a", { href: newsletterSocial.instagramUrl, children: /* @__PURE__ */ jsx(
    "img",
    {
      src: newsletterSocial.instagramIconUrl,
      alt: "Instagram",
      width: "20",
      height: "20",
      style: { display: "inline-block" }
    }
  ) }) }),
  /* @__PURE__ */ jsxs(
    MjmlText,
    {
      align: "center",
      fontSize: "11px",
      color: brand.onSurfaceWeak,
      padding: "8px 25px 0",
      cssClass: "footer-kicker",
      letterSpacing: "0.18em",
      textTransform: "uppercase",
      children: [
        "\xA9 ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Photobookers"
      ]
    }
  ),
  /* @__PURE__ */ jsx(
    MjmlText,
    {
      align: "center",
      fontSize: "12px",
      color: brand.onSurfaceWeak,
      padding: "12px 25px 24px",
      children: /* @__PURE__ */ jsx(
        "a",
        {
          href: "{$unsubscribe}",
          style: {
            color: brand.onSurfaceWeak,
            textDecoration: "underline"
          },
          children: "Unsubscribe"
        }
      )
    }
  )
] }) });
const FeatureCard = ({
  kicker,
  title,
  body,
  linkHref,
  linkLabel,
  image
}) => /* @__PURE__ */ jsx(
  MjmlSection,
  {
    backgroundColor: brand.surface,
    padding: `0 ${sectionPadding} 16px`,
    cssClass: "feature-card-section",
    children: /* @__PURE__ */ jsxs(
      MjmlColumn,
      {
        backgroundColor: brand.surface,
        border: `1px solid ${brand.outline}`,
        padding: "0",
        cssClass: "feature-card",
        children: [
          image,
          /* @__PURE__ */ jsx(
            MjmlText,
            {
              ...kickerTextProps,
              color: brand.onSurfaceWeak,
              padding: "16px 16px 0",
              align: "left",
              cssClass: "feature-kicker",
              children: kicker
            }
          ),
          /* @__PURE__ */ jsx(
            MjmlText,
            {
              fontSize: "22px",
              fontWeight: 500,
              lineHeight: "1.25",
              color: brand.onSurfaceStrong,
              padding: "8px 16px 0",
              align: "left",
              fontFamily: brand.fontDisplay,
              cssClass: "feature-title",
              children: title
            }
          ),
          body ? /* @__PURE__ */ jsx(
            MjmlText,
            {
              fontSize: "14px",
              lineHeight: "1.55",
              color: brand.onSurface,
              padding: "8px 16px 0",
              align: "left",
              children: body
            }
          ) : null,
          /* @__PURE__ */ jsx(
            MjmlText,
            {
              padding: "12px 16px 18px",
              align: "left",
              cssClass: "newsletter-accent-link",
              children: /* @__PURE__ */ jsxs(
                "a",
                {
                  href: linkHref,
                  style: {
                    color: brand.accent,
                    textDecoration: "underline",
                    fontWeight: 600
                  },
                  children: [
                    linkLabel,
                    " \u2192"
                  ]
                }
              )
            }
          )
        ]
      }
    )
  }
);
const featureCardImageProps = {
  width: `${featureCardContentWidthPx}px`,
  fluidOnMobile: "true",
  align: "center",
  padding: "0"
};
const buildBookBody = (item) => {
  const parts = [];
  if (item.artistName) parts.push(item.artistName);
  if (item.publisherName) parts.push(item.publisherName);
  return parts.join(" \xB7 ");
};
const BookFeatureCard = ({ book }) => /* @__PURE__ */ jsx(
  FeatureCard,
  {
    kicker: formatNewsletterDate(book.date),
    image: book.coverUrl ? /* @__PURE__ */ jsx(
      MjmlImage,
      {
        ...featureCardImageProps,
        src: book.coverUrl,
        alt: book.title,
        cssClass: "feature-card-img feature-card-img-book"
      }
    ) : null,
    title: book.title,
    body: buildBookBody(book),
    linkHref: `${appBaseUrl}/book-of-the-day/${book.date}`,
    linkLabel: "View book"
  }
);
const buildTrendingBookBody = (item) => {
  const parts = [];
  if (item.artistName) parts.push(item.artistName);
  if (item.publisherName) parts.push(item.publisherName);
  return parts.join(" \xB7 ");
};
const TrendingBookFeatureCard = ({
  book
}) => /* @__PURE__ */ jsx(
  FeatureCard,
  {
    kicker: "Book",
    image: book.coverUrl ? /* @__PURE__ */ jsx(
      MjmlImage,
      {
        ...featureCardImageProps,
        src: book.coverUrl,
        alt: book.title,
        cssClass: "feature-card-img feature-card-img-book"
      }
    ) : null,
    title: book.title,
    body: buildTrendingBookBody(book),
    linkHref: `${appBaseUrl}/books/${book.bookSlug}`,
    linkLabel: "View book"
  }
);
const TrendingCreatorFeatureCard = ({
  creator
}) => /* @__PURE__ */ jsx(
  FeatureCard,
  {
    kicker: creator.type === "artist" ? "Artist" : "Publisher",
    image: creator.coverUrl ? /* @__PURE__ */ jsx(
      MjmlImage,
      {
        ...featureCardImageProps,
        src: creator.coverUrl,
        alt: creator.displayName,
        cssClass: "feature-card-img feature-card-img-square"
      }
    ) : null,
    title: creator.displayName,
    body: "",
    linkHref: `${appBaseUrl}/creators/${creator.slug}`,
    linkLabel: "View profile"
  }
);
const buildCreatorBody = (creator) => {
  const parts = [];
  if (creator.tagline) parts.push(creator.tagline);
  if (creator.location) parts.push(creator.location);
  return parts.join(" \xB7 ");
};
const buildNewMemberBody = (member) => {
  const parts = [];
  if (member.tagline) parts.push(member.tagline);
  if (member.location) parts.push(member.location);
  return parts.join(" \xB7 ");
};
const formatFairDateRange = (startDateStr, endDateStr) => {
  const startDate = parseDateString(startDateStr);
  const endDate = parseDateString(endDateStr);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return [startDateStr, endDateStr].filter(Boolean).join(" - ");
  }
  const startMonth = startDate.toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC"
  });
  const endMonth = endDate.toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC"
  });
  const startDay = startDate.toLocaleDateString("en-US", {
    day: "numeric",
    timeZone: "UTC"
  });
  const endDay = endDate.toLocaleDateString("en-US", {
    day: "numeric",
    timeZone: "UTC"
  });
  const endYear = endDate.toLocaleDateString("en-US", {
    year: "numeric",
    timeZone: "UTC"
  });
  if (startDateStr === endDateStr) {
    return `${startMonth} ${startDay}, ${endYear}`;
  }
  if (startDate.getUTCMonth() === endDate.getUTCMonth() && startDate.getUTCFullYear() === endDate.getUTCFullYear()) {
    return `${startMonth} ${startDay}-${endDay}, ${endYear}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${endYear}`;
};
const buildFairBody = (fair) => {
  const parts = [formatFairDateRange(fair.startDate, fair.endDate)];
  if (fair.venue) parts.push(fair.venue);
  if (fair.location) parts.push(fair.location);
  return parts.join(" \xB7 ");
};
const NewMemberFeatureCard = ({
  member
}) => /* @__PURE__ */ jsx(
  FeatureCard,
  {
    kicker: member.type === "artist" ? "Artist" : "Publisher",
    image: member.coverUrl ? /* @__PURE__ */ jsx(
      MjmlImage,
      {
        ...featureCardImageProps,
        src: member.coverUrl,
        alt: member.displayName,
        cssClass: "feature-card-img feature-card-img-square"
      }
    ) : null,
    title: member.displayName,
    body: buildNewMemberBody(member),
    linkHref: `${appBaseUrl}/creators/${member.slug}`,
    linkLabel: "View profile"
  }
);
const CreatorFeatureCard = ({
  creator,
  profilePath
}) => /* @__PURE__ */ jsx(
  FeatureCard,
  {
    kicker: profilePath === "artist-of-the-week" ? "Artist" : "Publisher",
    image: creator.coverUrl ? /* @__PURE__ */ jsx(
      MjmlImage,
      {
        ...featureCardImageProps,
        src: creator.coverUrl,
        alt: creator.displayName,
        cssClass: "feature-card-img feature-card-img-square"
      }
    ) : null,
    title: creator.displayName,
    body: buildCreatorBody(creator),
    linkHref: `${appBaseUrl}/${profilePath}/${creator.weekKey}`,
    linkLabel: "View profile"
  }
);
const FairFeatureCard = ({ fair }) => /* @__PURE__ */ jsx(
  FeatureCard,
  {
    kicker: "Book fair",
    image: fair.coverUrl ? /* @__PURE__ */ jsx(
      MjmlImage,
      {
        ...featureCardImageProps,
        src: fair.coverUrl,
        alt: fair.name,
        cssClass: "feature-card-img feature-card-img-book"
      }
    ) : null,
    title: fair.name,
    body: buildFairBody(fair),
    linkHref: `${appBaseUrl}/fairs/${fair.slug}`,
    linkLabel: "View fair"
  }
);
const EmptyBotdMessage = () => /* @__PURE__ */ jsx(MjmlSection, { backgroundColor: brand.surface, padding: "0 0 12px", children: /* @__PURE__ */ jsx(MjmlColumn, { children: /* @__PURE__ */ jsx(
  MjmlText,
  {
    fontSize: "14px",
    lineHeight: "1.6",
    color: brand.onSurface,
    padding: "0 25px 12px",
    children: "No BOTD entries were scheduled for this week."
  }
) }) });
export {
  BookFeatureCard,
  CreatorFeatureCard,
  EmptyBotdMessage,
  FairFeatureCard,
  NewMemberFeatureCard,
  NewsletterAppPromo,
  NewsletterCtaButton,
  NewsletterFooter,
  NewsletterHeader,
  NewsletterIntro,
  NewsletterOutro,
  NewsletterSubject,
  SectionHeading,
  TrendingBookFeatureCard,
  TrendingCreatorFeatureCard
};
