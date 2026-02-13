const NavSearchMobile = () => {
  const alpineAttrs = {
    "x-data": "{ isOpen: false }",
    "x-on:click.outside": "isOpen = false",
  };

  const formAttrs = {
    "x-target": "search-results-mobile",
  };

  return (
    <div class="block md:hidden relative" {...alpineAttrs}>
      <form
        action="/api/search/mobile"
        method="get"
        autocomplete="off"
        {...formAttrs}
      >
        <button>{searchIcon}</button>
      </form>
      <div id="search-results-mobile"></div>
    </div>
  );
};

export default NavSearchMobile;

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
