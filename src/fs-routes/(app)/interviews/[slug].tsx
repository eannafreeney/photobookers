import { createRoute } from "hono-fsr";
import Page from "../../../components/layouts/Page";
import AppLayout from "../../../components/layouts/AppLayout";
import InfoPage from "../../../pages/InfoPage";
import { getInterviewByCreatorSlug } from "../../../features/app/services";
import { slugSchema } from "../../../features/app/schema";
import { paramValidator } from "../../../lib/validator";
import CardCreatorCard from "../../../components/app/CardCreatorCard";
import { getUser } from "../../../utils";

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
        <div className="flex flex-col items-center gap-8 sm:max-w-3xl mx-auto">
          <CardCreatorCard
            creator={{
              ...interview.creator,
              email: null,
              tagline: null,
              status: null,
              city: null,
              country: null,
            }}
            avatarSize="md"
          />
          {interview.answers?.q1 && (
            <AnswerCard
              question="What inspired you to start publishing books?"
              answer={interview.answers.q1}
            />
          )}
          <BookImage image={{ imageUrl: book.coverUrl ?? "" }} />
          {interview.answers?.q2 && (
            <AnswerCard
              question="What draws you to the photobook as a format?"
              answer={interview.answers.q2}
            />
          )}
          {book.images[0] && <BookImage image={book.images[0]} />}
          {interview.answers?.q3 && (
            <AnswerCard
              question="How has your practice changed over time?"
              answer={interview.answers.q3}
            />
          )}
          {book.images[1] && <BookImage image={book.images[1]} />}
          {interview.answers?.q4 && (
            <AnswerCard
              question="What's a book you've been involved with that surprised you — either in how it came together or how it landed?"
              answer={interview.answers.q4}
            />
          )}
          {book.images[2] && <BookImage image={book.images[2]} />}
          {interview.answers?.q5 && (
            <AnswerCard
              question="What's next for you?"
              answer={interview.answers.q5}
            />
          )}
          {book.images[3] && <BookImage image={book.images[3]} />}
          <div>
            Follow{" "}
            <a href={`/creators/${interview.creator.slug}`}>
              <span className="font-medium">
                {interview.creator.displayName}
              </span>
            </a>
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

const BookImage = ({ image }: { image: { imageUrl: string } }) => (
  <img
    src={image.imageUrl}
    loading="lazy"
    class="w-3/4 h-full object-cover"
    alt={image.imageUrl}
  />
);
