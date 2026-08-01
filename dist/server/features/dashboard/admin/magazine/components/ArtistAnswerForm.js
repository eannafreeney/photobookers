import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import FormPost from "../../../../../components/forms/FormPost.js";
import TextArea from "../../../../../components/forms/TextArea.js";
import FormButtons from "../../../../../components/forms/FormButtons.js";
const ArtistAnswerForm = ({ bookId, artistQuote, action }) => {
  const initialForm = { quote: artistQuote ?? "" };
  return /* @__PURE__ */ jsxs(
    FormPost,
    {
      action: `${action}/artist-quote`,
      "x-data": `magazineArtistQuoteForm(${JSON.stringify(initialForm)})`,
      "x-target": "toast",
      "x-on:submit": "submitForm($event)",
      className: "mt-1 flex flex-col gap-1",
      children: [
        /* @__PURE__ */ jsx("input", { type: "hidden", name: "bookId", value: bookId }),
        /* @__PURE__ */ jsx(
          TextArea,
          {
            label: "Artist's answer",
            name: "form.quote",
            minRows: 3,
            placeholder: "Paste the artist's reply to publish in the issue",
            validateInput: "validateField('quote')"
          }
        ),
        /* @__PURE__ */ jsx(FormButtons, { buttonText: "Save answer", loadingText: "Saving..." })
      ]
    }
  );
};
var ArtistAnswerForm_default = ArtistAnswerForm;
export {
  ArtistAnswerForm_default as default
};
