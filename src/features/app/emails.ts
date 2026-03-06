import { contactFormSchema } from "./schema";
import { z } from "zod";

export const generateContactEmail = async (
  form: z.infer<typeof contactFormSchema>,
) => {
  return `
        <h2>Contact Form Submitted</h2>
        <p>Hello,</p>
        <p>A new contact form has been submitted with the following details:</p>
        <p>Name: ${form.name}</p>
        <p>Email: ${form.email}</p>
        <p>Message: ${form.message}</p>
      `;
};
