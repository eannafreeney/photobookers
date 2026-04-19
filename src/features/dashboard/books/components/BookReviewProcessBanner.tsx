import Alert from "../../../../components/app/Alert";

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
      <Alert
        type="info"
        message="Your book will be submitted for review. Our team checks new listings; you will receive an email when it is approved, then you can publish it from this dashboard (with a cover image)."
      />
    );
  }

  if (variant === "create_trusted") {
    return (
      <Alert
        type="info"
        message="This book will be saved as approved for listing. Add a cover image, then publish when you are ready."
      />
    );
  }

  if (variant === "edit_pending") {
    return (
      <Alert
        type="info"
        message="This book is waiting for team review. You can still edit details below; we will email you when it has been approved or if we need changes."
      />
    );
  }

  if (variant === "edit_rejected") {
    return (
      <Alert
        type="warning"
        message="This book was not approved yet. Update the details below, then use “Resubmit for review” when you are ready to send it back to the team."
      />
    );
  }

  return null;
};

export default BookReviewProcessBanner;
