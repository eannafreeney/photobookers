import { jsx } from "hono/jsx/jsx-runtime";
import { getInterviewById } from "../../../../features/app/services.js";
import InfoPage from "../../../../pages/InfoPage.js";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../lib/validator.js";
import {
  interviewFormSchema,
  interviewIdSchema
} from "../../../../features/interviews/schema.js";
import Sidebar from "../../../../components/app/Sidebar.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import { getUser } from "../../../../utils.js";
import EditInterviewForm from "../../../../features/dashboard/admin/interviews/forms/EditInterviewForm.js";
import {
  deleteInterviewById,
  updateInterviewAndPublishById
} from "../../../../features/dashboard/admin/interviews/services.js";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers.js";
const GET = createRoute(paramValidator(interviewIdSchema), async (c) => {
  const interviewId = c.req.valid("param").interviewId;
  const user = await getUser(c);
  const currentPath = c.req.path;
  const [error, interview] = await getInterviewById(interviewId);
  if (error) return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason }));
  if (!interview)
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Interview not found" }));
  return c.html(
    /* @__PURE__ */ jsx(AppLayout, { title: "Admin Interviews", user, currentPath, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Sidebar, { currentPath, children: /* @__PURE__ */ jsx(EditInterviewForm, { interview }) }) }) })
  );
});
const POST = createRoute(
  paramValidator(interviewIdSchema),
  formValidator(interviewFormSchema),
  async (c) => {
    const interviewId = c.req.valid("param").interviewId;
    const form = c.req.valid("form");
    const [error] = await updateInterviewAndPublishById(interviewId, form);
    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, "Interview published");
  }
);
const DELETE = createRoute(
  paramValidator(interviewIdSchema),
  async (c) => {
    const interviewId = c.req.valid("param").interviewId;
    const [error] = await deleteInterviewById(interviewId);
    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, "Interview deleted");
  }
);
export {
  DELETE,
  GET,
  POST
};
