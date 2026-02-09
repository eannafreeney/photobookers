import clsx from "clsx";
import { useUser } from "../../contexts/UserContext";
import { fadeTransition } from "../../lib/transitions";
import Button from "../app/Button";
import NavLinks from "../app/NavLinks";

const NavMobileMenu = ({ currentPath }: { currentPath?: string | null }) => {
  return (
    <>
      <MobileMenuBtn />
      <MobileMenu currentPath={currentPath} />
    </>
  );
};

export default NavMobileMenu;

const MobileMenuBtn = () => {
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
    <li class="p-2">
      <a
        href={href}
        class={clsx(
          "w-full text-lg font-medium focus:underline hover:color-primary",
          isActive ? "text-primary" : "text-on-surface",
        )}
      >
        {children}
      </a>
    </li>
  );
};

const MobileMenu = ({ currentPath }: { currentPath?: string | null }) => {
  const user = useUser();
  const avatarUrl =
    user?.creator?.coverUrl ??
    `https://avatar.iran.liara.run/username?username=${user?.firstName}+${user?.lastName}`;
  const avatarAlt = `${user?.firstName} ${user?.lastName}`;

  return (
    <ul
      x-cloak
      x-show="mobileMenuIsOpen"
      {...fadeTransition}
      class="fixed max-h-svh overflow-y-auto inset-x-0 top-0 z-20 flex flex-col rounded-b-radius border-b border-outline bg-surface px-8 pb-6 pt-10 sm:hidden"
    >
      <li class="mb-4 border-none">
        {user && (
          <div class="flex items-center gap-2 py-2">
            <img
              src={avatarUrl}
              alt={avatarAlt}
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
      </li>
      {!user && (
        <>
          <li class="p-2">
            <a
              href="/auth/login"
              class="w-full text-on-surface focus:underline"
            >
              Login
            </a>
          </li>
          <li class="p-2">
            <a href="/auth/accounts">
              <Button variant="solid" color="primary">
                Register
              </Button>
            </a>
          </li>
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
            {`View ${user?.creator?.displayName}`}
          </NavLink>
          <NavLink
            href={`/dashboard/creators/edit/${user?.creator?.id}`}
            currentPath={currentPath}
          >
            {`Edit ${
              user.creator.type === "artist" ? "Artist" : "Publisher"
            } Profile`}
          </NavLink>
        </>
      )}
      {user?.isAdmin && (
        <NavLink href="/dashboard/admin/claims" currentPath={currentPath}>
          Admin Dashboard
        </NavLink>
      )}
      {user && (
        <>
          <NavLink href="/user/my-account" currentPath={currentPath}>
            Edit Account
          </NavLink>
          <NavLink href="/auth/logout" currentPath={currentPath}>
            Logout
          </NavLink>
        </>
      )}
    </ul>
  );
};

const openMobileMenuIcon = (
  <svg
    x-cloak
    x-show="!mobileMenuIsOpen"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    aria-hidden="true"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke="currentColor"
    class="size-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);

const closeMobileMenuIcon = (
  <svg
    x-cloak
    x-show="mobileMenuIsOpen"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    aria-hidden="true"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke="currentColor"
    class="size-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M6 18 18 6M6 6l12 12"
    />
  </svg>
);
