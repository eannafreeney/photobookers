/** @jsxImportSource react */

import {
  Mjml,
  MjmlHead,
  MjmlTitle,
  MjmlFont,
  MjmlAttributes,
  MjmlAll,
  MjmlBreakpoint,
  MjmlBody,
  MjmlStyle,
} from "mjml-react";
import {
  BookColumn,
  bookColumnCoverStyle,
  BookFeatureCard,
  CreatorColumn,
  FeatureRow,
  NewsletterAppPromo,
  NewsletterCtaButton,
  NewsletterFooter,
  NewsletterHeader,
  NewsletterIntro,
  NewsletterSubject,
  SectionHeading,
} from "./MJMLComponents";
import { brand, newsletterWidthPx } from "./constants";
import { formatNewsletterWeekRange } from "./utils";
import type { WeeklyNewsletterRenderParams } from "./types";

const chunk = <T,>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, i * size + size),
  );

export const WeeklyNewsletterMjml = (params: WeeklyNewsletterRenderParams) => {
  const {
    weekStart,
    weekEnd,
    subject,
    introText,
    botdEntries,
    ctaText,
    ctaHref,
    newMembers,
    artistOfTheWeek,
    publisherOfTheWeek,
    trending,
  } = params;
  const weekLabel = formatNewsletterWeekRange(weekStart, weekEnd);

  return (
    <Mjml lang="en">
      <MjmlHead>
        <MjmlTitle>{subject}</MjmlTitle>
        <MjmlFont
          name="Instrument Sans"
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap"
        />
        <MjmlFont
          name="Fraunces"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap"
        />
        <MjmlAttributes>
          <MjmlAll fontFamily={brand.fontSans} color={brand.onSurface} />
        </MjmlAttributes>
        <MjmlStyle>{bookColumnCoverStyle}</MjmlStyle>
        <MjmlBreakpoint width="600px" />
      </MjmlHead>
      <MjmlBody backgroundColor={brand.surface} width={newsletterWidthPx}>
        <NewsletterHeader />
        <NewsletterSubject subject={subject} weekLabel={weekLabel} />
        {introText.trim().length > 0 ? (
          <NewsletterIntro introText={introText} />
        ) : null}
        <NewsletterAppPromo />
        {botdEntries.length > 0 ? (
          <>
            <SectionHeading kicker="Daily picks">
              Books of the day
            </SectionHeading>
            {botdEntries.map((book) => (
              <BookFeatureCard key={book.bookId} book={book} />
            ))}
          </>
        ) : null}
        {artistOfTheWeek || publisherOfTheWeek ? (
          <>
            <SectionHeading kicker="Spotlight">
              Creators of the week
            </SectionHeading>
            <FeatureRow>
              {artistOfTheWeek ? (
                <CreatorColumn
                  key={artistOfTheWeek.slug}
                  creator={artistOfTheWeek}
                />
              ) : null}
              {publisherOfTheWeek ? (
                <CreatorColumn
                  key={publisherOfTheWeek.slug}
                  creator={publisherOfTheWeek}
                />
              ) : null}
            </FeatureRow>
          </>
        ) : null}

        {trending && trending.books.length > 0 ? (
          <>
            <SectionHeading kicker="Trending">
              Top books this week
            </SectionHeading>
            {chunk(trending.books, 3).map((row) => (
              <FeatureRow key={row.map((book) => book.bookId).join("-")}>
                {row.map((book) => (
                  <BookColumn key={book.bookId} book={book} compact />
                ))}
              </FeatureRow>
            ))}
          </>
        ) : null}

        {trending && trending.artists.length > 0 ? (
          <>
            <SectionHeading kicker="Trending">
              Top artists this week
            </SectionHeading>
            {chunk(trending.artists, 3).map((row) => (
              <FeatureRow key={row.map((creator) => creator.slug).join("-")}>
                {row.map((creator) => (
                  <CreatorColumn key={creator.slug} creator={creator} />
                ))}
              </FeatureRow>
            ))}
          </>
        ) : null}
        {trending && trending.publishers.length > 0 ? (
          <>
            <SectionHeading kicker="Trending">
              Top publishers this week
            </SectionHeading>
            {chunk(trending.publishers, 3).map((row) => (
              <FeatureRow key={row.map((creator) => creator.slug).join("-")}>
                {row.map((creator) => (
                  <CreatorColumn key={creator.slug} creator={creator} />
                ))}
              </FeatureRow>
            ))}
          </>
        ) : null}
        {newMembers && newMembers.length > 0 ? (
          <>
            <SectionHeading kicker="Discover">
              New on Photobookers
            </SectionHeading>
            {chunk(newMembers, 3).map((row) => (
              <FeatureRow key={row.map((creator) => creator.slug).join("-")}>
                {row.map((creator) => (
                  <CreatorColumn key={creator.slug} creator={creator} />
                ))}
              </FeatureRow>
            ))}
          </>
        ) : null}
        <NewsletterCtaButton ctaText={ctaText} href={ctaHref} />
        <NewsletterFooter />
      </MjmlBody>
    </Mjml>
  );
};
