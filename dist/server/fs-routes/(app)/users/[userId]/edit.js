import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getFlash, getUser } from "../../../../utils.js";
import { userIdSchema } from "../../../../schemas/index.js";
import { formValidator, paramValidator } from "../../../../lib/validator.js";
import { userProfileFormSchema } from "../../../../features/app/schema.js";
import { updateOwnUserProfile } from "../../../../features/app/services.js";
import UserCoverForm from "../../../../features/app/forms/UserCoverForm.js";
import UserProfileForm from "../../../../features/app/forms/UserProfileForm.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import PageHeader from "../../../../components/app/PageHeader.js";
import SectionTitle from "../../../../components/app/SectionTitle.js";
import InfoPage from "../../../../pages/InfoPage.js";
import MemberSignInPrompt, {
  memberSignInPrompts
} from "../../../../features/app/components/MemberSignInPrompt.js";
import {
  showErrorAlert,
  showSuccessAlert
} from "../../../../lib/alertHelpers.js";
const GET = createRoute(
  paramValidator(userIdSchema),
  async (c) => {
    const user = await getUser(c);
    const flash = await getFlash(c);
    const currentPath = c.req.path;
    if (!user) {
      return c.html(
        /* @__PURE__ */ jsx(AppLayout, { title: "Edit Profile", user, currentPath, noIndex: true, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(
          MemberSignInPrompt,
          {
            prompt: memberSignInPrompts.profile,
            currentPath
          }
        ) }) })
      );
    }
    const userId = c.req.param("userId");
    if (userId !== user.id) {
      return c.html(
        /* @__PURE__ */ jsx(
          InfoPage,
          {
            errorMessage: "You can only edit your own profile.",
            user
          }
        )
      );
    }
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title: "Edit Profile",
          user,
          flash,
          currentPath,
          noIndex: true,
          children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-8 max-w-2xl", children: [
            /* @__PURE__ */ jsx(
              PageHeader,
              {
                kicker: "Account",
                title: "Edit Profile",
                intro: "Update your name and profile photo."
              }
            ),
            /* @__PURE__ */ jsx(UserProfileForm, { user }),
            /* @__PURE__ */ jsx("hr", { class: "border-outline" }),
            /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-4", children: [
              /* @__PURE__ */ jsx(SectionTitle, { children: "Profile Image" }),
              /* @__PURE__ */ jsx(UserCoverForm, { initialUrl: user.profileImageUrl, user })
            ] })
          ] }) })
        }
      )
    );
  }
);
const POST = createRoute(
  formValidator(userProfileFormSchema),
  paramValidator(userIdSchema),
  async (c) => {
    const user = await getUser(c);
    if (!user) {
      return showErrorAlert(c, "You must be signed in to do this.", 401);
    }
    const userId = c.req.param("userId");
    if (userId !== user.id) {
      return showErrorAlert(c, "You can only edit your own profile.", 403);
    }
    const { firstName, lastName } = c.req.valid("form");
    const [error] = await updateOwnUserProfile(user.id, {
      firstName,
      lastName
    });
    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, "Profile updated");
  }
);
export {
  GET,
  POST
};
