import { ArtistOfTheWeek, PublisherOfTheWeek } from "../../../../../db/schema";
import { normalizeStoredDate } from "../../../../../lib/utils";
import {
  getSpotlightAdvanceEmailScheduledDate,
  getSpotlightFeatureDayEmailScheduledDate,
} from "../utils";
import EmailStatusBadge from "./EmailStatusBadge";

type SpotlightRow = Pick<
  ArtistOfTheWeek | PublisherOfTheWeek,
  | "weekStart"
  | "emailSentAt"
  | "interviewReminderSentAt"
  | "featureDayEmailSentAt"
>;

type Props = {
  spotlight: "artist" | "publisher";
  row: SpotlightRow;
  email: string | null;
};

const SpotlightEmailStatusBadges = ({
  spotlight,
  row,
  email,
}: Props) => {
  const weekStart = normalizeStoredDate(row.weekStart);
  const advanceScheduledDate = getSpotlightAdvanceEmailScheduledDate(weekStart);
  const featureDayScheduledDate =
    getSpotlightFeatureDayEmailScheduledDate(weekStart);
  const hasEmail = Boolean(email?.trim());
  const labelPrefix = spotlight === "artist" ? "Artist" : "Publisher";

  return (
    <div class="flex flex-col gap-1.5">
      <EmailStatusBadge
        label={`${labelPrefix} advance`}
        sentAt={row.emailSentAt}
        scheduledDate={advanceScheduledDate}
        hasEmail={hasEmail}
      />
      <EmailStatusBadge
        label={`${labelPrefix} interview reminder`}
        sentAt={row.interviewReminderSentAt}
        scheduledDate={advanceScheduledDate}
        hasEmail={hasEmail}
      />
      <EmailStatusBadge
        label={`${labelPrefix} feature day`}
        sentAt={row.featureDayEmailSentAt}
        scheduledDate={featureDayScheduledDate}
        hasEmail={hasEmail}
      />
    </div>
  );
};

export default SpotlightEmailStatusBadges;
