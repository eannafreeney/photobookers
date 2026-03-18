type Props = {
  baseUrl: string;
  page: number;
  totalPages: number;
  targetId: string;
};

export const Pagination = ({ baseUrl, page, totalPages, targetId }: Props) => {
  if (totalPages <= 1) return null;

  const pageUrl = (p: number) =>
    `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}page=${p}`;

  const prevAttrs = {
    "x-target": `pagination ${targetId}`,
    "x-on:click":
      "$refs.paginationContent?.scrollIntoView({ behavior: 'smooth', block: 'start' })",
    ...(page <= 1 && { "aria-disabled": "true" }),
  };

  const nextAttrs = {
    "x-target": `pagination ${targetId}`,
    "x-on:click":
      "$refs.paginationContent?.scrollIntoView({ behavior: 'smooth', block: 'start' })",
    ...(page >= totalPages && { "aria-disabled": "true" }),
  };

  return (
    <nav id="pagination" class="flex items-center justify-center gap-2 mt-4">
      <div class="flex items-center gap-1">
        <a
          {...prevAttrs}
          href={page > 1 ? pageUrl(page - 1) : undefined}
          class="rounded px-2 py-1 text-sm font-medium text-primary hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-50"
        >
          {leftIcon}
        </a>
        <span class="text-sm text-on-surface-weak">
          {page} of {totalPages}
        </span>
        <a
          {...nextAttrs}
          href={page < totalPages ? pageUrl(page + 1) : undefined}
          class="rounded px-2 py-1 text-sm font-medium text-primary hover:bg-surface-hover disabled:pointer-events-none disabled:opacity-50"
        >
          {rightIcon}
        </a>
      </div>
    </nav>
  );

  // return (
  //   <nav
  //     id="pagination"
  //     class="flex items-center justify-center gap-2"
  //     x-init
  //     {...(page < totalPages && {
  //       "x-intersect": `$ajax('${baseUrl}${baseUrl.includes("?") ? "&" : "?"}page=${page + 1}', { target: 'pagination ${targetId}' })`,
  //     })}
  //   >
  //     {`${page} of ${totalPages}`} {page < totalPages && <LoadingIcon />}
  //   </nav>
  // );
};

const rightIcon = (
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
      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
    />
  </svg>
);

const leftIcon = (
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
      d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
    />
  </svg>
);

export const loadingIcon = (
  <svg
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    class="size-4 animate-spin text-primary"
  >
    <path
      opacity="0.25"
      d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
    />
    <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z" />
  </svg>
);
