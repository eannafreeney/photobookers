import z from "zod";
import { optionalText } from "../../../../schemas";

// ============ NEW USER FORM SCHEMA ============
export const newUserFormAdminSchema = z.object({
  email: z.email().min(1, "Email is required"),
  firstName: optionalText,
  lastName: optionalText,
  creatorId: optionalText,
});

export const deleteMultipleUsersSchema = z.object({
  ids: z.preprocess(
    (val) => (Array.isArray(val) ? val : val ? [val] : []),
    z.array(z.string().uuid()).min(1, "Select at least one user"),
  ),
});
