import NavDesktopMenu, { NavLink } from "./NavDesktopMenu";
import NavMobileMenu from "./NavMobileMenu";
import NavSearch from "./NavSearch";
import BrandLogo from "../app/BrandLogo";
import Button from "../app/Button";
import { AuthUser } from "../../../types";
import { isStaging } from "../../lib/isStaging";

type NavbarProps = {
  currentPath?: string | null;
  user?: AuthUser | null;
  adminEditHref?: string;
};

const Navbar = ({ currentPath, user, adminEditHref }: NavbarProps) => {
  const staging = isStaging();
  const alpineAttrs = {
    "x-data": "{ mobileMenuIsOpen: false, scrolled: false }",
    "x-init": "scrolled = window.scrollY > 20",
    "x-on:click.away": "mobileMenuIsOpen = false",
    "x-on:scroll.window": "scrolled = window.scrollY > 20",
  };

  return (
    <nav
      x-bind:class="scrolled ? 'py-2! shadow-sm' : ''"
      class={`sticky top-0 z-50 border-b py-4 shadow-none transition-all duration-200 ease-in-out ${staging ? "border-blue-300 bg-blue-500" : "border-on-surface-strong bg-surface"}`}
      {...alpineAttrs}
    >
      <div class="mx-auto flex w-full max-w-[1680px] items-center justify-between gap-4 px-4 md:px-8">
        <BrandLogo />
        <div class="hidden md:flex items-center gap-4">
          <AdminEditButton href={adminEditHref} user={user} />
          <NavLink href="/books" currentPath={currentPath} variant="nav">
            Books
          </NavLink>
          <NavLink href="/creators" currentPath={currentPath} variant="nav">
            Creators
          </NavLink>
          {user && (
            <>
              <NavLink href="/feed" currentPath={currentPath} variant="nav">
                Feed
              </NavLink>
              <NavLink href="/shelf" currentPath={currentPath} variant="nav">
                Shelf
              </NavLink>
            </>
          )}
          {!user && (
            <NavLink href="/about" currentPath={currentPath} variant="nav">
              About
            </NavLink>
          )}
          <NavSearch />
          <NavDesktopMenu currentPath={currentPath} />
        </div>
        <NavMobileMenu currentPath={currentPath} />
      </div>
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
