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
      <Banner
        type="info"
        message="Your book will be submitted for review. Our team checks new listings; you will receive an email when it is approved, then you can publish it from this dashboard (with a cover image)."
      />
    );
  }

  if (variant === "create_trusted") {
    return (
      <Banner
        type="info"
        message="This book will be saved as approved for listing. Add a cover image, then publish when you are ready."
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

type BannerProps = {
  type:
    | "default"
    | "inverse"
    | "primary"
    | "secondary"
    | "info"
    | "success"
    | "warning"
    | "danger";
  message: string;
};

const Banner = ({ type = "default", message }: BannerProps) => {
  const variantBg = {
    default: "bg-surface-alt/10",
    inverse: "bg-surface-dark-alt/10",
    primary: "bg-primary/10",
    secondary: "bg-secondary/10",
    info: "bg-info/10",
    success: "bg-success/10",
    warning: "bg-warning/10",
    danger: "bg-danger/10",
  };

  return (
    <div
      class={`rounded-radius ${variantBg[type as keyof typeof variantBg]} text-on-surface py-2`}
    >
      <p class="text-center text-sm text-pretty">{message}</p>
    </div>
  );
};
