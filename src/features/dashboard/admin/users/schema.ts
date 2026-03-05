import z from "zod";

// ============ NEW USER FORM SCHEMA ============
export const newUserFormAdminSchema = z.object({
  email: z.email().min(1, "Email is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  creatorId: z.string().uuid().optional(),
});

export const deleteMultipleUsersSchema = z.object({
  ids: z.preprocess(
    (val) => (Array.isArray(val) ? val : val ? [val] : []),
    z.array(z.string().uuid()).min(1, "Select at least one user"),
  ),
});
