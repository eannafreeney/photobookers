type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav class="text-sm font-medium text-on-surface">
      <ol class="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          if (index >= items.length - 1) {
            return <li>{item.label}</li>;
          }

          return (
            <li class="flex items-center gap-1">
              <a
                href={item.href}
                class="hover:text-on-surface-strong cursor-pointer"
              >
                {item.label}
              </a>
              {chevronRightIcon}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

const chevronRightIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
    stroke-width="2"
    stroke="currentColor"
    class="size-4"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="m8.25 4.5 7.5 7.5-7.5 7.5"
    />
  </svg>
);
