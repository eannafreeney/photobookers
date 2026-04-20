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
        message="New books go through review first. That stops once either (1) two books you added since verification have been approved, or (2) you’ve been verified for 30 days and added two books since verification. We’ll email you when this listing is approved.”"
      />
    );
  }

  // if (variant === "create_trusted") {
  //   return (
  //     <Banner
  //       type="info"
  //       message="This book will be saved as approved for listing. Add a cover image, then publish when you are ready."
  //     />
  //   );
  // }

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
