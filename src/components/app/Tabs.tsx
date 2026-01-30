const Tabs = ({
  initialTab,
}: {
  initialTab: "new-books" | "feed" | "profile";
}) => {
  const baseClass = "flex h-min items-center gap-2 px-4 py-2 text-sm";
  const selectedTabClass = "font-bold text-primary border-b-2 border-primary";
  const unselectedTabClass =
    "text-on-surface font-medium  hover:border-b-2 hover:border-b-outline-strong hover:text-on-surface-strong";

  return (
    <div class="flex flex-col gap-4">
      <div
        x-data={`{ selectedTab: '/${initialTab ?? "new-books"}' }`}
        class="w-full flex justify-center items-center gap-4"
      >
        <a
          x-on:click="selectedTab = '/new-books'"
          href="/new-books"
          class={baseClass}
          x-bind:class="selectedTab === '/new-books' ? 'font-bold text-primary border-b-2 border-primary' : 'text-on-surface font-medium  hover:border-b-2 hover:border-b-outline-strong hover:text-on-surface-strong'"
          {...{ "x-target.push": "tab-content" }}
        >
          {bookIcon}
          New
        </a>

        <a
          x-on:click="selectedTab = '/feed'"
          href="/feed"
          class={baseClass}
          x-bind:class="selectedTab === '/feed' ? 'font-bold text-primary border-b-2 border-primary' : 'text-on-surface font-medium  hover:border-b-2 hover:border-b-outline-strong hover:text-on-surface-strong'"
          {...{ "x-target.push": "tab-content" }}
        >
          {feedIcon}
          Feed
        </a>

        <a
          x-on:click="selectedTab = '/profile'"
          href="/profile"
          class={baseClass}
          x-bind:class="selectedTab === '/profile' ? 'font-bold text-primary border-b-2 border-primary' : 'text-on-surface font-medium  hover:border-b-2 hover:border-b-outline-strong hover:text-on-surface-strong'"
          {...{ "x-target.push": "tab-content" }}
        >
          {profileIcon}
          Profile
        </a>
      </div>
      <div
        id="tab-content"
        x-init={`$ajax('/${initialTab ?? "new-books"}')`}
      ></div>
    </div>
  );
};

export default Tabs;

const bookIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
    />
  </svg>
);

const feedIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-4"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
    />
  </svg>
);

const profileIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-4"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
    />
  </svg>
);
