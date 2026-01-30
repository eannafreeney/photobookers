import { getInputIcon } from "../../../utils";

const SearchForm = () => {
  const xTargetAttrs = {
    "x-on:input.debounce": "$el.form.requestSubmit()",
    "x-on:search": "$el.form.requestSubmit()",
  };
  return (
    <form
      x-target="books"
      action="/dashboard/books"
      role="search"
      aria-label="Books"
      autocomplete="off"
    >
      <label class="input">
        {getInputIcon("search")}
        <input
          type="search"
          name="search"
          aria-label="Search Term"
          placeholder="Type to filter books..."
          class="grow"
          {...xTargetAttrs}
        />
      </label>
    </form>
  );
};

export default SearchForm;
