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
  NewMemberFeatureCard,
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
  featureCardMobileSidePaddingPx,
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
      {/* <NewsletterIntro introText={params.introText} /> */}

      {params.items.length > 0 ? (
        <SectionHeading kicker="Daily picks">Books of the day</SectionHeading>
      ) : null}

      {params.items.length > 0 &&
        params.items.map((book) => (
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

      {(params.newMembers?.length ?? 0) > 0 ? (
        <>
          <SectionHeading kicker="Discover">New on Photobookers</SectionHeading>
          {params.newMembers!.map((member) => (
            <NewMemberFeatureCard key={member.slug} member={member} />
          ))}
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
