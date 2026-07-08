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
import { formatNewsletterWeekRange } from "./newsletterUtils";
import { prepareNewsletterHtmlForEsp } from "./newsletterEspHtml";
import {
  BookFeatureCard,
  CreatorFeatureCard,
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
  TrendingCreatorFeatureCard,
} from "./newsletter/newsletterComponents";
import {
  appBaseUrl,
  brand,
  featureCardMobileSidePaddingPx,
  featureCardRowImageWidthPx,
  featureCardRowMobileGapPx,
  featureCardRowMobileImageMaxWidthPx,
  newsletterWidthPx,
} from "./newsletter/newsletterTokens";

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
  .feature-card-row-kicker,
  .feature-card-row-kicker div,
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
  .feature-title div,
  .feature-card-row-title,
  .feature-card-row-title div {
    font-family: ${brand.fontDisplay} !important;
  }
  .section-heading-rule td {
    border-bottom: 2px solid ${brand.outlineStrong};
  }
  .feature-card {
    border: 1px solid ${brand.outline};
  }
  .feature-card-row-section {
    margin-bottom: 16px !important;
  }
  .feature-card-row-section .feature-card-row-image-col,
  .feature-card-row-section .feature-card-row-text-col,
  .feature-card-row-section .feature-card-row-action-col {
    width: 100% !important;
    max-width: 100% !important;
    display: block !important;
  }
  .feature-card-row-image-col {
    padding: ${featureCardRowMobileGapPx}px ${featureCardRowMobileGapPx}px 0 !important;
  }
  .feature-card-row-text-col {
    padding: ${featureCardRowMobileGapPx}px ${featureCardRowMobileGapPx}px 0 !important;
  }
  .feature-card-row-action-col {
    padding: ${featureCardRowMobileGapPx}px ${featureCardRowMobileGapPx}px ${featureCardRowMobileGapPx}px !important;
  }
  .feature-card-row-text-col,
  .feature-card-row-text-col table,
  .feature-card-row-text-col td,
  .feature-card-row-kicker,
  .feature-card-row-kicker div,
  .feature-card-row-title,
  .feature-card-row-title div,
  .feature-card-row-body,
  .feature-card-row-body div {
    text-align: center !important;
  }
  .feature-card-row-section .feature-card-row-img-book img,
  .feature-card-row-section .feature-card-row-img-square img {
    width: 100% !important;
    max-width: ${featureCardRowMobileImageMaxWidthPx}px !important;
    height: auto !important;
    margin: 0 auto !important;
  }
  .feature-card-row-section .feature-card-row-img-book td,
  .feature-card-row-section .feature-card-row-img-square td,
  .feature-card-row-section .feature-card-row-img-book > table,
  .feature-card-row-section .feature-card-row-img-square > table {
    width: 100% !important;
    max-width: ${featureCardRowMobileImageMaxWidthPx}px !important;
    margin: 0 auto !important;
  }
  .feature-card-row-section .feature-card-row-action-col table {
    margin: 0 auto !important;
    width: 100% !important;
  }
  .feature-card-row-section .feature-card-row-button table {
    width: 100% !important;
  }
  .feature-card-row-section .feature-card-row-button a {
    display: block !important;
    width: 100% !important;
    box-sizing: border-box !important;
    text-align: center !important;
    white-space: normal !important;
  }
  @media only screen and (min-width: 601px) {
    .feature-card-row-section .feature-card-row-image-col,
    .feature-card-row-section .feature-card-row-action-col {
      width: 30% !important;
      max-width: 30% !important;
      display: inline-block !important;
      vertical-align: middle !important;
    }
    .feature-card-row-section .feature-card-row-text-col {
      width: 40% !important;
      max-width: 40% !important;
      display: inline-block !important;
      vertical-align: middle !important;
      padding: 8px 0 !important;
    }
    .feature-card-row-image-col {
      padding: 8px 0 8px 8px !important;
    }
    .feature-card-row-action-col {
      padding: 8px 8px 8px 0 !important;
    }
    .feature-card-row-text-col,
    .feature-card-row-text-col table,
    .feature-card-row-text-col td,
    .feature-card-row-kicker,
    .feature-card-row-kicker div,
    .feature-card-row-title,
    .feature-card-row-title div,
    .feature-card-row-body,
    .feature-card-row-body div {
      text-align: left !important;
    }
    .feature-card-row-section .feature-card-row-img-book img,
    .feature-card-row-section .feature-card-row-img-square img {
      max-width: ${featureCardRowImageWidthPx}px !important;
    }
    .feature-card-row-section .feature-card-row-img-book td,
    .feature-card-row-section .feature-card-row-img-square td,
    .feature-card-row-section .feature-card-row-img-book > table,
    .feature-card-row-section .feature-card-row-img-square > table {
      max-width: ${featureCardRowImageWidthPx}px !important;
    }
    .feature-card-row-section .feature-card-row-action-col table {
      margin-left: auto !important;
      margin-right: 0 !important;
      width: auto !important;
    }
    .feature-card-row-section .feature-card-row-button table {
      width: auto !important;
    }
    .feature-card-row-section .feature-card-row-button a {
      display: inline-block !important;
      width: auto !important;
      white-space: nowrap !important;
    }
  }
  .feature-card-row-section > table > tbody > tr > td {
    border-top: 1px solid ${brand.outline};
    border-bottom: 1px solid ${brand.outline};
    background-color: ${brand.surface};
  }
  .feature-card-row-section > table > tbody > tr > td:first-child {
    border-left: 1px solid ${brand.outline};
  }
  .feature-card-row-section > table > tbody > tr > td:last-child {
    border-right: 1px solid ${brand.outline};
  }
  .feature-card-row-image-col img {
    display: block;
    border: 0;
    margin: 0 auto;
  }
  .feature-card-row-img-book img {
    width: 100%;
    max-width: ${featureCardRowImageWidthPx}px;
    height: auto;
  }
  .feature-card-row-img-square img {
    object-fit: cover;
    object-position: center;
    width: 100%;
    max-width: ${featureCardRowImageWidthPx}px;
    height: auto;
    aspect-ratio: 1 / 1;
  }
  .feature-card-row-img-book > table,
  .feature-card-row-img-square > table {
    width: 100%;
  }
  .feature-card-row-action-col table {
    margin-left: auto;
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
    .feature-card-row-section > table > tbody > tr > td {
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

const WeeklyNewsletterMjml = (params: WeeklyNewsletterRenderParams) => (
  <Mjml lang="en">
    <MjmlHead>
      <MjmlTitle>{params.subject}</MjmlTitle>
      <MjmlFont
        name="Instrument Sans"
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap"
      />
      <MjmlFont
        name="Fraunces"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap"
      />
      <MjmlFont
        name="Caveat"
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap"
      />
      <MjmlAttributes>
        <MjmlAll fontFamily={brand.fontSans} color={brand.onSurface} />
        <MjmlText lineHeight="1.65" fontSize="15px" />
      </MjmlAttributes>
      <MjmlBreakpoint width="600px" />
      <MjmlStyle>{responsiveStyles}</MjmlStyle>
    </MjmlHead>
    <MjmlBody backgroundColor={brand.surface} width={newsletterWidthPx}>
      <NewsletterHeader />
      <NewsletterSubject
        subject={params.subject}
        weekLabel={formatNewsletterWeekRange(params.weekStart, params.weekEnd)}
      />
      <NewsletterAppPromo />

      {params.botdEntries.length > 0 ? (
        <SectionHeading kicker="Daily picks">Books of the day</SectionHeading>
      ) : null}

      {params.botdEntries.length > 0 &&
        params.botdEntries.map((book) => (
          <BookFeatureCard key={book.bookId} book={book} />
        ))}

      {params.artistOfTheWeek ? (
        <>
          <SectionHeading kicker="Spotlight">Artist of the week</SectionHeading>
          <CreatorFeatureCard
            creator={params.artistOfTheWeek}
            profilePath="artist-of-the-week"
          />
        </>
      ) : null}

      {params.publisherOfTheWeek ? (
        <>
          <SectionHeading kicker="Spotlight">
            Publisher of the week
          </SectionHeading>
          <CreatorFeatureCard
            creator={params.publisherOfTheWeek}
            profilePath="publisher-of-the-week"
          />
        </>
      ) : null}

      {(params.trending?.books.length ?? 0) > 0 ? (
        <>
          <SectionHeading kicker="Trending">Top books this week</SectionHeading>
          {params.trending!.books.map((book) => (
            <TrendingBookFeatureCard key={book.bookId} book={book} />
          ))}
        </>
      ) : null}

      {(params.trending?.artists.length ?? 0) > 0 ? (
        <>
          <SectionHeading kicker="Trending">
            Top artists this week
          </SectionHeading>
          {params.trending!.artists.map((artist) => (
            <TrendingCreatorFeatureCard key={artist.slug} creator={artist} />
          ))}
        </>
      ) : null}

      {(params.trending?.publishers.length ?? 0) > 0 ? (
        <>
          <SectionHeading kicker="Trending">
            Top publishers this week
          </SectionHeading>
          {params.trending!.publishers.map((publisher) => (
            <TrendingCreatorFeatureCard
              key={publisher.slug}
              creator={publisher}
            />
          ))}
        </>
      ) : null}

      {(params.newMembers?.length ?? 0) > 0 ? (
        <>
          <SectionHeading kicker="Discover">New on Photobookers</SectionHeading>
          {params.newMembers!.map((member) => (
            <NewMemberFeatureCard key={member.slug} member={member} />
          ))}
        </>
      ) : null}

      {params.upcomingFair ? (
        <>
          <SectionHeading kicker="Coming up">Next week fair</SectionHeading>
          <FairFeatureCard fair={params.upcomingFair} />
        </>
      ) : null}

      <NewsletterOutro outroText={params.outroText} />
      <NewsletterCtaButton label={params.ctaText} href={`${appBaseUrl}`} />
      <NewsletterFooter />
    </MjmlBody>
  </Mjml>
);

/** Renders the weekly newsletter: JSX → MJML → email-safe HTML. */
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
