import FormPost from "../../../../../components/forms/FormPost";
import TextArea from "../../../../../components/forms/TextArea";
import FormButtons from "../../../../../components/forms/FormButtons";
import SectionTitle from "../../../../../components/app/SectionTitle";
import { Creator, CreatorInterview } from "../../../../../db/schema";
import { CreatorCardResult } from "../../../../../constants/queries";

type Props = {
  interview: CreatorInterview & { creator: CreatorCardResult | null };
};

const EditInterviewForm = ({ interview }: Props) => {
  const initialForm = {
    q1: interview.answers?.q1 ?? "",
    q2: interview.answers?.q2 ?? "",
    q3: interview.answers?.q3 ?? "",
    q4: interview.answers?.q4 ?? "",
    q5: interview.answers?.q5 ?? "",
  };

  return (
    <>
      <SectionTitle>
        Edit Interview for {interview?.creator?.displayName}
      </SectionTitle>
      <FormPost
        action={`/dashboard/admin/interviews/${interview?.id}`}
        x-data={`editInterviewForm(${JSON.stringify(initialForm)}, true)`}
        x-target="toast"
      >
        <TextArea
          label="What inspired you to start publishing books?"
          name="form.q1"
          placeholder="Question 1"
          required
        />
        <TextArea
          label="What draws you to the photobook as a format?"
          name="form.q2"
          placeholder="Question 2"
          required
        />
        <TextArea
          label="How has your practice changed over time?"
          name="form.q3"
          placeholder="Question 3"
          required
        />
        <TextArea
          label="What's a book you've been involved with that surprised you — either in how it came together or how it landed?"
          name="form.q4"
          placeholder="Question 4"
          required
        />
        <TextArea
          label="What's next for you?"
          name="form.q5"
          placeholder="Question 5"
          required
        />
        <FormButtons
          buttonText="Publish Interview"
          loadingText="Publishing..."
        />
      </FormPost>
    </>
  );
};

export default EditInterviewForm;
