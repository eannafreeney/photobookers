import type { BookStoreStatus } from "../../../../../db/schema";

type StoreStatusBadgeProps = {
  status: BookStoreStatus;
};

const StoreStatusBadge = ({ status }: StoreStatusBadgeProps) => {
  const badgeClasses = {
    draft: "bg-gray-200 text-gray-700",
    published: "bg-green-200 text-green-800",
  };

  return (
    <span class={`px-2 py-1 rounded text-xs font-medium ${badgeClasses[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default StoreStatusBadge;
