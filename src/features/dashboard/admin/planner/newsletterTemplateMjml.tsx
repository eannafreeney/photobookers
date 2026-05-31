/** @jsxImportSource react */
import type { ReactNode } from "react";
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
  MjmlWrapper,
  MjmlSection,
  MjmlColumn,
  MjmlText,
  MjmlButton,
  MjmlImage,
} from "mjml-react";
import { parseDateString } from "../../../../lib/utils";
import type {
  WeeklyNewsletterBookItem,
  WeeklyNewsletterCreatorSpotlight,
  WeeklyNewsletterRenderParams,
} from "./newsletterTemplate";
import {
  emailFontLogo,
  emailFontSans,
  prepareNewsletterHtmlForEsp,
} from "./newsletterEspHtml";

const appBaseUrl = process.env.PUBLIC_APP_URL ?? "https://www.photobookers.com";

const brand = {
  surface: "#ffffff",
  surfaceAlt: "#fafafa",
  onSurface: "#525252",
  onSurfaceStrong: "#171717",
  onSurfaceWeak: "#a3a3a3",
  outline: "#d4d4d4",
  primary: "#000000",
  onPrimary: "#f5f5f5",
  fontSans: emailFontSans,
  fontLogo: emailFontLogo,
} as const;

const cardGapPx = 16;
const cardImageWidthPx = 220;
const cardImageColumnWidthPx = 240;

const cardResponsiveStyles = `
  .newsletter-card-spacer {
    padding-bottom: ${cardGapPx}px !important;
  }
  .card-media-col img {
    border-radius: 8px;
    border: 1px solid ${brand.outline};
  }
  .card-cover-img-square img {
    object-fit: cover;
    object-position: center;
  }
  @media only screen and (min-width: 601px) {
    .card-media-col > table > tbody > tr > td,
    .card-body-col > table > tbody > tr > td {
      vertical-align: middle !important;
    }
    .card-body-col {
      text-align: center !important;
    }
    .card-body-col > table > tbody > tr > td,
    .card-body-col .mj-text,
    .card-body-col .mj-text div,
    .card-body-col .mj-button,
    .card-body-col .mj-button td {
      text-align: center !important;
    }
    .card-body-col .card-cta-button table {
      margin-left: auto !important;
      margin-right: auto !important;
    }
  }
  @media only screen and (max-width: 600px) {
    .card-row {
      text-align: center !important;
    }
    .card-media-col,
    .card-body-col {
      text-align: center !important;
    }
    .card-cover-img,
    .card-cover-img table,
    .card-cover-img td {
      padding-left: 0 !important;
      padding-right: 0 !important;
      text-align: center !important;
    }
    .card-media-col > table > tbody > tr > td {
      padding-bottom: ${cardGapPx}px !important;
      text-align: center !important;
    }
    .card-media-col .mj-full-width-mobile,
    .card-media-col table.mj-full-width-mobile,
    .card-media-col td.mj-full-width-mobile,
    .card-cover-img table,
    .card-cover-img-square table {
      width: 100% !important;
      max-width: 100% !important;
    }
    .card-media-col td.mj-full-width-mobile {
      width: 100% !important;
      max-width: 100% !important;
    }
    .card-cover-img img,
    .card-cover-img-square img {
      width: 100% !important;
      max-width: 100% !important;
      height: auto !important;
      margin: 0 auto !important;
      display: block !important;
    }
    .card-cover-img-square img {
      aspect-ratio: 1 / 1;
      object-fit: cover;
    }
    .card-body-col > table > tbody > tr > td {
      text-align: center !important;
    }
    .card-body-col .mj-button,
    .card-body-col .mj-text,
    .card-body-col .mj-text div,
    .card-body-col .mj-button td {
      text-align: center !important;
    }
    .card-body-col .card-cta-button table {
      margin-left: auto !important;
      margin-right: auto !important;
    }
  }
`;

const formatNewsletterDate = (dateStr: string): string => {
  const date = parseDateString(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

const sectionHeadingProps = {
  cssClass: "section-heading",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: brand.onSurfaceWeak,
  paddingBottom: "8px",
};

const cardSectionProps = {
  padding: "12px",
  border: `1px solid ${brand.outline}`,
  borderRadius: "8px",
  backgroundColor: brand.surface,
  cssClass: "newsletter-card newsletter-card-spacer",
};

const CardMediaTextColumns = ({
  image,
  children,
}: {
  image: ReactNode | null;
  children: ReactNode;
}) => (
  <>
    {image ? (
      <MjmlColumn
        width={`${cardImageColumnWidthPx}px`}
        cssClass="card-media-col"
        verticalAlign="middle"
      >
        {image}
      </MjmlColumn>
    ) : null}
    <MjmlColumn cssClass="card-body-col" verticalAlign="middle">
      {children}
    </MjmlColumn>
  </>
);

const coverImageProps = {
  cssClass: "card-cover-img",
  width: `${cardImageWidthPx}px`,
  fluidOnMobile: "true",
  align: "center",
  padding: "0",
  border: `1px solid ${brand.outline}`,
  borderRadius: "8px",
} as const;

const BookCard = ({ item }: { item: WeeklyNewsletterBookItem }) => (
  <MjmlSection
    {...cardSectionProps}
    cssClass="newsletter-card newsletter-card-spacer card-row"
  >
    <CardMediaTextColumns
      image={
        item.coverUrl ? (
          <MjmlImage
            {...coverImageProps}
            src={item.coverUrl}
            alt={item.title}
          />
        ) : null
      }
    >
      <MjmlText
        fontSize="12px"
        color={brand.onSurfaceWeak}
        padding="0 0 4px"
        align="center"
      >
        {formatNewsletterDate(item.date)}
      </MjmlText>
      <MjmlText
        fontSize="17px"
        fontWeight={600}
        lineHeight="1.35"
        color={brand.onSurfaceStrong}
        padding="0"
        align="center"
      >
        {item.title}
      </MjmlText>
      {item.artistName ? (
        <MjmlText
          fontSize="13px"
          color={brand.onSurface}
          padding="4px 0 0"
          align="center"
        >
          {item.artistName}
        </MjmlText>
      ) : null}
      {item.publisherName ? (
        <MjmlText
          fontSize="13px"
          color={brand.onSurfaceWeak}
          padding="2px 0 0"
          align="center"
        >
          {item.publisherName}
        </MjmlText>
      ) : null}
      <MjmlButton
        href={`${appBaseUrl}/books/${item.bookSlug}`}
        backgroundColor={brand.primary}
        color={brand.onPrimary}
        fontSize="14px"
        fontWeight={600}
        borderRadius="4px"
        innerPadding="10px 20px"
        align="center"
        cssClass="card-cta-button"
        padding="12px 0 0"
      >
        View book
      </MjmlButton>
    </CardMediaTextColumns>
  </MjmlSection>
);

const CreatorSpotlightSection = ({
  label,
  creator,
}: {
  label: string;
  creator: NonNullable<WeeklyNewsletterCreatorSpotlight>;
}) => [
  <MjmlSection key={`${label}-heading`} padding="8px 0 0">
    <MjmlColumn>
      <MjmlText {...sectionHeadingProps}>{label}</MjmlText>
    </MjmlColumn>
  </MjmlSection>,
  <MjmlSection
    key={`${label}-card`}
    {...cardSectionProps}
    backgroundColor={brand.surfaceAlt}
    padding="12px"
    cssClass="newsletter-card newsletter-card-spacer card-row"
  >
    <CardMediaTextColumns
      image={
        creator.coverUrl ? (
          <MjmlImage
            {...coverImageProps}
            cssClass="card-cover-img card-cover-img-square"
            src={creator.coverUrl}
            alt={creator.displayName}
            height={`${cardImageWidthPx}px`}
          />
        ) : null
      }
    >
      <MjmlText
        fontSize="20px"
        fontWeight={600}
        lineHeight="1.3"
        color={brand.onSurfaceStrong}
        padding="0"
        align="center"
      >
        {creator.displayName}
      </MjmlText>
      {creator.tagline ? (
        <MjmlText
          fontSize="14px"
          lineHeight="1.55"
          color={brand.onSurface}
          padding="8px 0 0"
          align="center"
        >
          {creator.tagline}
        </MjmlText>
      ) : null}
      {creator.location ? (
        <MjmlText
          fontSize="13px"
          lineHeight="1.5"
          color={brand.onSurfaceWeak}
          padding={creator.tagline ? "4px 0 0" : "8px 0 0"}
          align="center"
        >
          {creator.location}
        </MjmlText>
      ) : null}
      <MjmlButton
        href={`${appBaseUrl}/creators/${creator.slug}`}
        backgroundColor={brand.primary}
        color={brand.onPrimary}
        fontSize="14px"
        fontWeight={600}
        borderRadius="4px"
        innerPadding="10px 20px"
        align="center"
        cssClass="card-cta-button"
        padding="12px 0 0"
      >
        View profile
      </MjmlButton>
    </CardMediaTextColumns>
  </MjmlSection>,
];

const WeeklyNewsletterMjml = (params: WeeklyNewsletterRenderParams) => (
  <Mjml lang="en">
    <MjmlHead>
      <MjmlTitle>{params.subject}</MjmlTitle>
      <MjmlFont
        name="Instrument Sans"
        href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap"
      />
      <MjmlFont
        name="Caveat"
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&display=swap"
      />
      <MjmlAttributes>
        <MjmlAll fontFamily={brand.fontSans} color={brand.onSurface} />
        <MjmlText lineHeight="1.65" fontSize="15px" />
      </MjmlAttributes>
      <MjmlBreakpoint width="600px" />
      <MjmlStyle>{`
        .logo-link,
        .logo-link table,
        .logo-link td,
        .logo-link div,
        .logo-link a,
        .logo-link span {
          font-family: ${brand.fontLogo} !important;
          font-weight: 500 !important;
        }
        .section-heading { border-bottom: 1px solid ${brand.outline}; }
        ${cardResponsiveStyles}
      `}</MjmlStyle>
    </MjmlHead>
    <MjmlBody backgroundColor={brand.surfaceAlt} width={640}>
      <MjmlSection padding="16px 0">
        <MjmlColumn>
          <MjmlText
            align="center"
            fontSize="24px"
            fontWeight={500}
            fontFamily={brand.fontLogo}
            color={brand.onSurfaceStrong}
            cssClass="logo-link"
            padding="0"
          >
            <a
              href={appBaseUrl}
              style={{
                textDecoration: "none",
                color: brand.onSurfaceStrong,
                fontFamily: brand.fontLogo,
              }}
            >
              Photobookers
            </a>
          </MjmlText>
        </MjmlColumn>
      </MjmlSection>

      <MjmlWrapper
        padding="28px 24px"
        border={`1px solid ${brand.outline}`}
        borderRadius="8px"
        backgroundColor={brand.surface}
      >
        <MjmlSection padding="0 0 16px">
          <MjmlColumn>
            <MjmlText
              fontSize="26px"
              fontWeight={700}
              lineHeight="1.25"
              color={brand.onSurfaceStrong}
              padding="0"
            >
              {params.subject}
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>

        <MjmlSection padding="0 0 20px">
          <MjmlColumn>
            <MjmlText padding="0">{params.introText}</MjmlText>
          </MjmlColumn>
        </MjmlSection>

        {params.items.length > 0 ? (
          <MjmlSection padding="8px 0 12px">
            <MjmlColumn>
              <MjmlText {...sectionHeadingProps}>Books of the day</MjmlText>
            </MjmlColumn>
          </MjmlSection>
        ) : null}

        {params.items.length > 0 ? (
          params.items.map((item) => <BookCard key={item.bookId} item={item} />)
        ) : (
          <MjmlSection padding="12px 0">
            <MjmlColumn>
              <MjmlText padding="0">
                No BOTD entries were scheduled for this week.
              </MjmlText>
            </MjmlColumn>
          </MjmlSection>
        )}

        {params.artistOfTheWeek
          ? CreatorSpotlightSection({
              label: "Artist of the week",
              creator: params.artistOfTheWeek,
            })
          : null}

        {params.publisherOfTheWeek
          ? CreatorSpotlightSection({
              label: "Publisher of the week",
              creator: params.publisherOfTheWeek,
            })
          : null}

        <MjmlSection padding="20px 0 0">
          <MjmlColumn>
            <MjmlText padding="0">{params.outroText}</MjmlText>
          </MjmlColumn>
        </MjmlSection>
      </MjmlWrapper>

      <MjmlSection padding="24px 16px 0">
        <MjmlColumn>
          <MjmlText
            align="center"
            fontSize="12px"
            color={brand.onSurfaceWeak}
            padding="0"
          >
            <a
              href="{$unsubscribe}"
              style={{
                color: brand.onSurfaceWeak,
                textDecoration: "underline",
              }}
            >
              Unsubscribe
            </a>
          </MjmlText>
        </MjmlColumn>
      </MjmlSection>
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
