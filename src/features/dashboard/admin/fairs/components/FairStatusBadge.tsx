import type { BookFairStatus } from "../../../../../db/schema";

type FairStatusBadgeProps = {
  status: BookFairStatus;
};

const FairStatusBadge = ({ status }: FairStatusBadgeProps) => {
  const badgeClasses = {
    draft: "bg-gray-200 text-gray-700",
    published: "bg-green-200 text-green-800",
    cancelled: "bg-red-200 text-red-800",
  };

  return (
    <span class={`px-2 py-1 rounded text-xs font-medium ${badgeClasses[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default FairStatusBadge;
