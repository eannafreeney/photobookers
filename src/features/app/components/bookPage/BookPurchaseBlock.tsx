import Button from "../../../../components/app/Button";
import Link from "../../../../components/app/Link";
import type { BookAvailabilityStatus } from "../../../../db/schema";
import { getBookPurchaseAction } from "../../bookPurchase";

type Props = {
  bookSlug: string;
  purchaseLink: string | null;
  availabilityStatus: BookAvailabilityStatus;
  artistName?: string | null;
  publisherName?: string | null;
  title?: string;
  trackOutbound?: boolean;
  sticky?: boolean;
};

const stickyBarClass =
  "fixed inset-x-0 z-[90] border-t border-on-surface-strong bg-surface px-4 py-3 bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-0";

const BookPurchaseBlock = ({
  bookSlug,
  purchaseLink,
  availabilityStatus,
  artistName,
  publisherName,
  title,
  trackOutbound = true,
  sticky = false,
}: Props) => {
  const action = getBookPurchaseAction({
    availabilityStatus,
    purchaseLink,
    artistName,
    publisherName,
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
        <div class={stickyBarClass}>
          {/* {title ? (
            <p class="truncate font-medium text-on-surface-strong">{title}</p>
          ) : null} */}
          {status}
        </div>
        <div class="h-20" aria-hidden="true" />
      </>
    );
  }

  const button = (
    <Link href={action.href} target="_blank">
      <Button
        variant="solid"
        color="accent"
        width={sticky && !title ? "full" : "fit"}
        type="button"
      >
        <span>{sticky ? "Buy →" : action.label}</span>
      </Button>
    </Link>
  );

  if (!sticky) return <div>{button}</div>;

  return (
    <>
      <div class={stickyBarClass}>
        <div class="flex items-center gap-3">
          {title ? (
            <p class="min-w-0 flex-1 truncate font-medium text-on-surface-strong">
              {title}
            </p>
          ) : null}
          <div class={title ? "shrink-0" : "min-w-0 flex-1"}>{button}</div>
        </div>
      </div>
      <div class="h-20" aria-hidden="true" />
    </>
  );
};

export default BookPurchaseBlock;
