import clsx from "clsx";
import { getInputIcon } from "../../utils";

type Props = {
  target: string;
  action: string;
  placeholder: string;
  isMobile?: boolean;
  hidden?: Record<string, string | undefined>;
};

const TableSearch = ({
  target,
  action,
  placeholder,
  isMobile = false,
  hidden,
}: Props) => {
  const alpineAttrs = {
    "x-on:input.debounce": "$el.form.requestSubmit()",
    "x-on:search": "$el.form.requestSubmit()",
  };

  return (
    <form method="get" x-target={target} action={action} autocomplete="off">
      {Object.entries(hidden ?? {}).map(([name, value]) =>
        value ? <input type="hidden" name={name} value={value} /> : null,
      )}
      <label
        class={clsx(
          "bg-surface rounded-radius border-2 border-outline-strong text-on-surface-strong -mb-1 flex items-center justify-between gap-2 px-3 font-semibold focus-within:outline focus-within:outline-offset-2 focus-within:outline-accent",
          isMobile ? "w-full" : "w-64",
        )}
      >
        {getInputIcon("search")}
        <input
          type="search"
          class="w-full bg-surface px-2 py-2 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 "
          name="search"
          placeholder={placeholder}
          {...alpineAttrs}
        />
      </label>
    </form>
  );
};

export default TableSearch;
