import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { registerAndClaimFormSchema } from "../../../../features/claims/schema";
import { creatorIdSchema } from "../../../../schemas";
import { RegisterAndClaimFormContext } from "../../../../features/claims/types";
import { registerAndClaimForCreator } from "../../../../features/claims/actions";
import { setFlash } from "../../../../utils";

export const POST = createRoute(
  paramValidator(creatorIdSchema),
  formValidator(registerAndClaimFormSchema),
  async (c: RegisterAndClaimFormContext) => {
    const creatorId = c.req.valid("param").creatorId;
    const formData = c.req.valid("form");
    const startPath = `/claims/${creatorId}/start`;

    const result = await registerAndClaimForCreator(c, creatorId, formData);

    if (result.type === "error") {
      await setFlash(c, "danger", result.message);
      return c.redirect(startPath);
    }

    await setFlash(
      c,
      "success",
      "Your claim has been submitted. Please check your email for verification.",
    );
    return c.redirect(startPath);
  },
);
