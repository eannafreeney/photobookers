const NavSearch = () => {
  const attrs = {
    "x-on:input.debounce.500ms": "$el.form.requestSubmit()",
  };

  return (
    <div
      x-data="{ hasResults: false }"
      class="relative flex mr-auto w-full max-w-64 flex-col gap-1 text-on-surface"
      {...{
        "x-on:click.outside":
          "console.log('clicked outside');hasResults = false",
      }}
    >
      <form
        action="/api/search"
        method="get"
        x-target="search-results"
        {...{
          "x-on:ajax:success":
            "console.log('ajax success fired'); hasResults = true",
        }}
      >
        {searchIcon}
        <input
          type="search"
          name="search"
          placeholder="Search"
          class="w-full rounded-radius border border-outline bg-surface py-2.5 pl-10 pr-2 text-sm focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-75"
          {...attrs}
        />
      </form>
      <div class="absolute top-0 left-0 w-full z-1 " x-show="hasResults">
        <div id="search-results"></div>
      </div>
    </div>
  );
};

export default NavSearch;

const searchIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke="currentColor"
    aria-hidden="true"
    class="absolute left-2.5 top-1/2 size-5 -translate-y-1/2 text-on-surface/50"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);
