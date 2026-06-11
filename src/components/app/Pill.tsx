type Props = {
  children: string;
  variant?:
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "default"
    | "inverse"
    | "primary"
    | "secondary"
    | "accent";
};

const Pill = ({ children, variant = "default" }: Props) => {
  if (!children) return <></>;
  const pillVariants = {
    default:
      "border-outline-strong text-on-surface-strong bg-surface hover:bg-on-surface-strong hover:text-surface",
    inverse: "border-outline-strong text-surface bg-on-surface-strong",
    primary: "border-primary text-primary bg-primary/5",
    secondary: "border-secondary text-secondary bg-secondary/5",
    accent: "border-accent text-accent bg-accent/5",
    info: "border-info text-info bg-info/10",
    success: "border-success text-success bg-success/10",
    warning: "border-warning text-warning bg-warning/10",
    danger: "border-danger text-danger bg-danger/10",
  };

  return (
    <span
      class={`w-fit inline-flex whitespace-nowrap items-center overflow-hidden rounded-full border px-4 py-1.5 kicker transition-colors ${pillVariants[variant]} `}
    >
      {children}
    </span>
  );
};

export default Pill;
