import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps.js";
import InterviewCard from "./InterviewCard.js";
const INTERVIEW_QUESTIONS = {
  q1: "What inspired you to start publishing books?",
  q2: "What draws you to the photobook as a format?",
  q3: "How has your practice changed over time?",
  q4: "What's a book you've been involved with that surprised you \u2014 either in how it came together or how it landed?",
  q5: "What's next for you?"
};
const AnswerBlock = ({
  question,
  answer
}) => /* @__PURE__ */ jsxs(View, { style: "interview-answer", children: [
  /* @__PURE__ */ jsx(Text, { style: "interview-answer-question", children: question }),
  /* @__PURE__ */ jsx(Text, { style: "interview-answer-text", children: answer })
] });
const BookImage = ({
  imageUrl,
  bookId,
  baseUrl
}) => /* @__PURE__ */ jsxs(View, { style: "interview-book-image-wrap", children: [
  /* @__PURE__ */ jsx(Behavior, { href: `${baseUrl}/hyperview/books/${bookId}/tab/book` }),
  /* @__PURE__ */ jsx(
    Image,
    {
      source: imageUrl,
      style: "interview-book-image",
      "resize-mode": "cover"
    }
  )
] });
const InterviewViewBody = ({ interview, book, baseUrl }) => {
  const answers = interview.answers;
  const bookImages = book.images ?? [];
  const creatorHref = `${baseUrl}/hyperview/creators/${interview.creator.id}/tab/books`;
  return /* @__PURE__ */ jsxs(View, { style: "interview-view", children: [
    /* @__PURE__ */ jsx(
      InterviewCard,
      {
        interview,
        href: creatorHref,
        variant: "list"
      }
    ),
    answers?.q1 && /* @__PURE__ */ jsx(AnswerBlock, { question: INTERVIEW_QUESTIONS.q1, answer: answers.q1 }),
    book.coverUrl && /* @__PURE__ */ jsx(
      BookImage,
      {
        imageUrl: book.coverUrl,
        bookId: book.id,
        baseUrl
      }
    ),
    answers?.q2 && /* @__PURE__ */ jsx(AnswerBlock, { question: INTERVIEW_QUESTIONS.q2, answer: answers.q2 }),
    bookImages[0] && /* @__PURE__ */ jsx(
      BookImage,
      {
        imageUrl: bookImages[0].imageUrl,
        bookId: book.id,
        baseUrl
      }
    ),
    answers?.q3 && /* @__PURE__ */ jsx(AnswerBlock, { question: INTERVIEW_QUESTIONS.q3, answer: answers.q3 }),
    bookImages[1] && /* @__PURE__ */ jsx(
      BookImage,
      {
        imageUrl: bookImages[1].imageUrl,
        bookId: book.id,
        baseUrl
      }
    ),
    answers?.q4 && /* @__PURE__ */ jsx(AnswerBlock, { question: INTERVIEW_QUESTIONS.q4, answer: answers.q4 }),
    bookImages[2] && /* @__PURE__ */ jsx(
      BookImage,
      {
        imageUrl: bookImages[2].imageUrl,
        bookId: book.id,
        baseUrl
      }
    ),
    answers?.q5 && /* @__PURE__ */ jsx(AnswerBlock, { question: INTERVIEW_QUESTIONS.q5, answer: answers.q5 }),
    /* @__PURE__ */ jsxs(View, { style: "interview-profile-btn", children: [
      /* @__PURE__ */ jsxs(Text, { style: "interview-profile-btn-label", children: [
        "Visit ",
        interview.creator.displayName,
        "'s profile"
      ] }),
      /* @__PURE__ */ jsx(Behavior, { href: creatorHref })
    ] })
  ] });
};
var InterviewViewBody_default = InterviewViewBody;
const interviewViewStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "interview-view",
      flexDirection: "column",
      gap: 24,
      paddingBottom: 24
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "interview-answer", flexDirection: "column", gap: 8 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "interview-answer-question",
      fontFamily: "Fraunces-SemiBold",
      fontSize: 18,
      color: "#191613",
      lineHeight: 24
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "interview-answer-text",
      fontSize: 15,
      color: "#45413a",
      lineHeight: 22
    }
  ),
  /* @__PURE__ */ jsx(Style, { id: "interview-book-image-wrap", width: "100%", borderRadius: 0, overflow: "hidden" }),
  /* @__PURE__ */ jsx(Style, { id: "interview-book-image", width: "100%", height: 320 }),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "interview-profile-btn",
      borderWidth: 1,
      borderColor: "#191613",
      borderRadius: 0,
      paddingTop: 14,
      paddingBottom: 14,
      alignItems: "center",
      marginTop: 8
    }
  ),
  /* @__PURE__ */ jsx(
    Style,
    {
      id: "interview-profile-btn-label",
      fontSize: 15,
      fontWeight: "600",
      color: "#191613"
    }
  )
] });
export {
  InterviewViewBody_default as default,
  interviewViewStyles
};
