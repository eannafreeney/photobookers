import type {
  BookFair,
  FairAttendee,
  FairAttendeeStatus,
} from "../../../../db/schema";
import { formatDate } from "../../../../utils";
import ExpandableDescription from "../../components/ExpandableDescription";
import Button from "../../../../components/app/Button";
import Link from "../../../../components/app/Link";
import FairAttendButton from "./FairAttendButton";
import type { AuthUser } from "../../../../../types";

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
  user: AuthUser | null;
  attendanceStatus: FairAttendeeStatus | null;
};

// Icon components
const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="w-5 h-5"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
    />
  </svg>
);

const MapPinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="w-5 h-5"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
    />
  </svg>
);

const BuildingIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="w-5 h-5"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
    />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="w-4 h-4"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
    />
  </svg>
);

const FairDetail = ({ fair, user, attendanceStatus }: FairDetailProps) => {
  return (
    <div class="min-h-screen">
      {/* Hero Banner Section */}
      {fair.bannerUrl && (
        <div class="w-full -mt-8 mb-12">
          <div class="relative w-full h-[300px] md:h-[400px] overflow-hidden">
            <img
              src={fair.bannerUrl}
              alt={fair.name}
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Main Content - Centered */}
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Header Section */}
        <div class="text-center space-y-6 mb-12">
          <h1 class="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-on-surface-strong leading-tight">
            {fair.name}
          </h1>

          {/* Key Info Cards */}
          <div class="flex flex-wrap justify-center gap-4 text-on-surface">
            <div class="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full">
              <span class="text-accent">
                <CalendarIcon />
              </span>
              <span class="font-medium">
                {formatDate(fair.startDate)} - {formatDate(fair.endDate)}
              </span>
            </div>

            {(fair.city || fair.country) && (
              <div class="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full">
                <span class="text-accent">
                  <MapPinIcon />
                </span>
                <span class="font-medium">
                  {fair.city && fair.country
                    ? `${fair.city}, ${fair.country}`
                    : fair.city || fair.country}
                </span>
              </div>
            )}

            {fair.venue && (
              <div class="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full">
                <span class="text-accent">
                  <BuildingIcon />
                </span>
                <span class="font-medium">{fair.venue}</span>
              </div>
            )}
          </div>

          {/* CTA Button */}
          {fair.website && (
            <div class="pt-4">
              <a
                href={fair.website}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-block"
              >
                <Button variant="solid" color="primary">
                  <span class="flex items-center gap-2">
                    Visit Fair Website
                    <ExternalLinkIcon />
                  </span>
                </Button>
              </a>
            </div>
          )}

          <FairAttendButton
            fair={fair}
            user={user}
            attendanceStatus={attendanceStatus}
          />
        </div>

        {/* Description Section */}
        {fair.description && (
          <div class="prose prose-lg max-w-none mb-16 text-on-surface">
            <div class="bg-surface-container rounded-2xl p-8">
              <ExpandableDescription text={fair.description} />
            </div>
          </div>
        )}

        {/* Attending Creators Section */}
        {fair.attendees.length > 0 && (
          <div class="space-y-8">
            <div class="text-center">
              <h2 class="font-display text-3xl md:text-4xl font-bold text-on-surface-strong mb-2">
                Attending Creators
              </h2>
              <p class="text-on-surface">
                {fair.attendees.length}{" "}
                {fair.attendees.length === 1 ? "creator" : "creators"} attending
                this fair
              </p>
            </div>

            {/* Creators Grid */}
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {fair.attendees.map((attendee) => (
                <Link
                  href={`/creators/${attendee.creator.slug}`}
                  className="group"
                >
                  <div class="flex flex-col items-center gap-3 transition-transform duration-200 hover:scale-105">
                    <div class="relative w-full aspect-square overflow-hidden rounded-2xl bg-surface-container shadow-sm group-hover:shadow-md transition-shadow">
                      {attendee.creator.coverUrl ? (
                        <img
                          src={attendee.creator.coverUrl}
                          alt={attendee.creator.displayName}
                          class="w-full h-full object-cover"
                        />
                      ) : (
                        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
                          <span class="text-4xl font-display font-bold text-accent/40">
                            {attendee.creator.displayName
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div class="text-center w-full">
                      <p class="text-sm font-semibold text-on-surface-strong group-hover:text-accent transition-colors line-clamp-2">
                        {attendee.creator.displayName}
                      </p>
                      {(attendee.creator.city || attendee.creator.country) && (
                        <p class="text-xs text-on-surface/70 mt-1">
                          {attendee.creator.city || attendee.creator.country}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FairDetail;
