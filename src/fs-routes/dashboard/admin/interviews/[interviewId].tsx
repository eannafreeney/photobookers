import { getInterviewById } from "../../../../features/app/services";
import InfoPage from "../../../../pages/InfoPage";
import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../lib/validator";
import {
  interviewFormSchema,
  interviewIdSchema,
} from "../../../../features/interviews/schema";
import Sidebar from "../../../../components/app/Sidebar";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import { getUser } from "../../../../utils";
import EditInterviewForm from "../../../../features/dashboard/admin/interviews/forms/EditInterviewForm";
import {
  deleteInterviewById,
  setInterviewPublishStatus,
  updateInterviewAndPublishById,
} from "../../../../features/dashboard/admin/interviews/services";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers";
import Alert from "../../../../components/app/Alert";
import InterviewPublishToggleForm from "../../../../features/dashboard/admin/interviews/components/InterviewPublishToggleForm";

export const GET = createRoute(paramValidator(interviewIdSchema), async (c) => {
  const interviewId = c.req.valid("param").interviewId;

  const user = await getUser(c);
  const currentPath = c.req.path;

  const [error, interview] = await getInterviewById(interviewId);
  if (error) return c.html(<InfoPage errorMessage={error.reason} />);
  if (!interview)
    return c.html(<InfoPage errorMessage="Interview not found" />);

  return c.html(
    <AppLayout title="Admin Interviews" user={user} currentPath={currentPath}>
      <Page>
        <Sidebar currentPath={currentPath}>
          <EditInterviewForm interview={interview} />
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});

export const POST = createRoute(
  paramValidator(interviewIdSchema),
  formValidator(interviewFormSchema),
  async (c) => {
    const interviewId = c.req.valid("param").interviewId;
    const form = c.req.valid("form");
    const [error] = await updateInterviewAndPublishById(interviewId, form);
    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, "Interview published");
  },
);

export const DELETE = createRoute(
  paramValidator(interviewIdSchema),
  async (c) => {
    const interviewId = c.req.valid("param").interviewId;
    const [error] = await deleteInterviewById(interviewId);
    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, "Interview deleted");
  },
);

export const PATCH = createRoute(
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
      intent,
    );
    if (error || !updated) {
      return showErrorAlert(c, error?.reason ?? "Failed to update interview", 400);
    }

    const statusLabel =
      updated.status === "published"
        ? "Published"
        : updated.status === "completed"
          ? "Completed"
          : updated.status === "expired"
            ? "Expired"
            : "Sent";

    return c.html(
      <>
        <Alert
          type={intent === "publish" ? "success" : "warning"}
          message={
            intent === "publish"
              ? "Interview published"
              : "Interview unpublished"
          }
        />
        <InterviewPublishToggleForm interview={updated} />
        <span id={`interview-status-${interviewId}`}>{statusLabel}</span>
      </>,
    );
  },
);
