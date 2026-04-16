import FileUploadInput from "../../../components/forms/FileUpload";
import FormButtons from "../../../components/forms/FormButtons";
import TextArea from "../../../components/forms/TextArea";
import HeadlessLayout from "../../../components/layouts/HeadlessLayout";
import Page from "../../../components/layouts/Page";
import { Creator } from "../../../db/schema";

type IntervewFormProps = {
  inviteToken: string;
  creator: Creator;
};

const IntervewForm = ({ inviteToken, creator }: IntervewFormProps) => {
  return (
    <HeadlessLayout title="Interview">
      <Page>
        <h1 className="text-2xl font-bold">{creator.displayName}</h1>
        <form
          id="interview-form"
          x-data="interviewForm"
          method="post"
          action={`/interviews/${inviteToken}`}
          enctype="multipart/form-data"
          class="flex flex-col gap-4"
          {...{ "x-target.away": "_top" }}
        >
          <TextArea
            label="What inspired you to start publishing books?"
            name="q1"
            placeholder="Question 1"
            required
          />
          <TextArea
            label="What draws you to the photobook as a format?"
            name="q2"
            placeholder="Question 2"
            required
          />
          <TextArea
            label="How has your practice changed over time?"
            name="q3"
            placeholder="Question 3"
            required
          />
          <TextArea
            label="What's a book you've been involved with that surprised you — either in how it came together or how it landed?"
            name="q4"
            placeholder="Question 4"
            required
          />
          <TextArea
            label="What's next for you?"
            name="q5"
            placeholder="Question 5"
            required
          />
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium">Photo for promotion</label>
            <p class="text-xs text-base-content/60">
              An image we can use when sharing your interview.
            </p>
            <FileUploadInput
              label="Promo image"
              name="promoImage"
              accept="image/*"
              required
            />
          </div>
          <FormButtons
            buttonText="Submit interview"
            loadingText="Submitting..."
          />
        </form>
      </Page>
    </HeadlessLayout>
  );
};

export default IntervewForm;
