/** @jsxImportSource react */

import { Section, Row, Column, Img } from "@react-email/components";
import { appBaseUrl } from "../constants";
import { formatNewsletterDate } from "../utils";
import { BodyCopy } from "./BodyCopy";
import { Kicker } from "./Kicker";
import { SubTitle } from "./SubTitle";
import { Title } from "./Title";
import { ViewButton } from "./ViewButton";

type BookFeatureCardBook = {
  date?: string;
  bookSlug: string;
  title: string;
  coverUrl: string | null;
  blurb?: string | null;
  artistName: string | null;
  publisherName: string | null;
};

export const BookFeatureCard = ({ book }: { book: BookFeatureCardBook }) => {
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
          <SubTitle>
            {book.artistName}{" "}
            {book.publisherName ? `– ${book.publisherName}` : null}
          </SubTitle>
          <ViewButton href={`${appBaseUrl}/books/${book.bookSlug}`} />
        </Column>
      </Row>
    </Section>
  );
};
