/** @jsxImportSource react */
import type { ReactNode } from "react";
import {
  MjmlSection,
  MjmlColumn,
  MjmlText,
  MjmlButton,
  MjmlImage,
} from "mjml-react";
import { parseDateString } from "../../../../../lib/utils";
import type {
  WeeklyNewsletterBookItem,
  WeeklyNewsletterCreatorSpotlight,
  WeeklyNewsletterNewMember,
} from "../newsletterTemplate";
import {
  appBaseUrl,
  brand,
  featureImageWidthPx,
  newsletterAssets,
  newsletterLogoWidthPx,
  newsletterSocial,
  newsletterWidthPx,
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

const sectionHeadingProps = {
  cssClass: "section-heading",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: brand.onSurfaceWeak,
  padding: "16px 25px 8px",
  align: "left" as const,
};

const whiteSectionProps = {
  backgroundColor: brand.surface,
  padding: "0",
} as const;

const featureImageProps = {
  width: `${featureImageWidthPx}px`,
  fluidOnMobile: "true" as const,
  align: "center" as const,
  padding: "10px 30px 20px",
};

const textLinkStyle = {
  color: brand.onSurface,
  textDecoration: "underline",
  fontSize: "14px",
};

export const SectionHeading = ({ children }: { children: ReactNode }) => (
  <MjmlSection {...whiteSectionProps} padding="0">
    <MjmlColumn>
      <MjmlText {...sectionHeadingProps}>{children}</MjmlText>
    </MjmlColumn>
  </MjmlSection>
);

export const NewsletterHeader = () => (
  <MjmlSection
    backgroundColor={brand.surface}
    padding="0"
    cssClass="newsletter-header"
  >
    <MjmlColumn>
      <NewsletterLogo padding="18px 25px" />
    </MjmlColumn>
  </MjmlSection>
);

export const NewsletterHero = () => (
  <MjmlSection padding="0" backgroundColor={brand.surfaceAlt}>
    <MjmlColumn>
      <MjmlImage
        src={newsletterAssets.hero}
        alt="Photobookers weekly newsletter"
        width={`${newsletterWidthPx}px`}
        fluidOnMobile="true"
        padding="0"
        align="center"
      />
    </MjmlColumn>
  </MjmlSection>
);

export const NewsletterSubject = ({ subject }: { subject: string }) => (
  <MjmlSection
    backgroundColor={brand.surface}
    padding="0"
    paddingTop="0"
    cssClass="newsletter-subject"
  >
    <MjmlColumn padding="0" paddingTop="0">
      <MjmlText
        align="center"
        fontSize="28px"
        fontWeight={600}
        lineHeight="1.2"
        color={brand.onSurfaceStrong}
        padding="0 25px 12px"
        paddingTop="0"
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
        padding="0 25px 20px"
      >
        {introText}
      </MjmlText>
    </MjmlColumn>
  </MjmlSection>
);

export const NewsletterOutro = ({ outroText }: { outroText: string }) => (
  <MjmlSection backgroundColor={brand.surface} padding="0">
    <MjmlColumn>
      <MjmlText
        fontSize="15px"
        lineHeight="1.65"
        color={brand.onSurface}
        padding="20px 25px 0"
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
  <MjmlSection backgroundColor={brand.surface} padding="20px 0">
    <MjmlColumn>
      <MjmlButton
        href={href}
        backgroundColor={brand.primary}
        color={brand.onPrimary}
        fontSize="14px"
        fontWeight={600}
        borderRadius="4px"
        innerPadding="10px 25px"
        align="center"
        cssClass="newsletter-cta-button"
      >
        {label}
      </MjmlButton>
    </MjmlColumn>
  </MjmlSection>
);

export const NewsletterFooterBanner = () => (
  <MjmlSection padding="0" backgroundColor={brand.surface}>
    <MjmlColumn>
      <MjmlImage
        src={newsletterAssets.footerBanner}
        alt=""
        fluidOnMobile="true"
        padding="0"
        align="center"
      />
    </MjmlColumn>
  </MjmlSection>
);

export const NewsletterFooter = () => (
  <MjmlSection backgroundColor={brand.surface} padding="20px 0">
    <MjmlColumn>
      <NewsletterLogo padding="10px 25px" />
      <MjmlText align="center" padding="10px 25px">
        <a href={newsletterSocial.instagramUrl}>
          <img
            src={newsletterSocial.instagramIconUrl}
            alt="Instagram"
            width="20"
            height="20"
            style={{ display: "inline-block", borderRadius: "3px" }}
          />
        </a>
      </MjmlText>
      <MjmlText
        align="center"
        fontSize="12px"
        color={brand.onSurfaceWeak}
        padding="10px 25px 0"
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

type AlternatingFeatureCardProps = {
  reversed: boolean;
  image: ReactNode | null;
  title: string;
  body: string;
  linkHref: string;
  linkLabel: string;
};

const AlternatingFeatureCard = ({
  reversed,
  image,
  title,
  body,
  linkHref,
  linkLabel,
}: AlternatingFeatureCardProps) => (
  <MjmlSection
    backgroundColor={brand.surface}
    padding="0"
    direction={reversed ? "rtl" : "ltr"}
    cssClass="feature-card-row"
  >
    {image ? (
      <MjmlColumn
        width="50%"
        verticalAlign="middle"
        cssClass="feature-media-col"
      >
        {image}
      </MjmlColumn>
    ) : null}
    <MjmlColumn width="50%" verticalAlign="middle" cssClass="feature-body-col">
      <MjmlText
        fontSize="16px"
        fontWeight={700}
        lineHeight="1.35"
        color={brand.onSurfaceStrong}
        padding="10px 40px 0"
        align="left"
      >
        {title}
      </MjmlText>
      <MjmlText
        fontSize="14px"
        lineHeight="1.5"
        color={brand.onSurface}
        padding="10px 40px 0"
        align="left"
      >
        {body}
      </MjmlText>
      <MjmlText padding="10px 40px 20px" align="left">
        <a href={linkHref} style={textLinkStyle}>
          <u>{linkLabel}</u>
        </a>
        {" >"}
      </MjmlText>
    </MjmlColumn>
  </MjmlSection>
);

const buildBookBody = (item: WeeklyNewsletterBookItem): string => {
  const parts = [formatNewsletterDate(item.date)];
  if (item.artistName) parts.push(item.artistName);
  if (item.publisherName) parts.push(item.publisherName);
  return parts.join(" · ");
};

type BookFeatureCardProps = {
  book: WeeklyNewsletterBookItem;
  reversed: boolean;
};

export const BookFeatureCard = ({ book, reversed }: BookFeatureCardProps) => (
  <AlternatingFeatureCard
    reversed={reversed}
    image={
      book.coverUrl ? (
        <MjmlImage
          {...featureImageProps}
          src={book.coverUrl}
          alt={book.title}
          cssClass="feature-card-img"
        />
      ) : null
    }
    title={book.title}
    body={buildBookBody(book)}
    linkHref={`${appBaseUrl}/book-of-the-day/${book.date}`}
    linkLabel="View book"
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
  const parts: string[] = [
    member.type === "artist" ? "Artist" : "Publisher",
  ];
  if (member.tagline) parts.push(member.tagline);
  if (member.location) parts.push(member.location);
  return parts.join(" · ");
};

export const NewMemberFeatureCard = ({
  member,
  reversed = false,
}: {
  member: WeeklyNewsletterNewMember;
  reversed?: boolean;
}) => (
  <AlternatingFeatureCard
    reversed={reversed}
    image={
      member.coverUrl ? (
        <MjmlImage
          {...featureImageProps}
          src={member.coverUrl}
          alt={member.displayName}
          cssClass="feature-card-img feature-card-img-square"
          height={`${featureImageWidthPx}px`}
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
  reversed = false,
}: {
  creator: NonNullable<WeeklyNewsletterCreatorSpotlight>;
  profilePath: "artist-of-the-week" | "publisher-of-the-week";
  reversed?: boolean;
}) => (
  <AlternatingFeatureCard
    reversed={reversed}
    image={
      creator.coverUrl ? (
        <MjmlImage
          {...featureImageProps}
          src={creator.coverUrl}
          alt={creator.displayName}
          cssClass="feature-card-img feature-card-img-square"
          height={`${featureImageWidthPx}px`}
        />
      ) : null
    }
    title={creator.displayName}
    body={buildCreatorBody(creator)}
    linkHref={`${appBaseUrl}/${profilePath}/${creator.weekKey}`}
    linkLabel="View profile"
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
