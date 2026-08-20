import Banner from "../../../../components/app/Banner";

type BannerVariant =
  | "create_moderated"
  | "create_trusted"
  | "edit_pending"
  | "edit_rejected"
  | "hidden";

type Props = { variant: BannerVariant };

const BookReviewProcessBanner = ({ variant }: Props) => {
  if (variant === "hidden" || variant === "create_trusted") return null;

  const banner =
    variant === "create_moderated" ? (
      <Banner
        type="info"
        message="Save the book details first, then add a cover image on the next step. Once you have a cover, you can submit for review."
      />
    ) : variant === "edit_pending" ? (
      <Banner
        type="info"
        message="This book is awaiting review. You can still edit details below; we will email you when it has been approved or if we need changes."
      />
    ) : (
      <Banner
        type="warning"
        message={`This book was not approved yet. Update the details below, then use "Resubmit for review" when you are ready to send it back to the team.`}
      />
    );

  return <div class="mb-4">{banner}</div>;
};

export default BookReviewProcessBanner;
