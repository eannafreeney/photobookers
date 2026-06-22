import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../../lib/validator";
import { fairIdSchema } from "../../../../../features/dashboard/admin/fairs/schema";
import { rejectFair } from "../../../../../features/dashboard/admin/fairs/services";
import { showErrorAlert } from "../../../../../lib/alertHelpers";
import { z } from "zod";
import { Context } from "hono";
import Modal from "../../../../../components/app/Modal";
import FairApprovalStatusPill from "../../../../../features/dashboard/admin/fairs/components/FairApprovalStatusPill";

const rejectFeedbackSchema = z.object({
  feedback: z.string().optional(),
});

export const GET = createRoute(
  paramValidator(fairIdSchema),
  async (c: Context) => {
    const fairId = c.req.param("fairId");

    return c.html(
      <Modal title="Reject Fair">
        <form
          method="post"
          action={`/dashboard/admin/fairs/${fairId}/reject`}
          x-target="fair-approval-status"
        >
          <div class="mb-4">
            <label for="feedback" class="block mb-2">
              Feedback (optional)
            </label>
            <textarea
              name="feedback"
              id="feedback"
              rows={4}
              class="w-full p-2 border rounded"
              placeholder="Provide feedback about why this fair was rejected..."
            />
          </div>
          <div class="flex gap-2 justify-end">
            <button
              type="button"
              class="btn btn-secondary"
              x-on:click="$dispatch('modal:close')"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-danger">
              Reject Fair
            </button>
          </div>
        </form>
      </Modal>,
    );
  },
);

type RejectContext = Context<
  import("hono/types").Env,
  string,
  {
    out: {
      param: z.infer<typeof fairIdSchema>;
      form: z.infer<typeof rejectFeedbackSchema>;
    };
  }
>;

export const POST = createRoute(
  formValidator(rejectFeedbackSchema),
  paramValidator(fairIdSchema),
  async (c: RejectContext) => {
    const fairId = c.req.valid("param").fairId;
    const formData = c.req.valid("form");

    const [error, updatedFair] = await rejectFair(fairId, formData.feedback);
    if (error) return showErrorAlert(c, error.reason);

    return c.html(
      <div id="fair-approval-status" x-merge="morph">
        <FairApprovalStatusPill approvalStatus={updatedFair.approvalStatus} />
      </div>,
    );
  },
);
