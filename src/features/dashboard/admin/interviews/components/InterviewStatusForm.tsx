import { capitalize } from "../../../../../utils";

type Props = {
  statusType?: "published" | "sent" | "completed" | "expired";
};

const InterviewStatusForm = ({ statusType }: Props) => {
  return (
    <form
      action="/dashboard/admin/interviews/interviews-table-filter"
      x-target="interviews-table-container"
      class="w-full flex items-center justify-center gap-2"
    >
      <FilterButton statusType={statusType} value="published" />
      <FilterButton statusType={statusType} value="sent" />
      <FilterButton statusType={statusType} value="completed" />
      <FilterButton statusType={statusType} value="expired" />
      {statusType !== undefined && (
        <FilterButton statusType={statusType} value="reset" />
      )}
    </form>
  );
};

export default InterviewStatusForm;

type FilterButtonProps = {
  statusType: "published" | "sent" | "completed" | "expired" | undefined;
  value: string;
};
const FilterButton = ({ statusType, value }: FilterButtonProps) => {
  return (
    <button
      class={`cursor-pointer px-2 py-1 rounded-radius border border-outline ${statusType === value ? "bg-primary text-on-primary" : ""}`}
      name="statusType"
      value={value}
      aria-pressed={statusType === value}
    >
      {capitalize(value)}
    </button>
  );
};
