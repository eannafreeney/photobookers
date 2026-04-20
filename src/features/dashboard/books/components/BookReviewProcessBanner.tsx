import Alert from "../../../../components/app/Alert";
import Banner from "../../../../components/app/Banner";
import {
  TRUST_MIN_BOOKS_SINCE_VERIFY,
  TRUST_VERIFIED_AGE_DAYS,
} from "../../../../lib/bookModeration";

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
        message={`New listings are moderated until your profile has been verified for ${TRUST_VERIFIED_AGE_DAYS} days and you have added ${TRUST_MIN_BOOKS_SINCE_VERIFY} books since verification. We will email you when it is approved; then you can publish from this dashboard (with a cover image).`}
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
