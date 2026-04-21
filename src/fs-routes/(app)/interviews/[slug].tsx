import { createRoute } from "hono-fsr";
import Page from "../../../components/layouts/Page";
import AppLayout from "../../../components/layouts/AppLayout";
import InfoPage from "../../../pages/InfoPage";
import { getInterviewByCreatorSlug } from "../../../features/app/services";
import { slugSchema } from "../../../features/app/schema";
import { paramValidator } from "../../../lib/validator";
import CardCreatorCard from "../../../components/app/CardCreatorCard";
import { getUser } from "../../../utils";
import Button from "../../../components/app/Button";
import InterviewCard from "../../../features/app/components/InterviewCard";

export const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const currentPath = c.req.path;
  const slug = c.req.valid("param").slug;
  const user = await getUser(c);

  const [error, interview] = await getInterviewByCreatorSlug(slug);
  if (error) return c.html(<InfoPage errorMessage={error.reason} />);
  if (!interview)
    return c.html(<InfoPage errorMessage="Interview not found" />);

  const book =
    interview.creator.type === "artist"
      ? interview.creator.booksAsArtist[0]
      : interview.creator.booksAsPublisher[0];
  if (!book) return c.html(<InfoPage errorMessage="Book not found" />);

  return c.html(
    <AppLayout title="About" currentPath={currentPath} user={user}>
      <Page>
        <div className="flex flex-col items-center justify-center gap-8 sm:max-w-3xl mx-auto">
          <InterviewCard
            interview={interview}
            widthClass="w-full"
            link={`/creators/${interview.creator.slug}`}
          />
          {interview.answers?.q1 && (
            <AnswerCard
              question="What inspired you to start publishing books?"
              answer={interview.answers.q1}
            />
          )}
          <BookImage
            image={{ imageUrl: book.coverUrl ?? "" }}
            slug={book.slug}
          />
          {interview.answers?.q2 && (
            <AnswerCard
              question="What draws you to the photobook as a format?"
              answer={interview.answers.q2}
            />
          )}
          {book.images[0] && (
            <BookImage image={book.images[0]} slug={book.slug} />
          )}
          {interview.answers?.q3 && (
            <AnswerCard
              question="How has your practice changed over time?"
              answer={interview.answers.q3}
            />
          )}
          {book.images[1] && (
            <BookImage image={book.images[1]} slug={book.slug} />
          )}
          {interview.answers?.q4 && (
            <AnswerCard
              question="What's a book you've been involved with that surprised you — either in how it came together or how it landed?"
              answer={interview.answers.q4}
            />
          )}
          {book.images[2] && (
            <BookImage image={book.images[2]} slug={book.slug} />
          )}
          {interview.answers?.q5 && (
            <AnswerCard
              question="What's next for you?"
              answer={interview.answers.q5}
            />
          )}
          <a href={`/creators/${interview.creator.slug}`}>
            <Button variant="outline" color="primary">
              Visit {interview.creator.displayName}'s profile
            </Button>
          </a>
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
  <div className="flex flex-col gap-2 w-full">
    <h3 className="text-xl font-bold tracking-wide">{question}</h3>
    <p className="text-base-content/80 tracking-wide">{answer}</p>
  </div>
);

const BookImage = ({
  image,
  slug,
}: {
  image: { imageUrl: string };
  slug: string;
}) => (
  <div class="w-full flex justify-center">
    <a href={`/books/${slug}`} class="w-full flex justify-center">
      <img
        src={image.imageUrl}
        loading="lazy"
        class="w-full md:w-3/4 object-cover"
        alt={slug}
        title={slug}
      />
    </a>
  </div>
);
