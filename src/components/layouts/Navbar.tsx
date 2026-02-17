import NavDesktopMenu from "./NavDesktopMenu";
import NavMobileMenu from "./NavMobileMenu";
import NavSearch from "./NavSearch";
import BrandLogo from "../app/BrandLogo";

const Navbar = ({ currentPath }: { currentPath?: string | null }) => {
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
        <NavSearch />
        <NavDesktopMenu currentPath={currentPath} />
      </div>
      <NavMobileMenu currentPath={currentPath} />
    </nav>
  );
};

export default Navbar;
