import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
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
  setInterviewPublishStatus,
  updateInterviewAndPublishById
} from "../../../../features/dashboard/admin/interviews/services.js";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers.js";
import Alert from "../../../../components/app/Alert.js";
import InterviewPublishToggleForm from "../../../../features/dashboard/admin/interviews/components/InterviewPublishToggleForm.js";
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
const PATCH = createRoute(
  paramValidator(interviewIdSchema),
  async (c) => {
    const interviewId = c.req.valid("param").interviewId;
    const form = await c.req.parseBody();
    const intent = form.intent;
    if (intent !== "publish" && intent !== "unpublish") {
      return showErrorAlert(c, "Invalid publish action", 400);
    }
    const [error, updated] = await setInterviewPublishStatus(
      interviewId,
      intent
    );
    if (error || !updated) {
      return showErrorAlert(c, error?.reason ?? "Failed to update interview", 400);
    }
    const statusLabel = updated.status === "published" ? "Published" : updated.status === "completed" ? "Completed" : updated.status === "expired" ? "Expired" : "Sent";
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          Alert,
          {
            type: intent === "publish" ? "success" : "warning",
            message: intent === "publish" ? "Interview published" : "Interview unpublished"
          }
        ),
        /* @__PURE__ */ jsx(InterviewPublishToggleForm, { interview: updated }),
        /* @__PURE__ */ jsx("span", { id: `interview-status-${interviewId}`, children: statusLabel })
      ] })
    );
  }
);
export {
  DELETE,
  GET,
  PATCH,
  POST
};
