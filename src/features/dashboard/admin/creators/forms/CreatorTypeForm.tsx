import { capitalize } from "../../../../../utils";

type Props = {
  type?: "artist" | "publisher" | undefined;
};

const CreatorTypeForm = ({ type }: Props) => {
  return (
    <form
      action="/dashboard/admin/creators/creators-table-filter"
      x-target="creators-table-container"
      class="w-full flex items-center justify-center gap-2"
    >
      <FilterButton type={type} value="artist" />
      <FilterButton type={type} value="publisher" />
      {type !== undefined && <FilterButton type={type} value="reset" />}
    </form>
  );
};

export default CreatorTypeForm;

type FilterButtonProps = {
  type: "artist" | "publisher" | undefined;
  value: string;
};
const FilterButton = ({ type, value }: FilterButtonProps) => {
  return (
    <button
      class={`cursor-pointer px-2 py-1 rounded-radius border border-outline ${type === value ? "bg-primary text-on-primary" : ""}`}
      name="type"
      value={value}
      aria-pressed={type === value}
    >
      {capitalize(value)}
    </button>
  );
};
