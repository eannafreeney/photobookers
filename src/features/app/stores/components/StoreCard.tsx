import type { BookStore } from "../../../../db/schema";
import Card from "../../../../components/app/Card";
import Link from "../../../../components/app/Link";
import { resolveStoreCoverUrl } from "../coverUrl";

type StoreCardProps = {
  store: BookStore;
};

const StoreCard = ({ store }: StoreCardProps) => {
  const storePath = `/stores/${store.slug}`;
  const coverUrl = resolveStoreCoverUrl(store);

  return (
    <Card>
      <Card.Image src={coverUrl} alt={store.name} href={storePath} />
      <Card.Body>
        <Link href={storePath}>
          <Card.Title>{store.name}</Card.Title>
        </Link>
        <div class="text-sm text-on-surface-weak">
          {store.city}, {store.country}
        </div>
        <div class="text-sm text-on-surface-weak line-clamp-2">{store.address}</div>
      </Card.Body>
    </Card>
  );
};

export default StoreCard;
