import NavDesktopMenu from "./NavDesktopMenu";
import NavMobileMenu from "./NavMobileMenu";
import NavSearch from "./NavSearch";
import BrandLogo from "../app/BrandLogo";
import NavSearchMobile from "./NavSearchMobile";

const Navbar = ({ currentPath }: { currentPath?: string | null }) => {
  const alpineAttrs = {
    "x-data": "{ mobileMenuIsOpen: false }",
    "x-on:click.away": "mobileMenuIsOpen = false",
  };

  return (
    <nav
      class="flex items-center justify-between bg-surface border-b border-outline gap-4 px-6 py-4"
      {...alpineAttrs}
    >
      <BrandLogo />
      <div class="flex items-center gap-4">
        <NavSearch action="/api/search" />
        <NavDesktopMenu currentPath={currentPath} />
      </div>
      {/* <NavSearchMobile /> */}
      <NavMobileMenu currentPath={currentPath} />
    </nav>
  );
};

export default Navbar;
