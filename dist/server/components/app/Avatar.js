import { jsx, jsxs } from "hono/jsx/jsx-runtime";
const sizes = {
  xs: "size-6",
  sm: "size-8",
  md: "size-10",
  lg: "size-14"
};
const Avatar = ({
  src,
  alt,
  size = "md",
  firstName,
  lastName
}) => {
  if (!src && firstName && lastName) {
    return /* @__PURE__ */ jsxs("span", { class: "flex size-14 items-center justify-center overflow-hidden rounded-full border border-outline bg-surface-alt text-2xl font-bold tracking-wider text-on-surface/80", children: [
      firstName?.charAt(0),
      lastName?.charAt(0)
    ] });
  }
  return /* @__PURE__ */ jsx(
    "img",
    {
      src,
      alt,
      class: `${sizes[size]} rounded-full object-cover`
    }
  );
};
var Avatar_default = Avatar;
export {
  Avatar_default as default
};
