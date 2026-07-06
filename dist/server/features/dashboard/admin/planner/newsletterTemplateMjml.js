import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import {
  render,
  Mjml,
  MjmlHead,
  MjmlTitle,
  MjmlFont,
  MjmlStyle,
  MjmlAttributes,
  MjmlAll,
  MjmlBreakpoint,
  MjmlBody,
  MjmlText
} from "mjml-react";
import { formatNewsletterWeekRange } from "./newsletterUtils.js";
import { prepareNewsletterHtmlForEsp } from "./newsletterEspHtml.js";
import {
  BookFeatureCard,
  CreatorFeatureCard,
  FairFeatureCard,
  NewMemberFeatureCard,
  NewsletterAppPromo,
  NewsletterCtaButton,
  NewsletterFooter,
  NewsletterHeader,
  NewsletterOutro,
  NewsletterSubject,
  SectionHeading,
  TrendingBookFeatureCard,
  TrendingCreatorFeatureCard
} from "./newsletter/newsletterComponents.js";
import {
  appBaseUrl,
  brand,
  featureCardMobileSidePaddingPx,
  newsletterWidthPx
} from "./newsletter/newsletterTokens.js";
const responsiveStyles = `
  .newsletter-logo-img img {
    display: block;
    margin: 0 auto;
    border: 0;
  }
  .newsletter-header-rule td {
    border-bottom: 2px solid ${brand.outlineStrong};
  }
  .section-kicker,
  .section-kicker div,
  .feature-kicker,
  .feature-kicker div,
  .newsletter-kicker,
  .newsletter-kicker div,
  .newsletter-week,
  .newsletter-week div,
  .footer-kicker,
  .footer-kicker div {
    font-size: 11px !important;
    line-height: 1.2 !important;
    letter-spacing: 0.18em !important;
    text-transform: uppercase !important;
    font-weight: 600 !important;
  }
  .section-kicker,
  .section-kicker div,
  .newsletter-kicker,
  .newsletter-kicker div {
    color: ${brand.accent} !important;
  }
  .section-title,
  .section-title div,
  .newsletter-subject-text,
  .newsletter-subject-text div,
  .feature-title,
  .feature-title div {
    font-family: ${brand.fontDisplay} !important;
  }
  .section-heading-rule td {
    border-bottom: 2px solid ${brand.outlineStrong};
  }
  .feature-card {
    border: 1px solid ${brand.outline};
  }
  .feature-card-img img {
    display: block;
    border: 0;
  }
  .feature-card-img-book img {
    width: 100%;
    max-width: 100%;
    height: auto;
    display: block;
  }
  .feature-card-img-book > table {
    width: 100%;
  }
  .feature-card-img-square img {
    object-fit: cover;
    object-position: center;
    width: 100%;
    max-width: 100%;
    height: auto;
    display: block;
    aspect-ratio: 1 / 1;
  }
  .feature-card-img-square > table {
    width: 100%;
  }
  .newsletter-subject > table > tbody > tr > td,
  .newsletter-subject-text,
  .newsletter-subject-text div {
    padding-top: 0 !important;
    margin-top: 0 !important;
  }
  .newsletter-nav-link,
  .newsletter-nav-link a {
    color: ${brand.onSurface} !important;
    text-decoration: none !important;
    font-size: 13px !important;
  }
  .newsletter-accent-link,
  .newsletter-accent-link a {
    color: ${brand.accent} !important;
    text-decoration: underline !important;
    font-size: 13px !important;
    font-weight: 600 !important;
  }
  @media only screen and (max-width: 600px) {
    .feature-card-section > table > tbody > tr > td {
      padding-left: ${featureCardMobileSidePaddingPx}px !important;
      padding-right: ${featureCardMobileSidePaddingPx}px !important;
    }
    .feature-card-img-book img {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
    }
    .feature-card-img-square img {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
    }
    .feature-card-img > table,
    .feature-card-img-square > table {
      width: 100% !important;
    }
    .newsletter-cta-button table {
      width: 100% !important;
    }
    .newsletter-cta-button a {
      display: block !important;
      width: 100% !important;
      box-sizing: border-box !important;
    }
  }
`;
const WeeklyNewsletterMjml = (params) => /* @__PURE__ */ jsxs(Mjml, { lang: "en", children: [
  /* @__PURE__ */ jsxs(MjmlHead, { children: [
    /* @__PURE__ */ jsx(MjmlTitle, { children: params.subject }),
    /* @__PURE__ */ jsx(
      MjmlFont,
      {
        name: "Instrument Sans",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap"
      }
    ),
    /* @__PURE__ */ jsx(
      MjmlFont,
      {
        name: "Fraunces",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap"
      }
    ),
    /* @__PURE__ */ jsx(
      MjmlFont,
      {
        name: "Caveat",
        href: "https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap"
      }
    ),
    /* @__PURE__ */ jsxs(MjmlAttributes, { children: [
      /* @__PURE__ */ jsx(MjmlAll, { fontFamily: brand.fontSans, color: brand.onSurface }),
      /* @__PURE__ */ jsx(MjmlText, { lineHeight: "1.65", fontSize: "15px" })
    ] }),
    /* @__PURE__ */ jsx(MjmlBreakpoint, { width: "600px" }),
    /* @__PURE__ */ jsx(MjmlStyle, { children: responsiveStyles })
  ] }),
  /* @__PURE__ */ jsxs(MjmlBody, { backgroundColor: brand.surface, width: newsletterWidthPx, children: [
    /* @__PURE__ */ jsx(NewsletterHeader, {}),
    /* @__PURE__ */ jsx(
      NewsletterSubject,
      {
        subject: params.subject,
        weekLabel: formatNewsletterWeekRange(params.weekStart, params.weekEnd)
      }
    ),
    /* @__PURE__ */ jsx(NewsletterAppPromo, {}),
    (params.trending?.books.length ?? 0) > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(SectionHeading, { kicker: "Trending", children: "Top books this week" }),
      params.trending.books.map((book) => /* @__PURE__ */ jsx(TrendingBookFeatureCard, { book }, book.bookId))
    ] }) : null,
    (params.trending?.artists.length ?? 0) > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(SectionHeading, { kicker: "Trending", children: "Top artists this week" }),
      params.trending.artists.map((artist) => /* @__PURE__ */ jsx(TrendingCreatorFeatureCard, { creator: artist }, artist.slug))
    ] }) : null,
    (params.trending?.publishers.length ?? 0) > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(SectionHeading, { kicker: "Trending", children: "Top publishers this week" }),
      params.trending.publishers.map((publisher) => /* @__PURE__ */ jsx(
        TrendingCreatorFeatureCard,
        {
          creator: publisher
        },
        publisher.slug
      ))
    ] }) : null,
    params.items.length > 0 ? /* @__PURE__ */ jsx(SectionHeading, { kicker: "Daily picks", children: "Books of the day" }) : null,
    params.items.length > 0 && params.items.map((book) => /* @__PURE__ */ jsx(BookFeatureCard, { book }, book.bookId)),
    params.artistOfTheWeek ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(SectionHeading, { kicker: "Spotlight", children: "Artist of the week" }),
      /* @__PURE__ */ jsx(
        CreatorFeatureCard,
        {
          creator: params.artistOfTheWeek,
          profilePath: "artist-of-the-week"
        }
      )
    ] }) : null,
    params.publisherOfTheWeek ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(SectionHeading, { kicker: "Spotlight", children: "Publisher of the week" }),
      /* @__PURE__ */ jsx(
        CreatorFeatureCard,
        {
          creator: params.publisherOfTheWeek,
          profilePath: "publisher-of-the-week"
        }
      )
    ] }) : null,
    (params.newMembers?.length ?? 0) > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(SectionHeading, { kicker: "Discover", children: "New on Photobookers" }),
      params.newMembers.map((member) => /* @__PURE__ */ jsx(NewMemberFeatureCard, { member }, member.slug))
    ] }) : null,
    params.upcomingFair ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(SectionHeading, { kicker: "Coming up", children: "Next week fair" }),
      /* @__PURE__ */ jsx(FairFeatureCard, { fair: params.upcomingFair })
    ] }) : null,
    /* @__PURE__ */ jsx(NewsletterOutro, { outroText: params.outroText }),
    /* @__PURE__ */ jsx(NewsletterCtaButton, { label: params.ctaText, href: `${appBaseUrl}` }),
    /* @__PURE__ */ jsx(NewsletterFooter, {})
  ] })
] });
function renderWeeklyBOTDNewsletterHtmlMjml(params) {
  const { html, errors } = render(/* @__PURE__ */ jsx(WeeklyNewsletterMjml, { ...params }), {
    validationLevel: "soft",
    minify: false
  });
  if (errors.length > 0) {
    console.error("MJML compile errors", errors);
    throw new Error("Failed to compile weekly newsletter MJML template");
  }
  return prepareNewsletterHtmlForEsp(html);
}
export {
  renderWeeklyBOTDNewsletterHtmlMjml
};
