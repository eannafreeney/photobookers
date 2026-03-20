import Input from "../../../components/forms/Input";
import TextArea from "../../../components/forms/TextArea";
import FormButton from "../../../components/forms/FormButtons";

const ContactForm = () => {
  const alpineAttrs = {
    "x-data": "contactForm",
    "x-target": "toast",
    "x-on:submit": "submitForm($event)",
    "x-target.away": "_top",
    "x-on:ajax:error": "isSubmitting = false",
  };

  return (
    <form
      action="/contact"
      method="post"
      class="flex flex-col gap-4 max-w-lg"
      {...alpineAttrs}
    >
      <Input label="Name" name="form.name" placeholder="Your name" required />
      <Input
        label="Email"
        name="form.email"
        type="email"
        placeholder="you@example.com"
        required
      />
      <TextArea
        label="Message"
        name="form.message"
        placeholder="How can we help?"
        minRows={5}
        required
      />
      <input
        type="text"
        name="website"
        class="hidden"
        tabindex={-1}
        autocomplete="off"
      />
      <input type="hidden" name="ts" value="${Date.now()}" />
      <FormButton buttonText="Send message" loadingText="Sending..." />
    </form>
  );
};

export default ContactForm;
