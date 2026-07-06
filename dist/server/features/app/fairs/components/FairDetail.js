import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { formatDate } from "../../../../utils.js";
import ExpandableDescription from "../../components/ExpandableDescription.js";
import Button from "../../../../components/app/Button.js";
import FairAttendButton from "./FairAttendButton.js";
import FairAttendingCreators from "./FairAttendingCreators.js";
const FairDetail = ({ fair, user, isAttending, isMobile }) => {
  return /* @__PURE__ */ jsxs("div", { class: "min-h-screen ", children: [
    /* @__PURE__ */ jsx(FairBanner, { fair, isMobile }),
    /* @__PURE__ */ jsxs("div", { class: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 flex flex-col gap-12", children: [
      /* @__PURE__ */ jsxs("div", { class: "text-center space-y-6", children: [
        /* @__PURE__ */ jsx("h1", { class: "font-display text-5xl md:text-6xl lg:text-7xl font-bold text-on-surface-strong leading-tight", children: fair.name }),
        /* @__PURE__ */ jsx(FairDetails, { fair }),
        /* @__PURE__ */ jsx(FairAttendButton, { fair, user, isAttending })
      ] }),
      /* @__PURE__ */ jsx(FairDescription, { fair }),
      /* @__PURE__ */ jsx(FairWebsiteButton, { fair }),
      /* @__PURE__ */ jsx(FairAttendingCreators, { fairId: fair.id })
    ] })
  ] });
};
var FairDetail_default = FairDetail;
const FairBanner = ({
  fair,
  isMobile
}) => {
  if (!fair.bannerUrl) return /* @__PURE__ */ jsx(Fragment, {});
  if (isMobile && fair.coverUrl) {
    return /* @__PURE__ */ jsx("div", { class: "mt-4 mb-12", children: /* @__PURE__ */ jsx("img", { src: fair.coverUrl, alt: fair.name, class: "w-full object-cover" }) });
  }
  return /* @__PURE__ */ jsx("div", { class: "w-full -mt-8 mb-12", children: /* @__PURE__ */ jsx("div", { class: "relative w-full h-[300px] md:h-[500px] overflow-hidden", children: /* @__PURE__ */ jsx(
    "img",
    {
      src: fair.bannerUrl,
      alt: fair.name,
      class: "w-full h-full object-cover"
    }
  ) }) });
};
const FairDetails = ({ fair }) => {
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col md:flex-row justify-center items-center gap-1 md:gap-4 text-on-surface", children: [
    /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full", children: [
      /* @__PURE__ */ jsx("span", { class: "text-accent", children: /* @__PURE__ */ jsx(CalendarIcon, {}) }),
      /* @__PURE__ */ jsxs("span", { class: "font-medium", children: [
        formatDate(fair.startDate),
        " - ",
        formatDate(fair.endDate)
      ] })
    ] }),
    (fair.city || fair.country) && /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full", children: [
      /* @__PURE__ */ jsx("span", { class: "text-accent", children: /* @__PURE__ */ jsx(MapPinIcon, {}) }),
      /* @__PURE__ */ jsx("span", { class: "font-medium", children: fair.city && fair.country ? `${fair.city}, ${fair.country}` : fair.city || fair.country })
    ] }),
    fair.venue && /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full", children: [
      /* @__PURE__ */ jsx("span", { class: "text-accent", children: /* @__PURE__ */ jsx(BuildingIcon, {}) }),
      /* @__PURE__ */ jsx("span", { class: "font-medium", children: fair.venue })
    ] })
  ] });
};
const FairDescription = ({ fair }) => {
  if (!fair.description) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx("div", { class: "max-w-none text-on-surface", children: /* @__PURE__ */ jsx("div", { class: "bg-surface-container rounded-2xl", children: /* @__PURE__ */ jsx(ExpandableDescription, { text: fair.description }) }) });
};
const FairWebsiteButton = ({ fair }) => {
  if (!fair.website) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx("div", { class: "flex justify-center", children: /* @__PURE__ */ jsx(
    "a",
    {
      href: fair.website,
      target: "_blank",
      rel: "noopener noreferrer",
      class: "inline-block",
      children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "primary", children: /* @__PURE__ */ jsxs("span", { class: "flex items-center gap-2", children: [
        "Visit Fair Website",
        /* @__PURE__ */ jsx(ExternalLinkIcon, {})
      ] }) })
    }
  ) });
};
const CalendarIcon = () => /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
    class: "w-5 h-5",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      }
    )
  }
);
const MapPinIcon = () => /* @__PURE__ */ jsxs(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
    class: "w-5 h-5",
    children: [
      /* @__PURE__ */ jsx(
        "path",
        {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          d: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        }
      ),
      /* @__PURE__ */ jsx(
        "path",
        {
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          d: "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
        }
      )
    ]
  }
);
const BuildingIcon = () => /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
    class: "w-5 h-5",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        d: "M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z"
      }
    )
  }
);
const ExternalLinkIcon = () => /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    fill: "none",
    viewBox: "0 0 24 24",
    "stroke-width": "1.5",
    stroke: "currentColor",
    class: "w-4 h-4",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        d: "M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      }
    )
  }
);
export {
  FairDetail_default as default
};
