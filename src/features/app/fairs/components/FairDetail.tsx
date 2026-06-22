import type { BookFair, FairAttendee } from "../../../../db/schema";
import { formatDate } from "../../../../utils";
import ExpandableDescription from "../../components/ExpandableDescription";
import Button from "../../../../components/app/Button";
import Link from "../../../../components/app/Link";

type FairDetailProps = {
  fair: BookFair & {
    attendees: Array<
      FairAttendee & {
        creator: {
          id: string;
          displayName: string;
          slug: string;
          type: "publisher" | "artist";
          coverUrl: string | null;
          city: string | null;
          country: string | null;
          status: "stub" | "verified" | "suspended" | "deleted" | null;
        };
      }
    >;
  };
};

const FairDetail = ({ fair }: FairDetailProps) => {
  return (
    <div class="space-y-8">
      <div class="space-y-4">
        {fair.bannerUrl && (
          <img
            src={fair.bannerUrl}
            alt={fair.name}
            class="w-full h-64 object-cover rounded-lg"
          />
        )}
        <h1 class="text-4xl font-bold">{fair.name}</h1>
        <div class="flex flex-col gap-2 text-lg">
          <div>
            <strong>Dates:</strong> {formatDate(fair.startDate)} -{" "}
            {formatDate(fair.endDate)}
          </div>
          {(fair.city || fair.country) && (
            <div>
              <strong>Location:</strong>{" "}
              {fair.city && fair.country
                ? `${fair.city}, ${fair.country}`
                : fair.city || fair.country}
            </div>
          )}
          {fair.venue && (
            <div>
              <strong>Venue:</strong> {fair.venue}
            </div>
          )}
        </div>
        {fair.website && (
          <div>
            <a href={fair.website} target="_blank" rel="noopener noreferrer">
              <Button variant="solid" color="primary">
                Visit Fair Website
              </Button>
            </a>
          </div>
        )}
      </div>

      {fair.description && (
        <div class="prose max-w-none">
          <ExpandableDescription text={fair.description} />
        </div>
      )}

      {fair.attendees.length > 0 && (
        <div class="space-y-4">
          <h2 class="text-2xl font-bold">Attending Publishers and Artists</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {fair.attendees.map((attendee) => (
              <Link href={`/creators/${attendee.creator.slug}`}>
                <div class="flex flex-col items-center gap-2">
                  {attendee.creator.coverUrl && (
                    <img
                      src={attendee.creator.coverUrl}
                      alt={attendee.creator.displayName}
                      class="w-24 h-24 rounded-full object-cover"
                    />
                  )}
                  <span class="text-sm font-medium text-center">
                    {attendee.creator.displayName}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FairDetail;
