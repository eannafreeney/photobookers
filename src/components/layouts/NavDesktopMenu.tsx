import clsx from "clsx";
import { AuthUser } from "../../../types";
import { useUser } from "../../contexts/UserContext";
import { getInitialsAvatar } from "../../lib/avatar";
import Button from "../app/Button";

type Props = {
  currentPath?: string | null;
};

const NavDesktopMenu = ({ currentPath }: Props) => {
  const user = useUser();

  return (
    <ul class="hidden items-center gap-4 shrink-0 sm:flex">
      {!user && (
        <>
          <NavLink href="/auth/login" currentPath={currentPath}>
            Login
          </NavLink>
          <a href="/auth/accounts">
            <Button variant="solid" color="primary">
              <span>Register</span>
            </Button>
          </a>
        </>
      )}

      {/* <!-- User Pic --> */}
      {user && (
        <li
          x-data="{ userDropDownIsOpen: false, openWithKeyboard: false }"
          {...{
            "x-on:keydown.esc.window":
              "userDropDownIsOpen = false, openWithKeyboard = false",
          }}
          class="relative flex items-center"
        >
          <NavAvatar />
          <DropDownMenu currentPath={currentPath} user={user} />
        </li>
      )}
    </ul>
  );
};

export default NavDesktopMenu;

type NavLinkProps = {
  href: string;
  children: string;
  currentPath?: string | null;
};

const NavLink = ({ href, children, currentPath }: NavLinkProps) => {
  const isActive = currentPath === href;

  return (
    <li>
      <a
        href={href}
        class={clsx(
          "block bg-surface-alt px-4 py-2 text-sm text-on-surface hover:bg-surface-dark-alt/5 hover:text-on-surface-strong focus-visible:bg-surface-dark-alt/10 focus-visible:text-on-surface-strong focus-visible:outline-hidden",
          isActive ? "text-primary" : "text-on-surface",
        )}
      >
        {children}
      </a>
    </li>
  );
};

const NavAvatar = () => {
  const user = useUser();
  const avatarUrl =
    user?.creator?.coverUrl ??
    getInitialsAvatar(user?.firstName ?? "", user?.lastName ?? "");

  const avatarAlt = `${user?.firstName} ${user?.lastName}`;

  const alpineAttrs = {
    "x-on:keydown.space.prevent": "openWithKeyboard = true",
    "x-on:keydown.enter.preven": "openWithKeyboard = true",
    "x-on:keydown.down.prevent": "openWithKeyboard = true",
    "@click": "userDropDownIsOpen = ! userDropDownIsOpen",
  };
  return (
    <button
      class="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
      {...alpineAttrs}
    >
      <img
        src={avatarUrl ?? user?.creator?.coverUrl ?? ""}
        alt={avatarAlt}
        class="size-10 rounded-full object-cover"
      />
    </button>
  );
};

const DropDownMenu = ({
  currentPath,
  user,
}: {
  currentPath?: string | null;
  user: AuthUser;
}) => {
  const alpineAttrs = {
    "x-cloak": "",
    "x-show": "userDropDownIsOpen || openWithKeyboard",
    "x-trap": "openWithKeyboard",
    "x-transition.opacity": "",
    "x-on:click.outside":
      "userDropDownIsOpen = false, openWithKeyboard = false",
    "x-on:keydown.down.prevent": "$focus.wrap().next()",
    "x-on:keydown.up.prevent": "$focus.wrap().previous()",
  };
  return (
    <ul
      id="userMenu"
      class="absolute right-0 top-12 flex w-fit min-w-48 flex-col overflow-hidden rounded-radius border border-outline bg-surface-alt py-1.5"
      {...alpineAttrs}
    >
      <li class="border-b border-outline dark:border-outline-dark">
        <div class="flex flex-col px-4 py-2">
          <span class="text-sm font-medium text-on-surface-strong dark:text-on-surface-dark-strong">
            {user?.firstName} {user?.lastName}
          </span>
          <p class="text-xs text-on-surface dark:text-on-surface-dark">
            {user?.email}
          </p>
        </div>
      </li>
      {user.creator?.id && (
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
