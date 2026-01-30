type Props = {
  children: string;
  variant:
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "default"
    | "inverse"
    | "primary"
    | "secondary";
};

const Badge = ({ children, variant }: Props) => {
  const badgeVariants = {
    default: "border-outline text-on-surface",
    inverse: "border-outline-dark text-on-surface",
    primary: "border-primary text-primary",
    secondary: "border-secondary text-secondary",
    info: "border-info text-info",
    success: "border-success text-success",
    warning: "border-warning text-warning",
    danger: "border-danger text-danger",
  };

  const badgeInnerVariants = {
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
    <span
      class={`w-fit inline-flex overflow-hidden rounded-radius border bg-surface text-xs font-medium text-on-surface ${badgeVariants[variant]} `}
    >
      <span class={`px-2 py-1 ${badgeInnerVariants[variant]} `}>
        {children}
      </span>
    </span>
  );
};
export default Badge;
