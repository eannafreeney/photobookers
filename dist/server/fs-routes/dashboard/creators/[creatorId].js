import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../lib/validator.js";
import { creatorIdSchema } from "../../../schemas/index.js";
import { getUser } from "../../../utils.js";
import { requireCreatorEditAccess } from "../../../middleware/creatorGuard.js";
import { creatorFormSchema } from "../../../features/dashboard/creators/schema.js";
import AppLayout from "../../../components/layouts/AppLayout.js";
import CreatorForm from "../../../features/dashboard/creators/forms/EditCreatorForm.js";
import CreatorImageForm from "../../../features/dashboard/images/forms/CreatorCoverForm.js";
import { getFormValues } from "../../../features/dashboard/creators/utils.js";
import { updateCreatorProfileAdmin } from "../../../features/dashboard/admin/creators/services.js";
import { showErrorAlert, showSuccessAlert } from "../../../lib/alertHelpers.js";
import CreatorBannerForm from "../../../features/dashboard/images/forms/CreatorBannerForm.js";
import CreatorDashboardShell from "../../../features/dashboard/components/CreatorDashboardShell.js";
import { getPendingClaim } from "../../../features/claims/services.js";
import InfoPage from "../../../pages/InfoPage.js";
const GET = createRoute(
  paramValidator(creatorIdSchema),
  requireCreatorEditAccess,
  async (c) => {
    const creator = c.get("creator");
    const user = await getUser(c);
    const currentPath = c.req.path;
    const [claimError, claim] = await getPendingClaim(user.id, creator.id);
    if (claimError)
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: claimError.reason, user }));
    const formValues = getFormValues(creator);
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title: "Edit Creator Profile",
          user,
          currentPath,
          children: /* @__PURE__ */ jsx(
            CreatorDashboardShell,
            {
              currentPath,
              user,
              claimStatus: claim?.status ?? null,
              children: /* @__PURE__ */ jsxs("div", { class: "flex items-start justify-between gap-4", children: [
                /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-8 w-1/3", children: [
                  /* @__PURE__ */ jsx(
                    CreatorImageForm,
                    {
                      initialUrl: creator?.coverUrl ?? null,
                      creator
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    CreatorBannerForm,
                    {
                      initialUrl: creator?.bannerUrl ?? null,
                      creator
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx("div", { class: "hidden md:block w-px shrink-0 bg-outline self-stretch" }),
                /* @__PURE__ */ jsx("hr", { class: "my-4 md:hidden" }),
                /* @__PURE__ */ jsx("div", { class: "md:w-2/3", children: /* @__PURE__ */ jsx(
                  CreatorForm,
                  {
                    formValues,
                    creator,
                    type: creator?.type,
                    user
                  }
                ) })
              ] })
            }
          )
        }
      )
    );
  }
);
const POST = createRoute(
  paramValidator(creatorIdSchema),
  formValidator(creatorFormSchema),
  requireCreatorEditAccess,
  async (c) => {
    const creatorId = c.req.valid("param").creatorId;
    const formData = c.req.valid("form");
    const updatedCreator = await updateCreatorProfileAdmin(formData, creatorId);
    if (!updatedCreator) return showErrorAlert(c, "Failed to update artist");
    return showSuccessAlert(c, `${updatedCreator.displayName} Updated!`);
  }
);
export {
  GET,
  POST
};
