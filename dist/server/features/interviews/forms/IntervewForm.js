import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FileUploadInput from "../../../components/forms/FileUpload.js";
import FormButtons from "../../../components/forms/FormButtons.js";
import TextArea from "../../../components/forms/TextArea.js";
import HeadlessLayout from "../../../components/layouts/HeadlessLayout.js";
import Page from "../../../components/layouts/Page.js";
const IntervewForm = ({ inviteToken, creator }) => {
  return /* @__PURE__ */ jsx(HeadlessLayout, { title: "Interview", children: /* @__PURE__ */ jsxs(Page, { children: [
    /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold", children: [
      "Hi ",
      creator.displayName,
      ","
    ] }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        id: "interview-form",
        "x-data": "interviewForm",
        "x-target": "toast interview-form",
        method: "post",
        action: `/interviews/${inviteToken}`,
        enctype: "multipart/form-data",
        class: "flex flex-col gap-4",
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
          /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsx("label", { class: "text-sm font-medium", children: "Photo for promotion" }),
            /* @__PURE__ */ jsx("p", { class: "text-xs text-base-content/60", children: "An image we can use when sharing your interview." }),
            /* @__PURE__ */ jsx(
              FileUploadInput,
              {
                isVisible: true,
                label: "Promo image",
                name: "promoImage",
                accept: "image/*",
                "x-on:change": "hasPromoImage = true",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            FormButtons,
            {
              buttonText: "Submit interview",
              loadingText: "Submitting..."
            }
          )
        ]
      }
    )
  ] }) });
};
var IntervewForm_default = IntervewForm;
export {
  IntervewForm_default as default
};
