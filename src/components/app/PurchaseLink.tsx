import Button from "./Button";
import Link from "./Link";
import { outboundPurchasePath } from "../../features/purchase-clicks/urls";

type PurchaseLinkProps = {
  bookSlug: string;
  purchaseLink: string | null;
  trackOutbound?: boolean;
};

const PurchaseLink = ({
  bookSlug,
  purchaseLink,
  trackOutbound = true,
}: PurchaseLinkProps) => {
  if (!purchaseLink) return <></>;

  const href = trackOutbound
    ? outboundPurchasePath(bookSlug)
    : purchaseLink;

  return (
    <Link href={href} target="_blank">
      <Button variant="solid" color="accent" width="lg">
        <span>See More →</span>
      </Button>
    </Link>
  );
};
export default PurchaseLink;
