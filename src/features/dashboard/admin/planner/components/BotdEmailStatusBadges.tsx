import { normalizeStoredDate } from "../../../../../lib/utils";
import { BookOfTheDayWithBook } from "../../../../app/BOTDServices";
import { buildBotdEmailBadgeProps } from "../emailBadgeBuilders";
import EmailStatusBadge from "./EmailStatusBadge";

type Props = {
  bookOfTheDay: BookOfTheDayWithBook;
};

const BotdEmailStatusBadges = ({ bookOfTheDay }: Props) => {
  const book = bookOfTheDay.book;
  if (!book) return <></>;

  return (
    <div class="flex flex-col gap-1.5">
      {book.artist && (
        <>
          <EmailStatusBadge
            {...buildBotdEmailBadgeProps({
              bookOfTheDay,
              recipientType: "artist",
              emailKind: "advance",
            })}
          />
          <EmailStatusBadge
            {...buildBotdEmailBadgeProps({
              bookOfTheDay,
              recipientType: "artist",
              emailKind: "feature_day",
            })}
          />
        </>
      )}
      {book.publisher && (
        <>
          <EmailStatusBadge
            {...buildBotdEmailBadgeProps({
              bookOfTheDay,
              recipientType: "publisher",
              emailKind: "advance",
            })}
          />
          <EmailStatusBadge
            {...buildBotdEmailBadgeProps({
              bookOfTheDay,
              recipientType: "publisher",
              emailKind: "feature_day",
            })}
          />
        </>
      )}
    </div>
  );
};

export default BotdEmailStatusBadges;
