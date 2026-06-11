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

const Badge = ({ children, variant = "default" }: Props) => {
  if (!children) return <></>;
  const badgeVariants = {
    default:
      "border-outline-strong text-on-surface-strong bg-surface hover:bg-surface-alt",
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
      class={`w-fit inline-flex items-center overflow-hidden border px-2.5 py-1 kicker transition-colors ${badgeVariants[variant]} `}
    >
      {children}
    </span>
  );
};
export default Badge;
