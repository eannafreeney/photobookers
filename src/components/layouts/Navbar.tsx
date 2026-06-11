import NavDesktopMenu, { NavLink } from "./NavDesktopMenu";
import NavMobileMenu from "./NavMobileMenu";
import NavSearch from "./NavSearch";
import BrandLogo from "../app/BrandLogo";
import Button from "../app/Button";
import { AuthUser } from "../../../types";
import FeatureGuard from "./FeatureGuard";

type NavbarProps = {
  currentPath?: string | null;
  user?: AuthUser | null;
  adminEditHref?: string;
};

const Navbar = ({ currentPath, user, adminEditHref }: NavbarProps) => {
  const alpineAttrs = {
    "x-data": "{ mobileMenuIsOpen: false, scrolled: false }",
    "x-on:click.away": "mobileMenuIsOpen = false",
    "x-on:scroll.window": "scrolled = window.scrollY > 20",
  };

  return (
    <nav
      x-bind:class="scrolled ? 'py-2 shadow-sm' : 'py-4 shadow-none'"
      class="flex items-center justify-between bg-surface border-b border-on-surface-strong gap-4 px-6 transition-all duration-200 ease-in-out sticky top-0 z-50"
      {...alpineAttrs}
    >
      <BrandLogo />
      <div class="hidden md:flex items-center gap-4">
        <AdminEditButton href={adminEditHref} user={user} />
        {user && (
          <>
            <NavLink href="/featured" currentPath={currentPath} variant="nav">
              Discover
            </NavLink>
            <NavLink href="/feed" currentPath={currentPath} variant="nav">
              Feed
            </NavLink>
            <NavLink href="/library" currentPath={currentPath} variant="nav">
              Library
            </NavLink>
            <FeatureGuard flagName="messages">
              <NavLink href="/messages" currentPath={currentPath} variant="nav">
                Messages
              </NavLink>
            </FeatureGuard>
          </>
        )}
        <NavSearch />
        <NavDesktopMenu currentPath={currentPath} />
      </div>
      <NavMobileMenu currentPath={currentPath} />
    </nav>
  );
};

export default Navbar;

type AdminEditButtonProps = {
  href?: string;
  user?: AuthUser | null;
};

const AdminEditButton = ({ href, user }: AdminEditButtonProps) => {
  if (!user?.isAdmin || !href) return <> </>;
  return (
    <a href={href}>
      <Button variant="outline" color="secondary" width="sm">
        Edit
      </Button>
    </a>
  );
};
