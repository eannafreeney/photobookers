import { getInitialsAvatar } from "../../lib/avatar";
import { Creator } from "../../db/schema";
import { AuthUser } from "../../../types";

type NavAvatarProps = {
  creator?: Creator;
  user?: AuthUser | null;
  currentPath?: string | null;
};

const NavAvatar = ({ creator, user, currentPath }: NavAvatarProps) => {
  const avatarUrl =
    creator?.coverUrl ??
    getInitialsAvatar(user?.firstName ?? "", user?.lastName ?? "");

  const avatarAlt = `${user?.firstName} ${user?.lastName}`;

  const alpineAttrs = {
    "x-on:keydown.space.prevent": "openWithKeyboard = true",
    "x-on:keydown.enter.preven": "openWithKeyboard = true",
    "x-on:keydown.down.prevent": "openWithKeyboard = true",
    "@click": "userDropDownIsOpen = ! userDropDownIsOpen",
    "@avatar:updated.window": `$ajax('${currentPath}', {target: 'nav-avatar'})`,
  };
  return (
    <button
      id="nav-avatar"
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

export default NavAvatar;
