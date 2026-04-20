import { PropsWithChildren } from "hono/jsx";
import PageBleed from "../layouts/PageContent";

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

const Banner = ({
  type = "default",
  message,
  children,
}: PropsWithChildren<BannerProps>) => {
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
    <PageBleed>
      <div
        class={`rounded-radius ${variantBg[type as keyof typeof variantBg]} text-on-surface py-2 px-16 flex items-center justify-center gap-4`}
      >
        <p class="text-center text-sm text-pretty">{message}</p>
        <div>{children}</div>
      </div>
    </PageBleed>
  );
};

export default Banner;
