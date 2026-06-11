import clsx from "clsx";
import { useUser } from "../../contexts/UserContext";
import { fadeTransition } from "../../lib/transitions";
import NavSearchMobile from "./NavSearchMobile";
import { getInitialsAvatar } from "../../lib/avatar";
import Button from "../app/Button";
import { closeMobileMenuIcon, openMobileMenuIcon } from "../../lib/icons";

const NavMobileMenu = ({ currentPath }: { currentPath?: string | null }) => {
  return (
    <div class="flex items-center gap-5 md:hidden">
      <NavSearchMobile />
      <MobileMenuButton />
      <MobileDropDownMenu currentPath={currentPath} />
    </div>
  );
};

export default NavMobileMenu;

const MobileMenuButton = () => {
  return (
    <button
      x-on:click="mobileMenuIsOpen = !mobileMenuIsOpen"
      x-bind:class="mobileMenuIsOpen ? 'fixed top-6 right-6 z-20' : null"
      type="button"
      class="flex text-on-surface sm:hidden"
    >
      {openMobileMenuIcon}
      {closeMobileMenuIcon}
    </button>
  );
};

type NavLinkProps = {
  href: string;
  children: string;
  currentPath?: string | null;
};

const NavLink = ({ href, children, currentPath }: NavLinkProps) => {
  const isActive = currentPath === href;
  return (
    <li class="border-b border-outline">
      <a
        href={href}
        class={clsx(
          "block w-full py-3 font-display text-2xl focus:underline",
          isActive ? "text-accent" : "text-on-surface-strong",
        )}
      >
        {children}
      </a>
    </li>
  );
};

const MobileDropDownMenu = ({
  currentPath,
}: {
  currentPath?: string | null;
}) => {
  const user = useUser();
  const avatarUrl =
    user?.creator?.coverUrl ??
    getInitialsAvatar(user?.firstName ?? "", user?.lastName ?? "");
  const avatarAlt = `${user?.firstName} ${user?.lastName}`;

  return (
    <ul
      x-cloak
      x-show="mobileMenuIsOpen"
      {...fadeTransition}
      class="fixed h-svh overflow-y-auto inset-0 z-20 flex flex-col bg-surface px-8 pb-24 pt-10 sm:hidden"
    >
      <li class="mb-4 border-none">
        <div class="flex items-center gap-2 py-2">
          {user && (
            <div class="flex items-center gap-2 py-2">
              <img
                src={avatarUrl}
                alt={avatarAlt}
                loading="lazy"
                class="size-12 rounded-full object-cover"
              />
              <div>
                <span class="font-medium text-on-surface-strong dark:text-on-surface-dark-strong">
                  {user?.firstName} {user?.lastName}
                </span>
                <p class="text-sm text-on-surface dark:text-on-surface-dark">
                  {user?.email}
                </p>
              </div>
            </div>
          )}
          <button
            x-on:click="mobileMenuIsOpen = !mobileMenuIsOpen"
            x-bind:class="mobileMenuIsOpen ? 'fixed top-6 right-6 z-20' : null"
            type="button"
            class="flex text-on-surface sm:hidden"
          >
            {closeMobileMenuIcon}
          </button>
        </div>
      </li>
      {!user && (
        <>
          <NavLink href="/auth/login" currentPath={currentPath}>
            Login
          </NavLink>
          <NavLink href="/auth/accounts" currentPath={currentPath}>
            Register
          </NavLink>
        </>
      )}
      {user?.creator?.id && (
        <>
          <NavLink href="/dashboard/books" currentPath={currentPath}>
            Dashboard
          </NavLink>
          <NavLink
            href={`/creators/${user?.creator?.slug}`}
            currentPath={currentPath}
          >
            View Profile
          </NavLink>
          <NavLink
            href={`/dashboard/creators/${user?.creator?.id}`}
            currentPath={currentPath}
          >
            {`Edit ${
              user.creator.type === "artist" ? "Artist" : "Publisher"
            } Profile`}
          </NavLink>
        </>
      )}
      {user?.isAdmin && (
        <NavLink href="/dashboard/admin/planner" currentPath={currentPath}>
          Admin Dashboard
        </NavLink>
      )}

      <NavLink href="/artists" currentPath={currentPath}>
        Artists
      </NavLink>
      <NavLink href="/publishers" currentPath={currentPath}>
        Publishers
      </NavLink>
      <NavLink href="/about" currentPath={currentPath}>
        About
      </NavLink>
      <NavLink href="/contact" currentPath={currentPath}>
        Contact
      </NavLink>
      {user && (
        <>
          <NavLink href="/followed-creators" currentPath={currentPath}>
            Creators I Follow
          </NavLink>
          <form
            {...{ "x-target.away": "_top", "x-target": "toast" }}
            action="/auth/logout"
            method="post"
          >
            <Button variant="outline" color="primary" type="submit">
              <span>Logout</span>
            </Button>
          </form>
        </>
      )}
    </ul>
  );
};
