import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormPost from "../../../../../components/forms/FormPost.js";
import TextArea from "../../../../../components/forms/TextArea.js";
import FormButtons from "../../../../../components/forms/FormButtons.js";
import SectionTitle from "../../../../../components/app/SectionTitle.js";
const EditInterviewForm = ({ interview }) => {
  const initialForm = {
    q1: interview.answers?.q1 ?? "",
    q2: interview.answers?.q2 ?? "",
    q3: interview.answers?.q3 ?? "",
    q4: interview.answers?.q4 ?? "",
    q5: interview.answers?.q5 ?? ""
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(SectionTitle, { children: [
      "Edit Interview for ",
      interview?.creator?.displayName
    ] }),
    /* @__PURE__ */ jsxs(
      FormPost,
      {
        action: `/dashboard/admin/interviews/${interview?.id}`,
        "x-data": `editInterviewForm(${JSON.stringify(initialForm)}, true)`,
        "x-target": "toast",
        children: [
          /* @__PURE__ */ jsx(
            TextArea,
            {
              label: "What inspired you to start publishing books?",
              name: "form.q1",
              placeholder: "Question 1",
              required: true
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              label: "What draws you to the photobook as a format?",
              name: "form.q2",
              placeholder: "Question 2",
              required: true
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              label: "How has your practice changed over time?",
              name: "form.q3",
              placeholder: "Question 3",
              required: true
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              label: "What's a book you've been involved with that surprised you \u2014 either in how it came together or how it landed?",
              name: "form.q4",
              placeholder: "Question 4",
              required: true
            }
          ),
          /* @__PURE__ */ jsx(
            TextArea,
            {
              label: "What's next for you?",
              name: "form.q5",
              placeholder: "Question 5",
              required: true
            }
          ),
          /* @__PURE__ */ jsx(
            FormButtons,
            {
              buttonText: "Publish Interview",
              loadingText: "Publishing..."
            }
          )
        ]
      }
    )
  ] });
};
var EditInterviewForm_default = EditInterviewForm;
export {
  EditInterviewForm_default as default
};
