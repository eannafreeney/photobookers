/** @jsxImportSource react */
import {
  Section,
  Row,
  Column,
  Text,
  Button,
  Img,
  Hr,
} from "@react-email/components";
import {
  appBaseUrl,
  appStoreUrl,
  brand,
  newsletterAssets,
} from "./newsletterTokens";
import { ReactNode } from "react";
import { WeeklyNewsletterBookItem } from "../newsletterTemplate";
import { formatNewsletterDate } from "./newsletterComponents";

export const NewsletterHeader = () => (
  <Section>
    <Row>
      <Column align="center" className="text-center">
        <Img
          src={newsletterAssets.logo}
          alt="Photobookers"
          height={32}
          className="mx-auto mb-5"
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
          className="mt-0 mb-0 px-[25px] pt-5 pb-2 text-center text-[11px] font-semibold uppercase leading-[1.2] tracking-[0.18em]"
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
          className=" mt-0 mb-0 px-[25px] pt-0 pb-5 text-center text-[32px] font-medium leading-[1.15]"
        >
          {subject}
        </Text>
      </Column>
    </Row>
  </Section>
);

export const NewsletterAppPromo = () => (
  <Section className="flex justify-center">
    <Row>
      <Column align="center">
        <Button
          href={appStoreUrl}
          style={{ margin: "0 auto" }}
          className="bg-black text-white text-xs font-semibold tracking-[0.16em] uppercase rounded-none px-6 py-4 text-center"
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
  <Text style={{ color: brand.accent }} className="m-0 text-center">
    {children}
  </Text>
);

type SectionHeadingProps = {
  kicker?: string;
  children: ReactNode;
};

export const SectionHeading = ({ kicker, children }: SectionHeadingProps) => (
  <Section className="my-6">
    <Row>
      <Column>
        {kicker && <Kicker>{kicker}</Kicker>}
        <Text
          className="text-2xl font-medium leading-1.2 text-center"
          style={{ color: brand.onSurfaceStrong }}
        >
          {children}
        </Text>
        <Hr
          className="mt-0 mb-0 border-t-2 border-black"
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
  artistName: string | null;
  publisherName: string | null;
};

type BookFeatureCardProps = {
  book: BookFeatureCardBook;
  inverted?: boolean;
};

export const BOTDCard = ({ book, inverted = false }: BookFeatureCardProps) => {
  const kicker = book.date ? formatNewsletterDate(book.date) : null;
  const imageColumn = (
    <Column
      align="center"
      className="book-feature-image-col align-top text-center"
      style={{ width: "50%" }}
    >
      {book.coverUrl ? (
        <Img
          src={book.coverUrl}
          alt={book.title}
          className="block w-full h-auto mx-auto"
        />
      ) : null}
    </Column>
  );
  const textColumn = (
    <Column
      align="center"
      className="text-center"
      style={{ width: "50%", textAlign: "center" }}
    >
      {kicker && <Kicker>{kicker}</Kicker>}
      <Text
        style={{
          color: brand.onSurfaceStrong,
          fontFamily: brand.fontDisplay,
          textAlign: "center",
        }}
        className="m-0 mb-2 text-2xl leading-tight font-medium text-center"
      >
        {book.title}
      </Text>
      <Text
        style={{ color: brand.onSurface, textAlign: "center" }}
        className="m-0 text-sm leading-relaxed text-center"
      >
        {book.artistName}
      </Text>
      <Text
        style={{ color: brand.onSurface, textAlign: "center" }}
        className="m-0 text-sm leading-relaxed text-center"
      >
        {book.publisherName}
      </Text>
    </Column>
  );

  return (
    <Section>
      <Row className="book-feature-row mt-16 mb-6">
        {inverted ? textColumn : imageColumn}
        {inverted ? imageColumn : textColumn}
      </Row>
      <Row className="mt-6">
        <Column align="center" className="text-center">
          <ViewButton href={`${appBaseUrl}/books/${book.bookSlug}`} />
        </Column>
      </Row>
    </Section>
  );
};

type CreatorFeatureCardCreator = {
  displayName: string;
  slug: string;
  type: "artist" | "publisher";
  coverUrl: string | null;
  tagline: string | null;
};

type CreatorFeatureColumnProps = {
  creator: CreatorFeatureCardCreator;
};

export const CreatorFeatureColumn = ({
  creator,
}: CreatorFeatureColumnProps) => {
  return (
    <Column
      width="33.33%"
      className="feature-col align-top"
      style={{ padding: "0 8px 16px" }}
    >
      {creator.coverUrl ? (
        <RoundedImage src={creator.coverUrl} alt={creator.displayName} />
      ) : null}
      <Title>{creator.displayName}</Title>
      <ViewButton href={`${appBaseUrl}/creators/${creator.slug}`} />
    </Column>
  );
};

export const BookFeatureColumn = ({ book }: BookFeatureCardProps) => {
  const kicker = book.date ? formatNewsletterDate(book.date) : null;

  return (
    <Column
      width="33.33%"
      className="feature-col align-top"
      style={{ padding: "0 8px 16px" }}
    >
      {book.coverUrl ? (
        <Img
          src={book.coverUrl}
          alt={book.title}
          className="block w-25 h-full object-cover mx-auto mb-3"
        />
      ) : null}
      {kicker && <Kicker>{kicker}</Kicker>}
      <Title>{book.title}</Title>
      <SubTitle>{book.artistName}</SubTitle>
      <SubTitle>{book.publisherName}</SubTitle>
      <ViewButton href={`${appBaseUrl}/books/${book.bookSlug}`} />
    </Column>
  );
};

const ViewButton = ({ href }: { href: string }) => (
  <Button
    href={href}
    style={{
      display: "block",
      width: "80%",
      maxWidth: "100%",
      boxSizing: "border-box",
      margin: "8px auto",
    }}
    className="bg-white text-black border-outlineStrong border text-xs font-semibold uppercase rounded px-2 py-2 text-center mx-auto"
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
    className="m-0 mb-3 text-md leading-tight font-medium text-center"
  >
    {children}
  </Text>
);

const SubTitle = ({ children }: { children: ReactNode }) => (
  <Text
    style={{ color: brand.onSurface, textAlign: "center" }}
    className="m-0 text-sm leading-relaxed text-center"
  >
    {children}
  </Text>
);

export const GridRow = ({ children }: { children: ReactNode }) => (
  <Section style={{ padding: "0 17px" }}>
    <Row className="grid-row">{children}</Row>
  </Section>
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
    className={`block w-25 h-25 object-cover mx-auto rounded-full ${className}`}
  />
);
