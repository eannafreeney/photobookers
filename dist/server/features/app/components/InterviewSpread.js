import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { formatDate } from "../../../utils.js";
import { interviewPullQuote } from "../interviewQuote.js";
const InterviewSpread = ({ interview, coverUrl }) => {
  const link = `/interviews/view/${interview.creator.slug}`;
  const quote = interviewPullQuote(interview.answers?.q1);
  return /* @__PURE__ */ jsxs("div", { class: "grid items-stretch gap-0 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]", children: [
    /* @__PURE__ */ jsx("a", { href: link, class: "relative block min-h-[240px] md:min-h-[380px]", children: /* @__PURE__ */ jsx(
      "img",
      {
        src: interview.promoImageUrl ?? coverUrl ?? "",
        alt: `Interview with ${interview.creator.displayName}`,
        class: "absolute inset-0 h-full w-full object-cover",
        loading: "lazy",
        decoding: "async"
      }
    ) }),
    /* @__PURE__ */ jsxs("figure", { class: "flex flex-col justify-center gap-5 bg-surface-alt px-6 py-8 sm:px-10 md:py-12", children: [
      quote ? /* @__PURE__ */ jsxs("blockquote", { class: "font-display text-xl font-medium leading-snug text-on-surface-strong text-balance sm:text-2xl md:text-3xl", children: [
        /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "\u201C" }),
        quote,
        /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "\u201D" })
      ] }) : /* @__PURE__ */ jsxs("p", { class: "font-display text-2xl font-medium leading-snug text-on-surface-strong md:text-3xl", children: [
        "In conversation with ",
        interview.creator.displayName
      ] }),
      /* @__PURE__ */ jsxs("figcaption", { class: "flex flex-col gap-1", children: [
        /* @__PURE__ */ jsx(
          "a",
          {
            href: `/creators/${interview.creator.slug}`,
            class: "text-sm font-medium text-on-surface-strong underline decoration-accent underline-offset-4 hover:text-accent transition-colors",
            children: interview.creator.displayName
          }
        ),
        interview.completedAt ? /* @__PURE__ */ jsx("span", { class: "kicker text-on-surface-weak", children: formatDate(interview.completedAt) }) : null
      ] }),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: link,
          class: "kicker group inline-flex items-center text-accent transition-colors hover:text-on-surface-strong",
          children: [
            "Read the full interview",
            /* @__PURE__ */ jsx("span", { class: "w-0 overflow-hidden opacity-0 transition-all duration-300 ease-in-out group-hover:w-4 group-hover:opacity-100", children: "\xA0\u2192" })
          ]
        }
      )
    ] })
  ] });
};
var InterviewSpread_default = InterviewSpread;
export {
  InterviewSpread_default as default
};
