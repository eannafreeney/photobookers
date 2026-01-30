import NavDesktopMenu from "./NavDesktopMenu";
import NavMobileMenu from "./NavMobileMenu";
import NavSearch from "./NavSearch";
import BrandLogo from "../app/BrandLogo";

const Navbar = ({ currentPath }: { currentPath?: string | null }) => {
  return (
    <nav
      x-data="{ mobileMenuIsOpen: false }"
      {...{ "x-on:click.away": "mobileMenuIsOpen = false" }}
      class="flex items-center justify-between bg-surface-alt border-b border-outline gap-4 px-6 py-4"
    >
      <BrandLogo />
      <div class="flex items-center gap-4">
        <NavSearch />
        <NavDesktopMenu currentPath={currentPath} />
      </div>
      <NavMobileMenu currentPath={currentPath} />
    </nav>
  );
};

export default Navbar;
