import type { BookFair } from "../../../../db/schema";
import Card from "../../../../components/app/Card";
import Link from "../../../../components/app/Link";
import { formatDate, formatDateWithoutYear } from "../../../../utils";

type FairCardProps = {
  fair: BookFair;
};

const FairCard = ({ fair }: FairCardProps) => {
  const fairPath = `/fairs/${fair.slug}`;

  return (
    <Card>
      {fair.coverUrl && (
        <div class="relative">
          <Card.Image src={fair.coverUrl} alt={fair.name} href={fairPath} />
          <div class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
            {formatDateWithoutYear(fair.startDate)} - {formatDate(fair.endDate)}
          </div>
        </div>
      )}
      <Card.Body>
        <Link href={fairPath}>
          <Card.Title>{fair.name}</Card.Title>
        </Link>
        {(fair.city || fair.country) && (
          <div class="text-sm text-on-surface-weak">
            {fair.city && fair.country
              ? `${fair.city}, ${fair.country}`
              : fair.city || fair.country}
          </div>
        )}
        {fair.venue && (
          <div class="text-sm text-on-surface-weak">{fair.venue}</div>
        )}
      </Card.Body>
    </Card>
  );
};

export default FairCard;
