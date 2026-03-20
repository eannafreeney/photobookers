import z from "zod";
import { methodField, uuidField } from "../../../../schemas";

export const claimFormSchema = z.object({
  claimId: uuidField,
});
