import { jsx } from "hono/jsx/jsx-runtime";
import { getInitialsAvatar } from "../../lib/avatar.js";
const NavAvatar = ({ creator, user, currentPath }) => {
  const avatarUrl = creator?.coverUrl ?? user?.profileImageUrl ?? getInitialsAvatar(user?.firstName ?? "", user?.lastName ?? "");
  const avatarAlt = `${user?.firstName} ${user?.lastName}`;
  const alpineAttrs = {
    "x-on:keydown.space.prevent": "openWithKeyboard = true",
    "x-on:keydown.enter.preven": "openWithKeyboard = true",
    "x-on:keydown.down.prevent": "openWithKeyboard = true",
    "@click": "userDropDownIsOpen = ! userDropDownIsOpen",
    "@avatar:updated.window": `$ajax('${currentPath}')`
  };
  return /* @__PURE__ */ jsx(
    "button",
    {
      id: "nav-avatar",
      class: "rounded-full focus-visible:outline-2 focus-visible:outline-offset-2  cursor-pointer",
      ...alpineAttrs,
      children: /* @__PURE__ */ jsx(
        "img",
        {
          src: avatarUrl ?? user?.creator?.coverUrl ?? "",
          alt: avatarAlt,
          loading: "lazy",
          class: "size-10 rounded-full object-cover"
        }
      )
    }
  );
};
var NavAvatar_default = NavAvatar;
export {
  NavAvatar_default as default
};
