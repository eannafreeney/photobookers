import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import Page from "../../../../components/layouts/Page.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import InfoPage from "../../../../pages/InfoPage.js";
import { getInterviewByCreatorSlug } from "../../../../features/app/services.js";
import { slugSchema } from "../../../../features/app/schema.js";
import { paramValidator } from "../../../../lib/validator.js";
import { getUser } from "../../../../utils.js";
import Button from "../../../../components/app/Button.js";
import InterviewCard from "../../../../features/app/components/InterviewCard.js";
import {
  canonicalUrl,
  pageTitle,
  truncateDescription
} from "../../../../lib/seo.js";
const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const currentPath = c.req.path;
  const slug = c.req.valid("param").slug;
  const user = await getUser(c);
  const [error, interview] = await getInterviewByCreatorSlug(slug);
  if (error) return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason }));
  if (!interview)
    return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Interview not found" }));
  const book = interview.creator.type === "artist" ? interview.creator.booksAsArtist[0] : interview.creator.booksAsPublisher[0];
  if (!book) return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Book not found" }));
  const interviewPath = `/interviews/view/${slug}`;
  const title = pageTitle(`Interview with ${interview.creator.displayName}`);
  const description = truncateDescription(
    `Read our interview with ${interview.creator.displayName} about their photobook practice.`
  );
  const interviewCanonicalUrl = canonicalUrl(c.req.url, interviewPath);
  return c.html(
    /* @__PURE__ */ jsx(
      AppLayout,
      {
        title,
        description,
        canonicalUrl: interviewCanonicalUrl,
        currentPath,
        user,
        shareOg: {
          title,
          description,
          image: book.coverUrl ?? interview.creator.coverUrl ?? void 0,
          url: interviewCanonicalUrl
        },
        children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center gap-8 sm:max-w-3xl mx-auto", children: [
          /* @__PURE__ */ jsx(
            InterviewCard,
            {
              interview,
              widthClass: "w-full",
              link: `/creators/${interview.creator.slug}`
            }
          ),
          interview.answers?.q1 && /* @__PURE__ */ jsx(
            AnswerCard,
            {
              question: "What inspired you to start publishing books?",
              answer: interview.answers.q1
            }
          ),
          /* @__PURE__ */ jsx(
            BookImage,
            {
              image: { imageUrl: book.coverUrl ?? "" },
              slug: book.slug
            }
          ),
          interview.answers?.q2 && /* @__PURE__ */ jsx(
            AnswerCard,
            {
              question: "What draws you to the photobook as a format?",
              answer: interview.answers.q2
            }
          ),
          book.images[0] && /* @__PURE__ */ jsx(BookImage, { image: book.images[0], slug: book.slug }),
          interview.answers?.q3 && /* @__PURE__ */ jsx(
            AnswerCard,
            {
              question: "How has your practice changed over time?",
              answer: interview.answers.q3
            }
          ),
          book.images[1] && /* @__PURE__ */ jsx(BookImage, { image: book.images[1], slug: book.slug }),
          interview.answers?.q4 && /* @__PURE__ */ jsx(
            AnswerCard,
            {
              question: "What's a book you've been involved with that surprised you \u2014 either in how it came together or how it landed?",
              answer: interview.answers.q4
            }
          ),
          book.images[2] && /* @__PURE__ */ jsx(BookImage, { image: book.images[2], slug: book.slug }),
          interview.answers?.q5 && /* @__PURE__ */ jsx(
            AnswerCard,
            {
              question: "What's next for you?",
              answer: interview.answers.q5
            }
          ),
          /* @__PURE__ */ jsx("a", { href: `/creators/${interview.creator.slug}`, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", color: "primary", children: [
            "Visit ",
            interview.creator.displayName,
            "'s profile"
          ] }) })
        ] }) })
      }
    )
  );
});
const AnswerCard = ({
  question,
  answer
}) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 w-full border-t border-outline pt-5", children: [
  /* @__PURE__ */ jsx("h3", { className: "font-display text-2xl font-medium italic text-on-surface-strong text-balance", children: question }),
  /* @__PURE__ */ jsx("p", { className: "text-base leading-relaxed text-on-surface whitespace-pre-wrap", children: answer })
] });
const BookImage = ({
  image,
  slug
}) => /* @__PURE__ */ jsx("div", { class: "w-full flex justify-center", children: /* @__PURE__ */ jsx("a", { href: `/books/${slug}`, class: "w-full flex justify-center", children: /* @__PURE__ */ jsx(
  "img",
  {
    src: image.imageUrl,
    loading: "lazy",
    class: "w-full md:w-3/4 object-cover",
    alt: slug,
    title: slug
  }
) }) });
export {
  GET
};
