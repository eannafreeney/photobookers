import FormButtons from "../../../../components/forms/FormButtons";
import Input from "../../../../components/forms/Input";
import TextArea from "../../../../components/forms/TextArea";

const MessageForm = ({ creatorId }: { creatorId: string }) => {
  return (
    <form
      method="post"
      action={`/dashboard/creators/${creatorId}/create`}
      class="flex flex-col gap-4 max-w-xl"
    >
      <TextArea
        label="Message"
        name="body"
        minRows={5}
        required
        maxLength={5000}
        placeholder="Write a message for your followers…"
      />
      <Input
        label="Image URLs (optional, comma-separated)"
        name="imageUrls"
        placeholder="https://…, https://…"
      />
      <FormButtons buttonText="Post message" loadingText="Posting…" />
    </form>
  );
};
export default MessageForm;
