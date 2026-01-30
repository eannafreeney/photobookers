import { useUser } from "../../contexts/UserContext";
import { fadeTransition } from "../../lib/transitions";
import Button from "../app/Button";

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

const MobileMenu = () => {
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
      class="fixed max-h-svh overflow-y-auto inset-x-0 top-0 z-10 flex flex-col rounded-b-radius border-b border-outline bg-surface-alt px-8 pb-6 pt-10 sm:hidden"
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

      {/* <!-- CTA Button --> */}
      {/* <li class="mt-4 w-full border-none">
          <a
            href="#"
            class="rounded-radius bg-primary border border-primary px-4 py-2 block text-center font-medium tracking-wide text-on-primary hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:opacity-100 active:outline-offset-0"
          >
            Sign Out
          </a>
        </li> */}
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
