import { normalizeStoredDate } from "../../../../../lib/utils";
import { BookOfTheDayWithBook } from "../../../../app/BOTDServices";
import {
  getBotdAdvanceEmailScheduledDate,
  getBotdFeatureDayEmailScheduledDate,
} from "../utils";
import EmailStatusBadge from "./EmailStatusBadge";

type Props = {
  bookOfTheDay: BookOfTheDayWithBook;
};

const BotdEmailStatusBadges = ({ bookOfTheDay }: Props) => {
  const book = bookOfTheDay.book;
  if (!book) return <></>;

  const featureDate = normalizeStoredDate(bookOfTheDay.date);
  const advanceScheduledDate = getBotdAdvanceEmailScheduledDate(featureDate);
  const featureDayScheduledDate =
    getBotdFeatureDayEmailScheduledDate(featureDate);

  return (
    <div class="flex flex-col gap-1.5">
      {book.artist && (
        <>
          <EmailStatusBadge
            label="Artist advance"
            sentAt={bookOfTheDay.artistEmailSentAt}
            scheduledDate={advanceScheduledDate}
            hasEmail={Boolean(book.artist.email?.trim())}
          />
          <EmailStatusBadge
            label="Artist feature day"
            sentAt={bookOfTheDay.artistFeatureDayEmailSentAt}
            scheduledDate={featureDayScheduledDate}
            hasEmail={Boolean(book.artist.email?.trim())}
          />
        </>
      )}
      {book.publisher && (
        <>
          <EmailStatusBadge
            label="Publisher advance"
            sentAt={bookOfTheDay.publisherEmailSentAt}
            scheduledDate={advanceScheduledDate}
            hasEmail={Boolean(book.publisher.email?.trim())}
          />
          <EmailStatusBadge
            label="Publisher feature day"
            sentAt={bookOfTheDay.publisherFeatureDayEmailSentAt}
            scheduledDate={featureDayScheduledDate}
            hasEmail={Boolean(book.publisher.email?.trim())}
          />
        </>
      )}
    </div>
  );
};

export default BotdEmailStatusBadges;
