/** @jsxImportSource react */
import {
  Section,
  Row,
  Column,
  Text,
  Button,
  Img,
  Hr,
  Head,
  Font,
} from "@react-email/components";
import {
  appBaseUrl,
  appStoreUrl,
  brand,
  newsletterAssets,
  newsletterNavLinks,
  newsletterSocial,
} from "./constants";
import { ReactNode } from "react";
import { formatNewsletterDate } from "./utils";

export const NewsletterHeader = () => (
  <Section style={{ padding: "12px 0 0" }}>
    <Row>
      <Column align="center" className="text-center">
        <Img
          src={newsletterAssets.logo}
          alt="Photobookers"
          height={32}
          className="mx-auto mb-4"
        />
        <Hr
          style={{ borderColor: brand.outlineStrong, borderWidth: 2 }}
          className="mt-0 mb-0 border-t-2"
        />
      </Column>
    </Row>
  </Section>
);

type NewsletterSubjectProps = {
  subject: string;
  weekLabel?: string;
};

export const NewsletterSubject = ({
  subject,
  weekLabel,
}: NewsletterSubjectProps) => (
  <Section className="p-0">
    <Row>
      <Column align="center" className="p-0">
        <Text
          style={{ color: brand.accent }}
          className="mt-0 mb-0 px-[25px] pt-4 pb-2 text-center text-[11px] font-semibold uppercase leading-[1.2] tracking-[0.18em]"
        >
          Photobookers Weekly
        </Text>
        {weekLabel ? (
          <Text
            style={{ color: brand.onSurfaceWeak }}
            className="mt-0 mb-0 px-[25px] pt-0 pb-3 text-center text-[11px] font-semibold uppercase leading-[1.2] tracking-[0.18em]"
          >
            {weekLabel}
          </Text>
        ) : null}
        <Text
          style={{
            color: brand.onSurfaceStrong,
            fontFamily: brand.fontDisplay,
          }}
          className="mt-0 mb-0 px-[25px] pt-0 pb-6 text-center text-[32px] font-medium leading-[1.1]"
        >
          {subject}
        </Text>
      </Column>
    </Row>
  </Section>
);

export const NewsletterAppPromo = () => (
  <Section style={{ padding: "0 0 8px" }}>
    <Row>
      <Column align="center">
        <Button
          href={appStoreUrl}
          style={{ margin: "0 auto" }}
          className="bg-black text-white text-xs font-semibold tracking-[0.16em] uppercase rounded px-6 py-4 text-center"
        >
          Download iOS App
        </Button>
      </Column>
    </Row>
  </Section>
);

type KickerProps = {
  children: ReactNode;
};

export const Kicker = ({ children }: KickerProps) => (
  <Text
    style={{ color: brand.accent }}
    className="m-0 mb-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] leading-[1.2]"
  >
    {children}
  </Text>
);

type SectionHeadingProps = {
  kicker?: string;
  children: ReactNode;
};

export const SectionHeading = ({ kicker, children }: SectionHeadingProps) => (
  <Section style={{ padding: "12px 0 0", margin: "32px 0" }}>
    <Row>
      <Column>
        {kicker && <Kicker>{kicker}</Kicker>}
        <Text
          className="m-0 text-2xl font-medium leading-[1.15] text-center"
          style={{ color: brand.onSurfaceStrong }}
        >
          {children}
        </Text>
        <Hr
          className="mt-3 mb-0 border-t-2 border-black"
          style={{ borderColor: brand.outlineStrong }}
        />
      </Column>
    </Row>
  </Section>
);

type BookFeatureCardBook = {
  date?: string;
  bookSlug: string;
  title: string;
  coverUrl: string | null;
  blurb?: string | null;
  artistName: string | null;
  publisherName: string | null;
};

type BookFeatureCardProps = {
  book: BookFeatureCardBook;
  inverted?: boolean;
};

export const BookFeatureCard = ({ book }: BookFeatureCardProps) => {
  const kicker = book.date ? formatNewsletterDate(book.date) : null;

  return (
    <Section className="mb-12">
      <Row>
        <Column>
          {book.coverUrl ? (
            <Img
              src={book.coverUrl}
              alt={book.title}
              className="block w-full object-cover mx-auto mb-3"
            />
          ) : null}
          {kicker && <Kicker>{kicker}</Kicker>}
          <Title>{book.title}</Title>
          {book.blurb ? <BodyCopy>{book.blurb}</BodyCopy> : null}
          <SubTitle>{book.artistName}</SubTitle>
          <SubTitle>{book.publisherName}</SubTitle>
          <ViewButton href={`${appBaseUrl}/books/${book.bookSlug}`} />
        </Column>
      </Row>
    </Section>
  );
};

type CreatorFeatureCardCreator = {
  displayName: string;
  slug: string;
  type?: "artist" | "publisher";
  coverUrl: string | null;
  tagline?: string | null;
  blurb?: string | null;
};

type CreatorFeatureCardProps = {
  creator: CreatorFeatureCardCreator;
};

export const CreatorFeatureCard = ({ creator }: CreatorFeatureCardProps) => {
  return (
    <Section className="mb-12">
      <Row>
        <Column>
          {creator.coverUrl ? (
            <RoundedImage src={creator.coverUrl} alt={creator.displayName} />
          ) : null}
          <Title>{creator.displayName}</Title>
          {creator.blurb ? <BodyCopy>{creator.blurb}</BodyCopy> : null}
          <ViewButton href={`${appBaseUrl}/creators/${creator.slug}`} />
        </Column>
      </Row>
    </Section>
  );
};

const ViewButton = ({ href }: { href: string }) => (
  <Button
    href={href}
    style={{
      display: "block",
      width: "50%",
      maxWidth: "100%",
      boxSizing: "border-box",
      margin: "12px auto 0",
      padding: "12px 0",
    }}
    className="bg-white text-black border-outlineStrong border text-xs font-semibold uppercase rounded px-3 py-2 text-center mx-auto"
  >
    View
  </Button>
);

const Title = ({ children }: { children: ReactNode }) => (
  <Text
    style={{
      color: brand.onSurfaceStrong,
      fontFamily: brand.fontDisplay,
      textAlign: "center",
    }}
    className="m-0 mb-2 text-[18px] leading-[1.2] font-medium text-center"
  >
    {children}
  </Text>
);

const SubTitle = ({ children }: { children: ReactNode }) => (
  <Text
    style={{ color: brand.onSurface, textAlign: "center" }}
    className="m-0 text-sm leading-normal text-center"
  >
    {children}
  </Text>
);

const BodyCopy = ({ children }: { children: ReactNode }) => (
  <Text
    style={{ color: brand.onSurface, textAlign: "center" }}
    className="mt-0 mb-3 text-sm leading-[1.6] text-center"
  >
    {children}
  </Text>
);

type RoundedImageProps = {
  src: string;
  alt: string;
  className?: string;
};

const RoundedImage = ({ src, alt, className }: RoundedImageProps) => (
  <Img
    src={src}
    alt={alt}
    className={`block w-50 h-50 object-cover mx-auto rounded-full mb-6 ${className}`}
  />
);

export const NewsletterOutro = ({ outroText }: { outroText: string }) => (
  <Section style={{ backgroundColor: brand.surface }}>
    <Column>
      <Text
        style={{ color: brand.onSurface }}
        className="m-0 text-sm leading-[1.65] px-[25px]"
      >
        {outroText}
      </Text>
    </Column>
  </Section>
);

export const NewsletterCtaButton = ({ ctaText }: { ctaText: string }) => (
  <Section className="my-12 ">
    <Row>
      <Column align="center">
        <Button
          href={appBaseUrl}
          style={{ backgroundColor: brand.primary, color: brand.onPrimary }}
          className="text-xs font-semibold tracking-[0.16em] uppercase rounded px-6 py-4 text-center"
        >
          {ctaText}
        </Button>
      </Column>
    </Row>
  </Section>
);

export const NewsletterFooter = () => (
  <Section>
    <Row>
      <Column>
        {/* <Hr /> */}
        {/* <NewsletterLogo padding="20px 25px 12px" /> */}
        <Text
          style={{ color: brand.onSurface }}
          className="m-0 text-sm leading-[1.6] px-[25px] text-center"
        >
          The home for photobook lovers. Discover books, follow artists and
          publishers, and keep up with the photobook world.
        </Text>

        <Section className="text-center my-6">
          {newsletterNavLinks.map((link, index) => (
            <span key={link.href}>
              {index > 0 ? (
                <span style={{ color: brand.onSurfaceWeak }}> · </span>
              ) : null}
              <Button href={link.href} style={{ color: brand.onSurfaceWeak }}>
                {link.label}
              </Button>
            </span>
          ))}
        </Section>

        <Section className="text-center mb-6">
          <Button href={newsletterSocial.instagramUrl}>
            <Img
              src={newsletterSocial.instagramIconUrl}
              alt="Instagram"
              width="20"
              height="20"
              style={{ display: "block", margin: "0 auto" }}
            />
          </Button>
        </Section>

        <Text
          style={{ color: brand.onSurfaceWeak }}
          className="m-0 text-sm leading-[1.6] px-[25px] text-center"
        >
          © {new Date().getFullYear()} Photobookers
        </Text>
        {/* <Text
          style={{ color: brand.onSurfaceWeak }}
          className="m-0 text-sm leading-[1.6] px-[25px] text-center"
        >
          <Button
            href="{$unsubscribe}"
            style={{
              color: brand.onSurfaceWeak,
              textDecoration: "underline",
            }}
          >
            Unsubscribe
          </Button>
        </Text> */}
      </Column>
    </Row>
  </Section>
);

export const NewsletterHead = ({ title }: { title: string }) => (
  <Head>
    <title>{title}</title>
    <Font
      fontFamily="Instrument Sans"
      fallbackFontFamily="sans-serif"
      webFont={{
        url: "https://fonts.gstatic.com/s/instrumentsans/v4/pximypc9vsFDm051Uf6KVwgkfoSxQ0GsQv8ToedPibnr-yp2JGEJOH9npSTF-Qf1.ttf",
        format: "truetype",
      }}
      fontWeight={400}
    />
    <Font
      fontFamily="Fraunces"
      fallbackFontFamily="serif"
      webFont={{
        url: "https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIchRujDg.ttf",
        format: "truetype",
      }}
      fontWeight={500}
    />
    <Font
      fontFamily="Caveat"
      fallbackFontFamily="serif"
      webFont={{
        url: "https://fonts.gstatic.com/s/caveat/v23/WnznHAc5bAfYB2QRah7pcpNvOx-pjSx6SII.ttf",
        format: "truetype",
      }}
      fontWeight={600}
    />
    <Font
      fontFamily="Instrument Sans"
      fallbackFontFamily="sans-serif"
      webFont={{
        url: "https://fonts.gstatic.com/s/instrumentsans/v4/pximypc9vsFDm051Uf6KVwgkfoSxQ0GsQv8ToedPibnr-yp2JGEJOH9npST3-Qf1.ttf",
        format: "truetype",
      }}
      fontWeight={500}
    />
    <Font
      fontFamily="Instrument Sans"
      fallbackFontFamily="sans-serif"
      webFont={{
        url: "https://fonts.gstatic.com/s/instrumentsans/v4/pximypc9vsFDm051Uf6KVwgkfoSxQ0GsQv8ToedPibnr-yp2JGEJOH9npSQb_gf1.ttf",
        format: "truetype",
      }}
      fontWeight={600}
    />
    <Font
      fontFamily="Instrument Sans"
      fallbackFontFamily="sans-serif"
      webFont={{
        url: "https://fonts.gstatic.com/s/instrumentsans/v4/pximypc9vsFDm051Uf6KVwgkfoSxQ0GsQv8ToedPibnr-yp2JGEJOH9npSQi_gf1.ttf",
        format: "truetype",
      }}
      fontWeight={700}
    />
    <Font
      fontFamily="Fraunces"
      fallbackFontFamily="serif"
      webFont={{
        url: "https://fonts.gstatic.com/s/fraunces/v38/6NUh8FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0K7iN7hzFUPJH58nib1603gg7S2nfgRYIcaRyjDg.ttf",
        format: "truetype",
      }}
      fontWeight={600}
    />

    {/* <style>{responsiveStyles}</style> */}
  </Head>
);
