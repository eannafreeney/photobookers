
type Props = {
  isMobile?: boolean;
  currentPath?: string | null;
};

const DashboardNavLinks = ({
  isMobile,
  currentPath,
}: Props) => {
  const renderLinks = () => {
    return (
      <>
        <NavLink href="/" currentPath={currentPath}>
          Home
        </NavLink>
        <NavLink href="/dashboard/books" currentPath={currentPath}>
          Books
        </NavLink>
      </>
    );
  };

  if (isMobile) {
    return (
      <div class="drawer-side" x-cloak>
        <label
          for="my-drawer-2"
          aria-label="close sidebar"
          class="drawer-overlay"
        ></label>
        <ul class="menu bg-base-200 min-h-full w-80 p-4">{renderLinks()}</ul>
      </div>
    );
  }

  return (
    <div class="hidden flex-none lg:block">
      <ul class="menu menu-horizontal">{renderLinks()}</ul>
    </div>
  );
};

export default DashboardNavLinks;

type NavLinkProps = {
  href: string;
  children: string;
  currentPath?: string | null;
};

const NavLink = ({
  href,
  children,
  currentPath,
}: NavLinkProps) => {
  const isActive = currentPath === href;

  return (
    <li>
      <a
        href={href}
        class={`link link-hover ${isActive ? "link-primary" : ""}`}
      >
        {children}
      </a>
    </li>
  );
};
