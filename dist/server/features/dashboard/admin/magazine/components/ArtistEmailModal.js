import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Modal from "../../../../../components/app/Modal.js";
import FormPost from "../../../../../components/forms/FormPost.js";
import Input from "../../../../../components/forms/Input.js";
import TextArea from "../../../../../components/forms/TextArea.js";
import FormButtons from "../../../../../components/forms/FormButtons.js";
const ArtistEmailModal = ({
  action,
  bookId,
  targetId,
  recipientEmail,
  subject,
  prompt,
  dayNumber
}) => {
  const initialForm = {
    email: recipientEmail ?? "",
    subject,
    prompt,
    revealDate: ""
  };
  const formAttrs = {
    "x-target": `${targetId} toast`,
    "x-target.error": "toast",
    "x-on:submit": "submitForm($event)",
    "x-on:ajax:after": "isSubmitting = false",
    "x-on:ajax:success": "$dispatch('dialog:close')"
  };
  return /* @__PURE__ */ jsx(Modal, { title: "Email question to artist", maxWidth: "max-w-2xl", children: /* @__PURE__ */ jsxs(
    FormPost,
    {
      action: `${action}/email-artist`,
      "x-data": `magazineArtistEmailForm(${JSON.stringify(initialForm)})`,
      className: "flex flex-col gap-1",
      ...formAttrs,
      children: [
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "bookId", value: bookId }),
        /* @__PURE__ */ jsx(
          Input,
          {
            label: "To",
            type: "email",
            name: "form.email",
            required: true,
            validateInput: "validateField('email')"
          }
        ),
        /* @__PURE__ */ jsx(
          Input,
          {
            label: "Subject",
            name: "form.subject",
            required: true,
            validateInput: "validateField('subject')"
          }
        ),
        /* @__PURE__ */ jsx(
          TextArea,
          {
            label: "Question for the artist (optional)",
            name: "form.prompt",
            minRows: 4,
            validateInput: "validateField('prompt')"
          }
        ),
        /* @__PURE__ */ jsx("p", { class: "-mt-1 mb-2 text-xs text-on-surface-weak", children: `Edit the question if you like \u2014 it's saved to the book, and the email is written around it. Leave it blank to send a plain "you're featured" note with just the share kit.` }),
        /* @__PURE__ */ jsx(Input, { label: "Reveal day (optional)", type: "date", name: "form.revealDate" }),
        /* @__PURE__ */ jsxs("p", { class: "-mt-1 mb-2 text-xs text-on-surface-weak", children: [
          "This is book #",
          dayNumber,
          " in the issue. Set the date it goes live on Instagram and the email tells the artist when to reshare \u2014 leave blank to skip."
        ] }),
        /* @__PURE__ */ jsx(
          FormButtons,
          {
            buttonText: "Send email",
            loadingText: "Sending...",
            showCancelButton: true
          }
        )
      ]
    }
  ) });
};
var ArtistEmailModal_default = ArtistEmailModal;
export {
  ArtistEmailModal_default as default
};
