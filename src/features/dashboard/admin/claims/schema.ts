import z from "zod";
import { methodField, uuidField } from "../../../../schemas";

// ============ CLAIM APPROVE FORM SCHEMA ============
export const claimApproveFormSchema = z.object({
  claimId: uuidField,
});

// ============ CLAIM REJECT FORM SCHEMA ============
export const claimRejectFormSchema = z.object({
  claimId: uuidField,
});
