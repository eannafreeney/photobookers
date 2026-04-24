import { createRoute } from "hono-fsr";
import Page from "../../../components/layouts/Page";
import AppLayout from "../../../components/layouts/AppLayout";
import InfoPage from "../../../pages/InfoPage";
import { paramValidator } from "../../../lib/validator";
import { getUser } from "../../../utils";
import Sidebar from "../../../components/app/Sidebar";
import { getInterviewByToken } from "../../../features/dashboard/admin/creators/services";
import { z } from "zod";
import { getCreatorById } from "../../../features/dashboard/creators/services";
import IntervewForm from "../../../features/interviews/forms/IntervewForm";

const inviteTokenSchema = z.object({
  inviteToken: z.string().uuid(),
});

export const GET = createRoute(paramValidator(inviteTokenSchema), async (c) => {
  const inviteToken = c.req.valid("param").inviteToken;
  const [err, interview] = await getInterviewByToken(inviteToken);

  if (err || !interview)
    return c.html(<InfoPage errorMessage="Invalid interview link" />);

  if (interview.status === "completed") {
    return c.html(
      <InfoPage isSuccess errorMessage="Interview already completed." />,
    );
  }
  if (interview.status === "expired") {
    return c.html(<InfoPage errorMessage="This interview link has expired." />);
  }

  if (interview.status !== "sent") {
    return c.html(<InfoPage errorMessage="Invalid interview link" />);
  }

  const [creatorErr, creator] = await getCreatorById(interview?.creatorId);
  if (creatorErr || !creator)
    return c.html(<InfoPage errorMessage="Creator not found" />);

  const user = await getUser(c);
  const currentPath = c.req.path;

  return c.html(
    <AppLayout title="Admin Interviews" user={user} currentPath={currentPath}>
      <Page>
        <Sidebar currentPath={currentPath}>
          <IntervewForm inviteToken={inviteToken} creator={creator} />;
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});
