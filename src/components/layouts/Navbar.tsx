import NavDesktopMenu from "./NavDesktopMenu";
import NavMobileMenu from "./NavMobileMenu";
import NavSearch from "./NavSearch";
import BrandLogo from "../app/BrandLogo";
import Button from "../app/Button";
import { AuthUser } from "../../../types";

type NavbarProps = {
  currentPath?: string | null;
  user?: AuthUser | null;
  adminEditHref?: string;
};

const Navbar = ({ currentPath, user, adminEditHref }: NavbarProps) => {
  const alpineAttrs = {
    "x-data": "{ mobileMenuIsOpen: false }",
    "x-on:click.away": "mobileMenuIsOpen = false",
  };

  return (
    <nav
      class="flex items-center justify-between bg-surface border-b border-outline gap-4 px-6 py-4 fixed top-0 left-0 right-0 z-50 md:static md:z-auto"
      {...alpineAttrs}
    >
      <BrandLogo />
      <div class="hidden md:flex items-center gap-4">
        <AdminEditButton href={adminEditHref} user={user} />
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
