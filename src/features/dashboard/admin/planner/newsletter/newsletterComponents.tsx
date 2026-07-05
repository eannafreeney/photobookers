/** @jsxImportSource react */
import type { ReactNode } from "react";
import {
  MjmlSection,
  MjmlColumn,
  MjmlText,
  MjmlButton,
  MjmlImage,
  MjmlDivider,
} from "mjml-react";
import { parseDateString } from "../../../../../lib/utils";
import type {
  WeeklyNewsletterBookItem,
  WeeklyNewsletterCreatorSpotlight,
  WeeklyNewsletterFairItem,
  WeeklyNewsletterNewMember,
  WeeklyNewsletterTrendingBookItem,
  WeeklyNewsletterTrendingCreatorItem,
} from "../newsletterTemplate";
import {
  appBaseUrl,
  appStoreUrl,
  brand,
  newsletterAssets,
  newsletterLogoWidthPx,
  newsletterNavLinks,
  newsletterSocial,
  featureCardContentWidthPx,
} from "./newsletterTokens";

const NewsletterLogo = ({ padding }: { padding: string }) => (
  <MjmlImage
    src={newsletterAssets.logo}
    alt="Photobookers"
    href={appBaseUrl}
    width={`${newsletterLogoWidthPx}px`}
    fluidOnMobile="false"
    align="center"
    padding={padding}
    cssClass="newsletter-logo-img"
  />
);

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

const kickerTextProps = {
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
  lineHeight: "1.2",
  align: "center" as const,
};

const sectionPadding = "0 25px";

export const SectionHeading = ({
  kicker,
  children,
}: {
  kicker?: string;
  children: ReactNode;
}) => (
  <MjmlSection backgroundColor={brand.surface} padding="28px">
    <MjmlColumn>
      {kicker ? (
        <MjmlText
          {...kickerTextProps}
          color={brand.accent}
          padding="0 0 6px"
          align="left"
          cssClass="section-kicker"
        >
          {kicker}
        </MjmlText>
      ) : null}
      <MjmlText
        fontSize="24px"
        fontWeight={500}
        lineHeight="1.2"
        color={brand.onSurfaceStrong}
        padding="0 0 12px"
        align="left"
        fontFamily={brand.fontDisplay}
        cssClass="section-title"
      >
        {children}
      </MjmlText>
      <MjmlDivider
        borderWidth="2px"
        borderColor={brand.outlineStrong}
        padding="0"
        cssClass="section-heading-rule"
      />
    </MjmlColumn>
  </MjmlSection>
);

export const NewsletterHeader = () => (
  <MjmlSection
    backgroundColor={brand.surface}
    padding="24px 25px 0"
    cssClass="newsletter-header"
  >
    <MjmlColumn>
      <NewsletterLogo padding="0 0 20px" />
      <MjmlDivider
        borderWidth="2px"
        borderColor={brand.outlineStrong}
        padding="0"
        cssClass="newsletter-header-rule"
      />
    </MjmlColumn>
  </MjmlSection>
);

export const NewsletterSubject = ({
  subject,
  weekLabel,
}: {
  subject: string;
  weekLabel?: string;
}) => (
  <MjmlSection
    backgroundColor={brand.surface}
    padding="0"
    cssClass="newsletter-subject"
  >
    <MjmlColumn padding="0">
      <MjmlText
        {...kickerTextProps}
        color={brand.accent}
        padding="20px 25px 8px"
        cssClass="newsletter-kicker"
      >
        Photobookers Weekly
      </MjmlText>
      {weekLabel ? (
        <MjmlText
          {...kickerTextProps}
          color={brand.onSurfaceWeak}
          padding="0 25px 12px"
          cssClass="newsletter-week"
        >
          {weekLabel}
        </MjmlText>
      ) : null}
      <MjmlText
        align="center"
        fontSize="32px"
        fontWeight={500}
        lineHeight="1.15"
        color={brand.onSurfaceStrong}
        padding="0 25px 20px"
        fontFamily={brand.fontDisplay}
        cssClass="newsletter-subject-text"
      >
        {subject}
      </MjmlText>
    </MjmlColumn>
  </MjmlSection>
);

export const NewsletterIntro = ({ introText }: { introText: string }) => (
  <MjmlSection backgroundColor={brand.surface} padding="0">
    <MjmlColumn>
      <MjmlText
        align="center"
        fontSize="15px"
        lineHeight="1.65"
        color={brand.onSurface}
        padding="0 25px 24px"
      >
        {introText}
      </MjmlText>
    </MjmlColumn>
  </MjmlSection>
);

export const NewsletterAppPromo = () => (
  <MjmlSection backgroundColor={brand.surface} padding="0 25px 24px">
    <MjmlColumn>
      <MjmlButton
        href={appStoreUrl}
        backgroundColor={brand.primary}
        color={brand.onPrimary}
        fontSize="11px"
        fontWeight={600}
        letterSpacing="0.16em"
        textTransform="uppercase"
        borderRadius="0"
        innerPadding="14px 28px"
        align="center"
        cssClass="newsletter-cta-button"
      >
        Download iOS App
      </MjmlButton>
    </MjmlColumn>
  </MjmlSection>
);

export const NewsletterOutro = ({ outroText }: { outroText: string }) => (
  <MjmlSection backgroundColor={brand.surface} padding="8px 0 0">
    <MjmlColumn>
      <MjmlText
        fontSize="15px"
        lineHeight="1.65"
        color={brand.onSurface}
        padding="0 25px 0"
      >
        {outroText}
      </MjmlText>
    </MjmlColumn>
  </MjmlSection>
);

export const NewsletterCtaButton = ({
  label,
  href,
}: {
  label: string;
  href: string;
}) => (
  <MjmlSection backgroundColor={brand.surface} padding="24px 25px 8px">
    <MjmlColumn>
      <MjmlButton
        href={href}
        backgroundColor={brand.primary}
        color={brand.onPrimary}
        fontSize="11px"
        fontWeight={600}
        letterSpacing="0.16em"
        textTransform="uppercase"
        borderRadius="0"
        innerPadding="14px 28px"
        align="center"
        cssClass="newsletter-cta-button"
      >
        {label}
      </MjmlButton>
    </MjmlColumn>
  </MjmlSection>
);

export const NewsletterFooter = () => (
  <MjmlSection backgroundColor={brand.surfaceAlt} padding="0">
    <MjmlColumn>
      <MjmlDivider
        borderWidth="2px"
        borderColor={brand.outlineStrong}
        padding="24px 25px 0"
      />
      {/* <NewsletterLogo padding="20px 25px 12px" /> */}
      <MjmlText
        align="center"
        fontSize="14px"
        lineHeight="1.6"
        color={brand.onSurface}
        padding="0 25px 16px"
      >
        The home for photobook lovers. Discover books, follow artists and
        publishers, and keep up with the photobook world.
      </MjmlText>
      <MjmlText
        align="center"
        padding="0 25px 16px"
        cssClass="newsletter-nav-link"
      >
        {newsletterNavLinks.map((link, index) => (
          <span key={link.href}>
            {index > 0 ? (
              <span style={{ color: brand.onSurfaceWeak }}> · </span>
            ) : null}
            <a
              href={link.href}
              style={{ color: brand.onSurface, textDecoration: "none" }}
            >
              {link.label}
            </a>
          </span>
        ))}
      </MjmlText>
      <MjmlText align="center" padding="0 25px 8px">
        <a href={newsletterSocial.instagramUrl}>
          <img
            src={newsletterSocial.instagramIconUrl}
            alt="Instagram"
            width="20"
            height="20"
            style={{ display: "inline-block" }}
          />
        </a>
      </MjmlText>
      <MjmlText
        align="center"
        fontSize="11px"
        color={brand.onSurfaceWeak}
        padding="8px 25px 0"
        cssClass="footer-kicker"
        letterSpacing="0.18em"
        textTransform="uppercase"
      >
        © {new Date().getFullYear()} Photobookers
      </MjmlText>
      <MjmlText
        align="center"
        fontSize="12px"
        color={brand.onSurfaceWeak}
        padding="12px 25px 24px"
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
);

type FeatureCardProps = {
  kicker: string;
  title: string;
  body: string;
  linkHref: string;
  linkLabel: string;
  image: ReactNode | null;
};

const FeatureCard = ({
  kicker,
  title,
  body,
  linkHref,
  linkLabel,
  image,
}: FeatureCardProps) => (
  <MjmlSection
    backgroundColor={brand.surface}
    padding={`0 ${sectionPadding} 16px`}
    cssClass="feature-card-section"
  >
    <MjmlColumn
      backgroundColor={brand.surface}
      border={`1px solid ${brand.outline}`}
      padding="0"
      cssClass="feature-card"
    >
      {image}
      <MjmlText
        {...kickerTextProps}
        color={brand.onSurfaceWeak}
        padding="16px 16px 0"
        align="left"
        cssClass="feature-kicker"
      >
        {kicker}
      </MjmlText>
      <MjmlText
        fontSize="22px"
        fontWeight={500}
        lineHeight="1.25"
        color={brand.onSurfaceStrong}
        padding="8px 16px 0"
        align="left"
        fontFamily={brand.fontDisplay}
        cssClass="feature-title"
      >
        {title}
      </MjmlText>
      {body ? (
        <MjmlText
          fontSize="14px"
          lineHeight="1.55"
          color={brand.onSurface}
          padding="8px 16px 0"
          align="left"
        >
          {body}
        </MjmlText>
      ) : null}
      <MjmlText
        padding="12px 16px 18px"
        align="left"
        cssClass="newsletter-accent-link"
      >
        <a
          href={linkHref}
          style={{
            color: brand.accent,
            textDecoration: "underline",
            fontWeight: 600,
          }}
        >
          {linkLabel} →
        </a>
      </MjmlText>
    </MjmlColumn>
  </MjmlSection>
);

const featureCardImageProps = {
  width: `${featureCardContentWidthPx}px`,
  fluidOnMobile: "true" as const,
  align: "center" as const,
  padding: "0",
};

const buildBookBody = (item: WeeklyNewsletterBookItem): string => {
  const parts: string[] = [];
  if (item.artistName) parts.push(item.artistName);
  if (item.publisherName) parts.push(item.publisherName);
  return parts.join(" · ");
};

type BookFeatureCardProps = {
  book: WeeklyNewsletterBookItem;
  reversed?: boolean;
};

export const BookFeatureCard = ({ book }: BookFeatureCardProps) => (
  <FeatureCard
    kicker={formatNewsletterDate(book.date)}
    image={
      book.coverUrl ? (
        <MjmlImage
          {...featureCardImageProps}
          src={book.coverUrl}
          alt={book.title}
          cssClass="feature-card-img feature-card-img-book"
        />
      ) : null
    }
    title={book.title}
    body={buildBookBody(book)}
    linkHref={`${appBaseUrl}/book-of-the-day/${book.date}`}
    linkLabel="View book"
  />
);

const buildTrendingBookBody = (item: WeeklyNewsletterTrendingBookItem): string => {
  const parts: string[] = [];
  if (item.artistName) parts.push(item.artistName);
  if (item.publisherName) parts.push(item.publisherName);
  return parts.join(" · ");
};

export const TrendingBookFeatureCard = ({
  book,
}: {
  book: WeeklyNewsletterTrendingBookItem;
}) => (
  <FeatureCard
    kicker="Book"
    image={
      book.coverUrl ? (
        <MjmlImage
          {...featureCardImageProps}
          src={book.coverUrl}
          alt={book.title}
          cssClass="feature-card-img feature-card-img-book"
        />
      ) : null
    }
    title={book.title}
    body={buildTrendingBookBody(book)}
    linkHref={`${appBaseUrl}/books/${book.bookSlug}`}
    linkLabel="View book"
  />
);

export const TrendingCreatorFeatureCard = ({
  creator,
}: {
  creator: WeeklyNewsletterTrendingCreatorItem;
}) => (
  <FeatureCard
    kicker={creator.type === "artist" ? "Artist" : "Publisher"}
    image={
      creator.coverUrl ? (
        <MjmlImage
          {...featureCardImageProps}
          src={creator.coverUrl}
          alt={creator.displayName}
          cssClass="feature-card-img feature-card-img-square"
        />
      ) : null
    }
    title={creator.displayName}
    body=""
    linkHref={`${appBaseUrl}/creators/${creator.slug}`}
    linkLabel="View profile"
  />
);

const buildCreatorBody = (
  creator: NonNullable<WeeklyNewsletterCreatorSpotlight>,
): string => {
  const parts: string[] = [];
  if (creator.tagline) parts.push(creator.tagline);
  if (creator.location) parts.push(creator.location);
  return parts.join(" · ");
};

const buildNewMemberBody = (member: WeeklyNewsletterNewMember): string => {
  const parts: string[] = [];
  if (member.tagline) parts.push(member.tagline);
  if (member.location) parts.push(member.location);
  return parts.join(" · ");
};

const formatFairDateRange = (
  startDateStr: string,
  endDateStr: string,
): string => {
  const startDate = parseDateString(startDateStr);
  const endDate = parseDateString(endDateStr);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return [startDateStr, endDateStr].filter(Boolean).join(" - ");
  }

  const startMonth = startDate.toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const endMonth = endDate.toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
  const startDay = startDate.toLocaleDateString("en-US", {
    day: "numeric",
    timeZone: "UTC",
  });
  const endDay = endDate.toLocaleDateString("en-US", {
    day: "numeric",
    timeZone: "UTC",
  });
  const endYear = endDate.toLocaleDateString("en-US", {
    year: "numeric",
    timeZone: "UTC",
  });

  if (startDateStr === endDateStr) {
    return `${startMonth} ${startDay}, ${endYear}`;
  }

  if (
    startDate.getUTCMonth() === endDate.getUTCMonth() &&
    startDate.getUTCFullYear() === endDate.getUTCFullYear()
  ) {
    return `${startMonth} ${startDay}-${endDay}, ${endYear}`;
  }

  return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${endYear}`;
};

const buildFairBody = (fair: WeeklyNewsletterFairItem): string => {
  const parts: string[] = [formatFairDateRange(fair.startDate, fair.endDate)];
  if (fair.venue) parts.push(fair.venue);
  if (fair.location) parts.push(fair.location);
  return parts.join(" · ");
};

export const NewMemberFeatureCard = ({
  member,
}: {
  member: WeeklyNewsletterNewMember;
  reversed?: boolean;
}) => (
  <FeatureCard
    kicker={member.type === "artist" ? "Artist" : "Publisher"}
    image={
      member.coverUrl ? (
        <MjmlImage
          {...featureCardImageProps}
          src={member.coverUrl}
          alt={member.displayName}
          cssClass="feature-card-img feature-card-img-square"
        />
      ) : null
    }
    title={member.displayName}
    body={buildNewMemberBody(member)}
    linkHref={`${appBaseUrl}/creators/${member.slug}`}
    linkLabel="View profile"
  />
);

export const CreatorFeatureCard = ({
  creator,
  profilePath,
}: {
  creator: NonNullable<WeeklyNewsletterCreatorSpotlight>;
  profilePath: "artist-of-the-week" | "publisher-of-the-week";
  reversed?: boolean;
}) => (
  <FeatureCard
    kicker={profilePath === "artist-of-the-week" ? "Artist" : "Publisher"}
    image={
      creator.coverUrl ? (
        <MjmlImage
          {...featureCardImageProps}
          src={creator.coverUrl}
          alt={creator.displayName}
          cssClass="feature-card-img feature-card-img-square"
        />
      ) : null
    }
    title={creator.displayName}
    body={buildCreatorBody(creator)}
    linkHref={`${appBaseUrl}/${profilePath}/${creator.weekKey}`}
    linkLabel="View profile"
  />
);

export const FairFeatureCard = ({ fair }: { fair: WeeklyNewsletterFairItem }) => (
  <FeatureCard
    kicker="Book fair"
    image={
      fair.coverUrl ? (
        <MjmlImage
          {...featureCardImageProps}
          src={fair.coverUrl}
          alt={fair.name}
          cssClass="feature-card-img feature-card-img-book"
        />
      ) : null
    }
    title={fair.name}
    body={buildFairBody(fair)}
    linkHref={`${appBaseUrl}/fairs/${fair.slug}`}
    linkLabel="View fair"
  />
);

export const EmptyBotdMessage = () => (
  <MjmlSection backgroundColor={brand.surface} padding="0 0 12px">
    <MjmlColumn>
      <MjmlText
        fontSize="14px"
        lineHeight="1.6"
        color={brand.onSurface}
        padding="0 25px 12px"
      >
        No BOTD entries were scheduled for this week.
      </MjmlText>
    </MjmlColumn>
  </MjmlSection>
);
