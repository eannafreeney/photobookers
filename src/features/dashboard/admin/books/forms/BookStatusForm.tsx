import { capitalize } from "../../../../../utils";

type Props = {
  status?: "approved" | "pending" | "rejected" | undefined;
};

const BookStatusForm = ({ status }: Props) => {
  return (
    <form
      action="/dashboard/admin/books/books-table-filter"
      x-target="books-table-container"
      class="w-full flex items-center justify-center gap-2"
    >
      <FilterButton status={status} value="approved" />
      <FilterButton status={status} value="pending" />
      <FilterButton status={status} value="rejected" />
      {status !== undefined && <FilterButton status={status} value="reset" />}
    </form>
  );
};

export default BookStatusForm;

type FilterButtonProps = {
  status: "approved" | "pending" | "rejected" | undefined;
  value: string;
};
const FilterButton = ({ status, value }: FilterButtonProps) => {
  return (
    <button
      class={`cursor-pointer px-2 py-1 rounded-radius border border-outline ${status === value ? "bg-primary text-on-primary" : ""}`}
      name="status"
      value={value}
      aria-pressed={status === value}
    >
      {capitalize(value)}
    </button>
  );
};
