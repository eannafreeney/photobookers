import type { FairAttendeeStatus } from "../../../../../db/schema";

type AttendeeStatusPillProps = {
  status: FairAttendeeStatus;
};

const AttendeeStatusPill = ({ status }: AttendeeStatusPillProps) => {
  const pillClasses = {
    pending: "bg-yellow-200 text-yellow-800",
    approved: "bg-green-200 text-green-800",
    rejected: "bg-red-200 text-red-800",
  };

  return (
    <span
      class={`px-2 py-1 rounded text-xs font-medium ${pillClasses[status]}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default AttendeeStatusPill;
