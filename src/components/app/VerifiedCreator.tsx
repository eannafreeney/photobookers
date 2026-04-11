type VerifiedCreatorProps = {
  creatorStatus: "stub" | "verified" | "suspended" | "deleted" | null;
  size?: "xs" | "sm" | "md" | "lg";
};

const VerifiedCreator = ({
  creatorStatus = "stub",
  size = "md",
}: VerifiedCreatorProps) => {
  if (creatorStatus !== "verified") return <></>;
  const sizes = {
    xs: "size-4",
    sm: "size-6",
    md: "size-8",
    lg: "size-10",
  };

  return (
    <div title="Verified Creator">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        class={sizes[size]}
      >
        <circle cx="12" cy="12" r="10" fill="#3b82f6" />
        <path
          fill="none"
          stroke="white"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M7.5 12l3 3 6-6"
        />
      </svg>
    </div>
  );
};

export default VerifiedCreator;
