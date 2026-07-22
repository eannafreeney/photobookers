/** @jsxImportSource react */

import { render } from "@react-email/render";
import { Html, Body, Container, Tailwind } from "@react-email/components";
import { prepareNewsletterHtmlForEsp } from "./espHtml";
import {
  BookFeatureCard,
  CreatorFeatureCard,
  NewsletterAppPromo,
  NewsletterHeader,
  NewsletterSubject,
  NewsletterIntro,
  SectionHeading,
  NewsletterCtaButton,
  NewsletterFooter,
  NewsletterHead,
} from "./components";
import { formatNewsletterWeekRange } from "./utils";
import type { WeeklyNewsletterRenderParams } from "./types";

const WeeklyNewsletter = (params: WeeklyNewsletterRenderParams) => {
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
    <Html lang="en">
      <Tailwind>
        <NewsletterHead title={subject} />
        <Body>
          <Container className="flex flex-col gap-6 my-6">
            <NewsletterHeader />
            <NewsletterSubject subject={subject} weekLabel={weekLabel} />
            {introText.trim().length > 0 && (
              <NewsletterIntro introText={introText} />
            )}
            <NewsletterAppPromo />
            {botdEntries.length > 0 && (
              <>
                <SectionHeading kicker="Daily picks">
                  Books of the day
                </SectionHeading>
                {botdEntries.map((book) => (
                  <BookFeatureCard book={book} />
                ))}
              </>
            )}

            {(artistOfTheWeek || publisherOfTheWeek) && (
              <>
                <SectionHeading kicker="Spotlight">
                  Creators of the week
                </SectionHeading>

                {artistOfTheWeek && (
                  <CreatorFeatureCard creator={artistOfTheWeek} />
                )}
                {publisherOfTheWeek && (
                  <CreatorFeatureCard creator={publisherOfTheWeek} />
                )}
              </>
            )}

            {trending && trending.books.length > 0 && (
              <>
                <SectionHeading kicker="Trending">
                  Top books this week
                </SectionHeading>
                {trending!.books.map((book) => (
                  <BookFeatureCard book={book} />
                ))}
              </>
            )}

            {trending && trending.artists.length > 0 && (
              <>
                <SectionHeading kicker="Trending">
                  Top artists this week
                </SectionHeading>
                {trending!.artists.map((artist) => (
                  <CreatorFeatureCard creator={artist} />
                ))}
              </>
            )}

            {trending && trending.publishers.length > 0 && (
              <>
                <SectionHeading kicker="Trending">
                  Top publishers this week
                </SectionHeading>
                {trending!.publishers.map((publisher) => (
                  <CreatorFeatureCard creator={publisher} />
                ))}
              </>
            )}

            {newMembers && newMembers.length > 0 && (
              <>
                <SectionHeading kicker="Discover">
                  New on Photobookers
                </SectionHeading>
                {chunk(newMembers, 3).map((group) =>
                  group.map((member) => (
                    <CreatorFeatureCard key={member.slug} creator={member} />
                  )),
                )}
              </>
            )}
            {/* <NewsletterOutro outroText={outroText} /> */}
            <NewsletterCtaButton ctaText={ctaText} href={ctaHref} />
            <NewsletterFooter />
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export async function renderWeeklyBOTDNewsletterHtml(
  params: WeeklyNewsletterRenderParams,
): Promise<string> {
  const element = <WeeklyNewsletter {...params} />;
  // `pretty: true` runs the output through prettier, whose HTML parser can throw
  // on otherwise-valid email markup. Fall back to unformatted HTML so a
  // formatting quirk never takes down the preview or a send.
  let html: string;
  try {
    html = await render(element, { pretty: true });
  } catch (error) {
    console.error("renderWeeklyBOTDNewsletterHtml: pretty render failed", error);
    html = await render(element, { pretty: false });
  }
  return prepareNewsletterHtmlForEsp(html);
}

const chunk = <T,>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, i * size + size),
  );
