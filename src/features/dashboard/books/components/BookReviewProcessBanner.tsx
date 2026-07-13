import Banner from "../../../../components/app/Banner";

type BannerVariant =
  | "create_moderated"
  | "create_trusted"
  | "edit_pending"
  | "edit_rejected"
  | "hidden";

type Props = { variant: BannerVariant };

const BookReviewProcessBanner = ({ variant }: Props) => {
  if (variant === "hidden") return null;

  if (variant === "create_moderated") {
    return (
      <Banner
        type="info"
        message="New books are reviewed by the team before they can be published. Add a cover image, then submit for review and we’ll email you once the listing has been approved or if we need changes."
      />
    );
  }

  if (variant === "edit_pending") {
    return (
      <Banner
        type="info"
        message="This book is awaiting review. You can still edit details below; we will email you when it has been approved or if we need changes."
      />
    );
  }

  if (variant === "edit_rejected") {
    return (
      <Banner
        type="warning"
        message="This book was not approved yet. Update the details below, then use “Resubmit for review” when you are ready to send it back to the team."
      />
    );
  }

  return null;
};

export default BookReviewProcessBanner;
