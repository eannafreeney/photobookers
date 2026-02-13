import { getInputIcon } from "../../../utils";

type Props = {
  target: string;
  action: string;
  placeholder: string;
};

const TableSearch = ({ target, action, placeholder }: Props) => {
  const alpineAttrs = {
    "x-on:input.debounce": "$el.form.requestSubmit()",
    "x-on:search": "$el.form.requestSubmit()",
  };

  return (
    <form x-target={target} action={action} autocomplete="off">
      <label class="bg-surface-alt w-64 rounded-radius border border-outline text-on-surface-alt -mb-1 flex items-center justify-between gap-2 px-2 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-primary">
        {getInputIcon("search")}
        <input
          type="search"
          class="w-full bg-surface-alt px-2 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 "
          name="search"
          placeholder={placeholder}
          {...alpineAttrs}
        />
      </label>
    </form>
  );
};

export default TableSearch;
