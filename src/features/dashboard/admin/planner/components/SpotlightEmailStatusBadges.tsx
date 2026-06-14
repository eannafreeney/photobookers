import { ArtistOfTheWeek, PublisherOfTheWeek } from "../../../../../db/schema";
import { buildSpotlightEmailBadgeProps } from "../emailBadgeBuilders";
import EmailStatusBadge from "./EmailStatusBadge";

type SpotlightRow = Pick<
  ArtistOfTheWeek | PublisherOfTheWeek,
  | "id"
  | "weekStart"
  | "emailSentAt"
  | "interviewReminderSentAt"
  | "featureDayEmailSentAt"
>;

type Props = {
  spotlight: "artist" | "publisher";
  row: SpotlightRow;
  creatorId: string;
  email: string | null;
};

const SpotlightEmailStatusBadges = ({
  spotlight,
  row,
  creatorId,
  email,
}: Props) => {
  return (
    <div class="flex flex-col gap-1.5">
      <EmailStatusBadge
        {...buildSpotlightEmailBadgeProps({
          spotlight,
          row,
          creatorId,
          email,
          emailKind: "advance",
        })}
      />
      <EmailStatusBadge
        {...buildSpotlightEmailBadgeProps({
          spotlight,
          row,
          creatorId,
          email,
          emailKind: "interview_reminder",
        })}
      />
      <EmailStatusBadge
        {...buildSpotlightEmailBadgeProps({
          spotlight,
          row,
          creatorId,
          email,
          emailKind: "feature_day",
        })}
      />
    </div>
  );
};

export default SpotlightEmailStatusBadges;
