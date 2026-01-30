import DashboardNavLinks from "./DashboardNavLinks";
import NavLinks from "./NavLinks";
import { CreatorClaim } from "../../db/schema";
import NavSearch from "./NavSearch";
import NavAvatar from "./NavAvatar";

type NavbarProps = {
  isDashboard?: boolean;
  title?: string;
  currentPath?: string | null;
};

const Navbar = ({
  isDashboard,
  title = "photobookers",
  currentPath,
}: NavbarProps) => {
  return (
    <div class="navbar px-8 bg-info w-full border-b border-base-300 text-white items-center justify-between gap-2">
      <div class=" flex-1 px-2 cursor-pointer">
        <a href="/">{title}</a>
      </div>
      <div class="flex items-center gap-4">
        {/* {searchIcon} */}
        {isDashboard ? (
          <DashboardNavLinks currentPath={currentPath} />
        ) : (
          <NavLinks currentPath={currentPath} />
        )}
        <NavSearch />
        <NavAvatar />
      </div>
    </div>
  );
};

export default Navbar;

const searchIcon = (
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
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
    />
  </svg>
);
