import Button from "../../../../components/app/Button";
import Link from "../../../../components/app/Link";
import type { BookAvailabilityStatus } from "../../../../db/schema";
import { getBookPurchaseAction } from "../../bookPurchase";

type Props = {
  bookSlug: string;
  purchaseLink: string | null;
  availabilityStatus: BookAvailabilityStatus;
  trackOutbound?: boolean;
  sticky?: boolean;
};

const stickyBarClass =
  "fixed inset-x-0 bottom-0 z-[90] border-t border-on-surface-strong bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]";

const BookPurchaseBlock = ({
  bookSlug,
  purchaseLink,
  availabilityStatus,
  trackOutbound = true,
  sticky = false,
}: Props) => {
  const action = getBookPurchaseAction({
    availabilityStatus,
    purchaseLink,
    bookSlug,
    trackOutbound,
  });

  if (action.kind === "none") return null;

  if (action.kind !== "buy") {
    const status = (
      <p
        class={`kicker ${action.kind === "sold_out" ? "text-danger" : "text-warning"}`}
      >
        {action.kind === "sold_out" ? "Sold out" : "Not currently for sale"}
      </p>
    );

    if (!sticky) return status;

    return (
      <>
        <div class={stickyBarClass}>{status}</div>
        <div class="h-20" aria-hidden="true" />
      </>
    );
  }

  const button = (
    <Link
      href={action.href}
      target="_blank"
      className={sticky ? "block w-full" : undefined}
    >
      <Button
        variant="solid"
        color="accent"
        width={sticky ? "full" : "fit"}
        type="button"
      >
        <span>{action.label}</span>
      </Button>
    </Link>
  );

  if (!sticky) return <div>{button}</div>;

  return (
    <>
      <div class={stickyBarClass}>{button}</div>
      <div class="h-20" aria-hidden="true" />
    </>
  );
};

export default BookPurchaseBlock;
