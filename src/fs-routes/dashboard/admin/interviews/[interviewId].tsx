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
import { updateInterviewAndPublishById } from "../../../../features/dashboard/admin/interviews/services";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers";

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
