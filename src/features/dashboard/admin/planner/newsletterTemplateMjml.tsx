/** @jsxImportSource react */
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
  MjmlText,
} from "mjml-react";
import type { WeeklyNewsletterRenderParams } from "./newsletterTemplate";
import { prepareNewsletterHtmlForEsp } from "./newsletterEspHtml";
import {
  BookFeatureCard,
  CreatorFeatureCard,
  NewsletterCtaButton,
  NewsletterFooter,
  NewsletterHeader,
  NewsletterIntro,
  NewsletterOutro,
  NewsletterSubject,
  SectionHeading,
} from "./newsletter/newsletterComponents";
import {
  appBaseUrl,
  brand,
  featureImageWidthPx,
  newsletterWidthPx,
} from "./newsletter/newsletterTokens";

const responsiveStyles = `
  .newsletter-logo-img img {
    display: block;
    margin: 0 auto;
    border: 0;
  }
  .section-heading {
    border-bottom: 1px solid ${brand.outline};
  }
  .newsletter-subject > table > tbody > tr > td,
  .newsletter-subject-text,
  .newsletter-subject-text div {
    padding-top: 0 !important;
    margin-top: 0 !important;
  }
  .feature-card-img img {
    border-radius: 8px;
    border: 1px solid ${brand.outline};
  }
  .feature-card-img-square img {
    object-fit: cover;
    object-position: center;
  }
  @media only screen and (max-width: 600px) {
    .feature-card-row {
      text-align: center !important;
    }
    .feature-media-col,
    .feature-body-col {
      text-align: center !important;
    }
    .feature-media-col > table > tbody > tr > td {
      padding-bottom: 12px !important;
    }
    .feature-body-col .mj-text,
    .feature-body-col .mj-text div {
      text-align: center !important;
      padding-left: 25px !important;
      padding-right: 25px !important;
    }
    .feature-card-img img,
    .feature-card-img-square img {
      width: 100% !important;
      max-width: ${featureImageWidthPx}px !important;
      margin: 0 auto !important;
    }
    .feature-card-img-square img {
      aspect-ratio: 1 / 1;
      object-fit: cover;
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

const WeeklyNewsletterMjml = (params: WeeklyNewsletterRenderParams) => (
  <Mjml lang="en">
    <MjmlHead>
      <MjmlTitle>{params.subject}</MjmlTitle>
      <MjmlFont
        name="Instrument Sans"
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap"
      />
      <MjmlAttributes>
        <MjmlAll fontFamily={brand.fontSans} color={brand.onSurface} />
        <MjmlText lineHeight="1.65" fontSize="15px" />
      </MjmlAttributes>
      <MjmlBreakpoint width="600px" />
      <MjmlStyle>{responsiveStyles}</MjmlStyle>
    </MjmlHead>
    <MjmlBody backgroundColor={brand.surfaceAlt} width={newsletterWidthPx}>
      <NewsletterHeader />
      <NewsletterSubject subject={params.subject} />
      <NewsletterIntro introText={params.introText} />

      {params.items.length > 0 ? (
        <SectionHeading>Books of the day</SectionHeading>
      ) : null}

      {params.items.length > 0 &&
        params.items.map((book, index) => (
          <BookFeatureCard
            key={book.bookId}
            book={book}
            reversed={index % 2 === 1}
          />
        ))}

      {params.artistOfTheWeek ? (
        <>
          <SectionHeading>Artist of the week</SectionHeading>
          <CreatorFeatureCard creator={params.artistOfTheWeek} />
        </>
      ) : null}

      {params.publisherOfTheWeek ? (
        <>
          <SectionHeading>Publisher of the week</SectionHeading>
          <CreatorFeatureCard creator={params.publisherOfTheWeek} />
        </>
      ) : null}

      <NewsletterOutro outroText={params.outroText} />
      <NewsletterCtaButton label={params.ctaText} href={`${appBaseUrl}`} />
      {/* <NewsletterFooterBanner /> */}
      <NewsletterFooter />
    </MjmlBody>
  </Mjml>
);

/**
 * MJML-React alternative to {@link renderWeeklyBOTDNewsletterHtml}.
 * Renders JSX → MJML → email-safe HTML via the mjml compiler.
 */
export function renderWeeklyBOTDNewsletterHtmlMjml(
  params: WeeklyNewsletterRenderParams,
): string {
  const { html, errors } = render(<WeeklyNewsletterMjml {...params} />, {
    validationLevel: "soft",
    minify: false,
  });

  if (errors.length > 0) {
    console.error("MJML compile errors", errors);
    throw new Error("Failed to compile weekly newsletter MJML template");
  }

  return prepareNewsletterHtmlForEsp(html);
}
