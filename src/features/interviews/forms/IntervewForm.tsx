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
          class="flex flex-col gap-4"
          {...{ "x-target.away": "_top" }}
        >
          <TextArea
            label="What inspired you to start creating books?"
            name="q1"
            placeholder="Question 1"
            required
          />
          <TextArea
            label="what was your biggest challenge in bringing books to life?"
            name="q2"
            placeholder="Question 2"
            required
          />
          <TextArea
            label="What advice would you give someone starting their first photobook?"
            name="q3"
            placeholder="Question 3"
            required
          />
          <TextArea
            label="What does your creative process look like from first idea to finished work?"
            name="q4"
            placeholder="Question 4"
            required
          />
          <TextArea
            label="How has your practice changed over time, and what are you trying to explore next?"
            name="q5"
            placeholder="Question 5"
            required
          />
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
