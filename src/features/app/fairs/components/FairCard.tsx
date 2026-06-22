import type { BookFair } from "../../../../db/schema";
import Card from "../../../../components/app/Card";
import Link from "../../../../components/app/Link";
import { formatDate } from "../../../../utils";

type FairCardProps = {
  fair: BookFair;
};

const FairCard = ({ fair }: FairCardProps) => {
  const fairPath = `/fairs/${fair.slug}`;

  return (
    <Card>
      {fair.coverUrl && (
        <Card.Image src={fair.coverUrl} alt={fair.name} href={fairPath} />
      )}
      <Card.Body>
        {fair.listingTier === "promoted" && (
          <div class="mb-2">
            <span class="bg-accent text-white text-xs px-2 py-1 rounded">
              Featured
            </span>
          </div>
        )}
        <Link href={fairPath}>
          <Card.Title>{fair.name}</Card.Title>
        </Link>
        <div class="text-sm text-on-surface-weak">
          {formatDate(fair.startDate)} - {formatDate(fair.endDate)}
        </div>
        {(fair.city || fair.country) && (
          <div class="text-sm text-on-surface-weak">
            {fair.city && fair.country
              ? `${fair.city}, ${fair.country}`
              : fair.city || fair.country}
          </div>
        )}
        {fair.venue && <div class="text-sm text-on-surface-weak">{fair.venue}</div>}
      </Card.Body>
    </Card>
  );
};

export default FairCard;
