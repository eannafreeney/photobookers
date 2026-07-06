import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { capitalize, getUser } from "../../utils.js";
import HeadlessLayout from "../../components/layouts/HeadlessLayout.js";
import RegisterCreatorForm from "../../features/auth/forms/RegisterCreatorForm.js";
import RegisterFanForm from "../../features/auth/forms/RegisterFanForm.js";
import { parseRegisterType } from "../../features/auth/schema.js";
const GET = createRoute(async (c) => {
  const registerType = parseRegisterType(c.req.query("type"));
  const user = await getUser(c);
  const redirectUrl = c.req.query("redirectUrl") ?? "";
  if (user) return c.redirect("/");
  const intendedCreatorType = registerType === "artist" || registerType === "publisher";
  return c.html(
    /* @__PURE__ */ jsx(HeadlessLayout, { title: "Create Account", children: /* @__PURE__ */ jsx("div", { class: "min-h-screen flex items-center justify-center bg-surface", children: /* @__PURE__ */ jsx("div", { class: "w-96 my-4 p-6", children: /* @__PURE__ */ jsxs("div", { id: "register-form", children: [
      /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1 border-b-2 border-on-surface-strong pb-4 mb-6 text-center", children: [
        /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: "Join Photobookers" }),
        /* @__PURE__ */ jsxs("h2", { class: "font-display text-3xl font-medium text-on-surface-strong", children: [
          "Create",
          " ",
          registerType === "fan" ? "" : capitalize(registerType),
          " ",
          "Account"
        ] })
      ] }),
      intendedCreatorType ? /* @__PURE__ */ jsx(RegisterCreatorForm, { type: registerType }) : /* @__PURE__ */ jsx(RegisterFanForm, { redirectUrl })
    ] }) }) }) })
  );
});
export {
  GET
};
