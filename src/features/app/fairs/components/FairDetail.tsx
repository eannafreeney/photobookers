import type { BookFair } from "../../../../db/schema";
import { formatDate } from "../../../../utils";
import ExpandableDescription from "../../components/ExpandableDescription";
import Button from "../../../../components/app/Button";
import Link from "../../../../components/app/Link";
import FairAttendButton from "./FairAttendButton";
import type { AuthUser } from "../../../../../types";
import { getFairAttendees } from "../../../fair-attendees/services";
import FairAttendingCreators from "./FairAttendingCreators";

type FairDetailProps = {
  fair: BookFair;
  user: AuthUser | null;
  isAttending: boolean;
  isMobile: boolean;
};

const FairDetail = ({ fair, user, isAttending, isMobile }: FairDetailProps) => {
  return (
    <div class="min-h-screen ">
      <FairBanner fair={fair} isMobile={isMobile} />

      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex flex-col gap-12">
        <div class="text-center space-y-6">
          <h1 class="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-on-surface-strong leading-tight">
            {fair.name}
          </h1>

          <FairDetails fair={fair} />
          <FairAttendButton fair={fair} user={user} isAttending={isAttending} />
        </div>
        <FairDescription fair={fair} />
        <FairWebsiteButton fair={fair} />
        <FairAttendingCreators fairId={fair.id} />
      </div>
    </div>
  );
};

export default FairDetail;

const FairBanner = ({
  fair,
  isMobile,
}: {
  fair: BookFair;
  isMobile: boolean;
}) => {
  if (!fair.bannerUrl) return <></>;

  if (isMobile && fair.coverUrl) {
    return (
      <div class="mt-4 mb-12">
        <img src={fair.coverUrl} alt={fair.name} class="w-full object-cover" />
      </div>
    );
  }

  return (
    <div class="w-full -mt-8 mb-12">
      <div class="relative w-full h-[300px] md:h-[500px] overflow-hidden">
        <img
          src={fair.bannerUrl}
          alt={fair.name}
          class="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

const FairDetails = ({ fair }: { fair: BookFair }) => {
  return (
    <div class="flex flex-col md:flex-row justify-center items-center gap-1 md:gap-4 text-on-surface">
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
  );
};

const FairDescription = ({ fair }: { fair: BookFair }) => {
  if (!fair.description) return <></>;
  return (
    <div class="prose prose-lg max-w-none text-on-surface">
      <div class="bg-surface-container rounded-2xl">
        <ExpandableDescription text={fair.description} />
      </div>
    </div>
  );
};

const FairWebsiteButton = ({ fair }: { fair: BookFair }) => {
  if (!fair.website) return <></>;
  return (
    <div class="flex justify-center">
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
  );
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
