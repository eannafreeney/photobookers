import { FC } from "hono/jsx";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";
import { getInterviewByCreatorSlug } from "../../app/services";
import InterviewCard from "./InterviewCard";

const INTERVIEW_QUESTIONS = {
  q1: "What inspired you to start publishing books?",
  q2: "What draws you to the photobook as a format?",
  q3: "How has your practice changed over time?",
  q4: "What's a book you've been involved with that surprised you — either in how it came together or how it landed?",
  q5: "What's next for you?",
} as const;

type Interview = NonNullable<
  Awaited<ReturnType<typeof getInterviewByCreatorSlug>>[1]
>;

type Book = NonNullable<
  Interview["creator"]["booksAsArtist"][0] | Interview["creator"]["booksAsPublisher"][0]
>;

type Props = {
  interview: Interview;
  book: Book;
  baseUrl: string;
};

const AnswerBlock = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => (
  <View style="interview-answer">
    <Text style="interview-answer-question">{question}</Text>
    <Text style="interview-answer-text">{answer}</Text>
  </View>
);

const BookImage = ({
  imageUrl,
  bookId,
  baseUrl,
}: {
  imageUrl: string;
  bookId: string;
  baseUrl: string;
}) => (
  <View style="interview-book-image-wrap">
    <Behavior href={`${baseUrl}/hyperview/books/${bookId}/tab/book`} />
    <Image
      source={imageUrl}
      style="interview-book-image"
      resize-mode="cover"
    />
  </View>
);

const InterviewViewBody: FC<Props> = ({ interview, book, baseUrl }) => {
  const answers = interview.answers;
  const bookImages = book.images ?? [];
  const creatorHref = `${baseUrl}/hyperview/creators/${interview.creator.id}/tab/books`;

  return (
    <View style="interview-view">
      <InterviewCard
        interview={interview}
        href={creatorHref}
        variant="list"
      />
      {answers?.q1 && (
        <AnswerBlock question={INTERVIEW_QUESTIONS.q1} answer={answers.q1} />
      )}
      {book.coverUrl && (
        <BookImage
          imageUrl={book.coverUrl}
          bookId={book.id}
          baseUrl={baseUrl}
        />
      )}
      {answers?.q2 && (
        <AnswerBlock question={INTERVIEW_QUESTIONS.q2} answer={answers.q2} />
      )}
      {bookImages[0] && (
        <BookImage
          imageUrl={bookImages[0].imageUrl}
          bookId={book.id}
          baseUrl={baseUrl}
        />
      )}
      {answers?.q3 && (
        <AnswerBlock question={INTERVIEW_QUESTIONS.q3} answer={answers.q3} />
      )}
      {bookImages[1] && (
        <BookImage
          imageUrl={bookImages[1].imageUrl}
          bookId={book.id}
          baseUrl={baseUrl}
        />
      )}
      {answers?.q4 && (
        <AnswerBlock question={INTERVIEW_QUESTIONS.q4} answer={answers.q4} />
      )}
      {bookImages[2] && (
        <BookImage
          imageUrl={bookImages[2].imageUrl}
          bookId={book.id}
          baseUrl={baseUrl}
        />
      )}
      {answers?.q5 && (
        <AnswerBlock question={INTERVIEW_QUESTIONS.q5} answer={answers.q5} />
      )}
      <View style="interview-profile-btn">
        <Text style="interview-profile-btn-label">
          Visit {interview.creator.displayName}'s profile
        </Text>
        <Behavior href={creatorHref} />
      </View>
    </View>
  );
};

export default InterviewViewBody;

export const interviewViewStyles = () => (
  <>
    <Style
      id="interview-view"
      flexDirection="column"
      gap={24}
      paddingBottom={24}
    />
    <Style id="interview-answer" flexDirection="column" gap={8} />
    <Style
      id="interview-answer-question"
      fontSize={18}
      fontWeight="700"
      color="#111111"
      lineHeight={24}
    />
    <Style
      id="interview-answer-text"
      fontSize={15}
      color="#444444"
      lineHeight={22}
    />
    <Style id="interview-book-image-wrap" width="100%" borderRadius={10} overflow="hidden" />
    <Style id="interview-book-image" width="100%" height={320} />
    <Style
      id="interview-profile-btn"
      borderWidth={1}
      borderColor="#111111"
      borderRadius={10}
      paddingTop={14}
      paddingBottom={14}
      alignItems="center"
      marginTop={8}
    />
    <Style
      id="interview-profile-btn-label"
      fontSize={15}
      fontWeight="600"
      color="#111111"
    />
  </>
);
