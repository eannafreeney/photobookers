import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../components/app/Button.js";
const memberSignInPrompts = {
  feed: {
    headline: "Sign in to see your feed",
    hint: "Follow artists and publishers to get a personalised feed of their latest releases \u2014 free to join."
  },
  library: {
    headline: "Sign in to view your library",
    hint: "Wishlist titles and keep track of your collection in one place. Create a free account to get started."
  },
  messages: {
    headline: "Sign in to read creator updates",
    hint: "Notes and announcements from artists and publishers appear here. Sign up to follow creators and stay in the loop."
  }
};
const MemberSignInPrompt = ({ prompt, currentPath }) => {
  const loginHref = `/auth/login?redirectUrl=${encodeURIComponent(currentPath)}`;
  const registerHref = `/auth/accounts`;
  return /* @__PURE__ */ jsxs("div", { class: "mx-auto w-full max-w-lg border border-outline bg-surface-alt p-6 sm:p-8 text-center", children: [
    /* @__PURE__ */ jsx("p", { class: "font-display text-xl font-medium text-on-surface-strong text-balance sm:text-2xl", children: prompt.headline }),
    /* @__PURE__ */ jsx("p", { class: "mt-3 text-sm leading-relaxed text-on-surface text-pretty sm:text-base", children: prompt.hint }),
    /* @__PURE__ */ jsxs("div", { class: "mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center", children: [
      /* @__PURE__ */ jsx("a", { href: loginHref, class: "w-full sm:w-auto", children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", width: "full", children: "Log in" }) }),
      /* @__PURE__ */ jsx("a", { href: registerHref, class: "w-full sm:w-auto", children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", width: "full", children: "Create free account" }) })
    ] })
  ] });
};
var MemberSignInPrompt_default = MemberSignInPrompt;
export {
  MemberSignInPrompt_default as default,
  memberSignInPrompts
};
