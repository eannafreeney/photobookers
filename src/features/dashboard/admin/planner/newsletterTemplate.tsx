/** @jsxImportSource react */

export type WeeklyNewsletterBookItem = {
  date?: string;
  bookId: string;
  bookSlug: string;
  title: string;
  coverUrl: string | null;
  artistName: string | null;
  artistSlug: string | null;
  publisherName: string | null;
  publisherSlug: string | null;
};

export type WeeklyNewsletterCreatorSpotlight = {
  displayName: string;
  slug: string;
  /** ISO week key for `/artist-of-the-week/:week` and `/publisher-of-the-week/:week`. */
  weekKey: string;
  coverUrl: string | null;
  tagline: string | null;
  location: string | null;
} | null;

export type WeeklyNewsletterNewMember = {
  displayName: string;
  slug: string;
  type: "artist" | "publisher";
  coverUrl: string | null;
  tagline: string | null;
  location: string | null;
};

export type WeeklyNewsletterFairItem = {
  name: string;
  slug: string;
  coverUrl: string | null;
  venue: string | null;
  location: string | null;
  startDate: string;
  endDate: string;
};

export type WeeklyNewsletterTrendingBookItem = {
  bookId: string;
  bookSlug: string;
  title: string;
  coverUrl: string | null;
  artistName: string | null;
  publisherName: string | null;
};

export type WeeklyNewsletterTrendingCreatorItem = {
  displayName: string;
  slug: string;
  type: "artist" | "publisher";
  coverUrl: string | null;
};

export type WeeklyNewsletterTrending = {
  books: WeeklyNewsletterTrendingBookItem[];
  artists: WeeklyNewsletterTrendingCreatorItem[];
  publishers: WeeklyNewsletterTrendingCreatorItem[];
};

export type WeeklyNewsletterRenderParams = {
  weekStart: Date;
  weekEnd: Date;
  subject: string;
  introText: string;
  outroText: string;
  ctaText: string;
  botdEntries: WeeklyNewsletterBookItem[];
  newMembers?: WeeklyNewsletterNewMember[];
  upcomingFair?: WeeklyNewsletterFairItem | null;
  artistOfTheWeek: WeeklyNewsletterCreatorSpotlight;
  publisherOfTheWeek: WeeklyNewsletterCreatorSpotlight;
  trending?: WeeklyNewsletterTrending;
};

import { render } from "@react-email/render";
import {
  Html,
  Head,
  Body,
  Font,
  Section,
  Row,
  Column,
  Text,
  Button,
  Img,
  Hr,
  Container,
  Tailwind,
} from "@react-email/components";
import { prepareNewsletterHtmlForEsp } from "./newsletterEspHtml";
import {
  BookFeatureColumn,
  BOTDCard,
  COTDCard,
  CreatorFeatureColumn,
  GridRow,
  NewsletterAppPromo,
  NewsletterHeader,
  NewsletterSubject,
  SectionHeading,
} from "./newsletter/components";
import { formatNewsletterWeekRange } from "./newsletterUtils";

const responsiveStyles = `
.book-feature-row {
  width: 100% !important;
}

.grid-row {
  width: 100% !important;
}

.book-feature-image-col {
  padding-right: 12px !important;
}

@media only screen and (max-width: 600px) {
  .book-feature-image-col {
    width: 100% !important;
    max-width: 100% !important;
    display: block !important;
    padding-right: 0 !important;
    padding-bottom: 12px !important;
  }

  .book-feature-text-col {
    width: 100% !important;
    max-width: 100% !important;
    display: block !important;
  }

  .feature-col {
    width: 100% !important;
    max-width: 100% !important;
    display: block !important;
    padding: 0 0 16px !important;
  }
}`;
const WeeklyNewsletter = (params: WeeklyNewsletterRenderParams) => {
  const {
    weekStart,
    weekEnd,
    subject,
    botdEntries,
    introText,
    outroText,
    ctaText,
    newMembers,
    upcomingFair,
    artistOfTheWeek,
    publisherOfTheWeek,
    trending,
  } = params;
  const weekLabel = formatNewsletterWeekRange(weekStart, weekEnd);

  return (
    <Html lang="en">
      <Tailwind>
        <Head>
          <title>{params.subject}</title>
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

          <style>{responsiveStyles}</style>
        </Head>
        <Body>
          <Container className="flex flex-col gap-6 my-6">
            <NewsletterHeader />
            <NewsletterSubject subject={subject} weekLabel={weekLabel} />
            <NewsletterAppPromo />
            {botdEntries.length > 0 && (
              <>
                <SectionHeading kicker="Daily picks">
                  Books of the day
                </SectionHeading>
                {botdEntries.map((book, index) => (
                  <BOTDCard book={book} inverted={index % 2 === 1} />
                ))}
              </>
            )}

            {(artistOfTheWeek || publisherOfTheWeek) && (
              <>
                <SectionHeading kicker="Spotlight">
                  Artist of the week
                </SectionHeading>
                <GridRow>
                  {artistOfTheWeek && (
                    <CreatorFeatureColumn
                      creator={artistOfTheWeek}
                      type="artist"
                    />
                  )}
                  {publisherOfTheWeek && (
                    <CreatorFeatureColumn
                      creator={publisherOfTheWeek}
                      type="publisher"
                    />
                  )}
                </GridRow>
              </>
            )}

            {trending && trending.books.length > 0 && (
              <>
                <SectionHeading kicker="Trending">
                  Top books this week
                </SectionHeading>
                <GridRow>
                  {trending!.books.map((book) => (
                    <BookFeatureColumn book={book} />
                  ))}
                </GridRow>
              </>
            )}

            {trending && trending.artists.length > 0 && (
              <>
                <SectionHeading kicker="Trending">
                  Top artists this week
                </SectionHeading>
                <GridRow>
                  {trending!.artists.map((artist) => (
                    <CreatorFeatureColumn creator={artist} />
                  ))}
                </GridRow>
              </>
            )}

            {trending && trending.publishers.length > 0 && (
              <>
                <SectionHeading kicker="Trending">
                  Top publishers this week
                </SectionHeading>
                <GridRow>
                  {trending!.publishers.map((publisher) => (
                    <CreatorFeatureColumn creator={publisher} />
                  ))}
                </GridRow>
              </>
            )}

            {newMembers && newMembers.length > 0 && (
              <>
                <SectionHeading kicker="Discover">
                  New on Photobookers
                </SectionHeading>
                <Section style={{ padding: "0 17px" }}>
                  {chunk(newMembers, 3).map((group, idx) => (
                    <Row key={idx} className="grid-row">
                      {group.map((member) => (
                        <CreatorFeatureColumn
                          key={member.slug}
                          creator={member}
                        />
                      ))}
                    </Row>
                  ))}
                </Section>
              </>
            )}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export async function renderWeeklyBOTDNewsletterHtml(
  params: WeeklyNewsletterRenderParams,
): Promise<string> {
  const html = await render(<WeeklyNewsletter {...params} />, { pretty: true });
  return prepareNewsletterHtmlForEsp(html);
}

const chunk = <T,>(items: T[], size: number) =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
    items.slice(i * size, i * size + size),
  );
