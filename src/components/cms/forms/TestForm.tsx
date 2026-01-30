import z from "zod";

import Input from "../ui/Input";
import Button from "../../app/Button";

export type FormComponentProps = {
  errors?: Record<string, string[] | undefined>;
};

const TestForm = ({ errors = {} }: FormComponentProps) => {
  console.log("errors", errors);
  return (
    <form
      id="test-form"
      x-data="{}"
      x-target="notification-message"
      {...{ "x-target.error": "test-form" }}
      action="/test"
      method="POST"
      enctype="multipart/form-data"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Input label="Title" name="form.title" required />
        {errors?.title && <p class="text-danger">{errors.title[0]}</p>}
        <Input label="Message" name="form.message" required />
        {errors?.message && <p class="text-danger">{errors.message[0]}</p>}
        <Button type="submit" variant="solid" color="primary">
          Send
        </Button>
      </div>
    </form>
  );
};

export default TestForm;

export const testFormSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
