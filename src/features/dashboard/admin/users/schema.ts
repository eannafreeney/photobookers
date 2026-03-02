import z from "zod";

// ============ NEW USER FORM SCHEMA ============
export const newUserFormAdminSchema = z.object({
  email: z.email().min(1, "Email is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
