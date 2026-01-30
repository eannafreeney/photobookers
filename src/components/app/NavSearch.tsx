const NavSearch = () => {
  const attrs = {
    "x-on:input.debounce.500ms": "$el.form.requestSubmit()",
    "x-on:enter": "$el.form.requestSubmit()",
  };

  return (
    <div class="hidden md:block">
      <div class="dropdown md:dropdown-end dropdown-center">
        <form action="/api/search" method="get" x-target="search-results">
          <input
            type="text"
            name="search"
            placeholder="Search"
            class="input input-bordered w-24 md:w-auto text-black"
            {...attrs}
          />
        </form>
        <div id="search-results"></div>
      </div>
    </div>
  );
};

export default NavSearch;
