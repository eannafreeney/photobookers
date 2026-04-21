import { createRoute } from "hono-fsr";
import SectionTitle from "../../../components/app/SectionTitle";
import Page from "../../../components/layouts/Page";
import AppLayout from "../../../components/layouts/AppLayout";
import InfoPage from "../../../pages/InfoPage";
import { getInterviewByCreatorSlug } from "../../../features/app/services";
import { slugSchema } from "../../../features/app/schema";
import { paramValidator } from "../../../lib/validator";
import CardCreatorCard from "../../../components/app/CardCreatorCard";

export const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const currentPath = c.req.path;
  const slug = c.req.valid("param").slug;

  const [error, interview] = await getInterviewByCreatorSlug(slug);
  if (error) return c.html(<InfoPage errorMessage={error.reason} />);
  if (!interview)
    return c.html(<InfoPage errorMessage="Interview not found" />);

  return c.html(
    <AppLayout title="About" currentPath={currentPath}>
      <Page>
        <div className="flex flex-col gap-4 sm:max-w-3xl mx-auto">
          <CardCreatorCard creator={interview.creator} avatarSize="md" />
          {interview.answers?.q1 && (
            <AnswerCard
              question="What inspired you to start publishing books?"
              answer={interview.answers.q1}
            />
          )}
          {interview.answers?.q2 && (
            <AnswerCard
              question="What draws you to the photobook as a format?"
              answer={interview.answers.q2}
            />
          )}
          {interview.answers?.q3 && (
            <AnswerCard
              question="How has your practice changed over time?"
              answer={interview.answers.q3}
            />
          )}
          {interview.answers?.q4 && (
            <AnswerCard
              question="What's a book you've been involved with that surprised you — either in how it came together or how it landed?"
              answer={interview.answers.q4}
            />
          )}
          {interview.answers?.q5 && (
            <AnswerCard
              question="What's next for you?"
              answer={interview.answers.q5}
            />
          )}
          <div>
            Follow{" "}
            <a href={`/creators/${interview.creator.slug}`}>
              <span className="font-medium">
                {interview.creator.displayName}
              </span>
            </a>{" "}
            on Photobookers
          </div>
        </div>
      </Page>
    </AppLayout>,
  );
});

const AnswerCard = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => (
  <div className="flex flex-col gap-2">
    <h3 className="text-lg font-medium">{question}</h3>
    <p>{answer}</p>
  </div>
);
