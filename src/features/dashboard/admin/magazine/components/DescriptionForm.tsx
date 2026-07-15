import FormPost from "@/components/forms/FormPost";
import TextArea from "@/components/forms/TextArea";
import FormButtons from "@/components/forms/FormButtons";

type Props = {
  bookId: string;
  blurb: string | null;
  action: string;
};

const DescriptionForm = ({ bookId, blurb, action }: Props) => {
  const initialForm = { blurb: blurb ?? "" };

  return (
    <FormPost
      action={`${action}/blurb`}
      x-data={`magazineBlurbForm(${JSON.stringify(initialForm)})`}
      x-target="toast"
      x-on:submit="submitForm($event)"
      className="mt-1 flex flex-col gap-1"
    >
      <input type="hidden" name="bookId" value={bookId} />
      <TextArea
        label="Description"
        name="form.blurb"
        minRows={6}
        validateInput="validateField('blurb')"
      />
      <FormButtons buttonText="Save description" loadingText="Saving..." />
    </FormPost>
  );
};

export default DescriptionForm;
