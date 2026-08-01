import { jsx, jsxs } from "react/jsx-runtime";
import { Section, Row, Column, Img } from "@react-email/components";
import { appBaseUrl } from "../constants.js";
import { formatNewsletterDate } from "../utils.js";
import { BodyCopy } from "./BodyCopy.js";
import { Kicker } from "./Kicker.js";
import { SubTitle } from "./SubTitle.js";
import { Title } from "./Title.js";
import { ViewButton } from "./ViewButton.js";
const BookFeatureCard = ({ book }) => {
  const kicker = book.date ? formatNewsletterDate(book.date) : null;
  return /* @__PURE__ */ jsx(Section, { className: "mb-12", children: /* @__PURE__ */ jsx(Row, { children: /* @__PURE__ */ jsxs(Column, { children: [
    book.coverUrl ? /* @__PURE__ */ jsx(
      Img,
      {
        src: book.coverUrl,
        alt: book.title,
        className: "block w-full object-cover mx-auto mb-3"
      }
    ) : null,
    kicker && /* @__PURE__ */ jsx(Kicker, { children: kicker }),
    /* @__PURE__ */ jsx(Title, { children: book.title }),
    book.blurb ? /* @__PURE__ */ jsx(BodyCopy, { children: book.blurb }) : null,
    /* @__PURE__ */ jsxs(SubTitle, { children: [
      book.artistName,
      " ",
      book.publisherName ? `\u2013 ${book.publisherName}` : null
    ] }),
    /* @__PURE__ */ jsx(ViewButton, { href: `${appBaseUrl}/books/${book.bookSlug}` })
  ] }) }) });
};
export {
  BookFeatureCard
};
