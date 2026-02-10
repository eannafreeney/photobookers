import Button from "./Button";
import Link from "./Link";

type PurchaseLinkProps = {
  purchaseLink: string | null;
};

const PurchaseLink = ({ purchaseLink }: PurchaseLinkProps) => {
  if (!purchaseLink) return <></>;
  return (
    <Link href={purchaseLink} target="_blank">
      <Button variant="solid" color="primary" width="md">
        <span>Purchase</span>
      </Button>
    </Link>
  );
};
export default PurchaseLink;
