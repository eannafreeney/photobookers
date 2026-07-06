import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../../components/app/Link.js";
import { getFairAttendees } from "../../../fair-attendees/services.js";
const FairAttendingCreators = async ({ fairId }) => {
  const [attendeesError, attendees] = await getFairAttendees(fairId);
  if (attendeesError || attendees.length === 0) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsxs("div", { id: "fair-attending-creators", class: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { class: "text-center", children: [
      /* @__PURE__ */ jsx("h2", { class: "font-display text-3xl md:text-4xl font-bold text-on-surface-strong mb-2", children: "Attending Creators" }),
      /* @__PURE__ */ jsxs("p", { class: "text-on-surface", children: [
        attendees.length,
        " ",
        attendees.length === 1 ? "creator" : "creators",
        " ",
        "attending this fair"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { class: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6", children: attendees.map((attendee) => /* @__PURE__ */ jsx(Link, { href: `/creators/${attendee.creator.slug}`, className: "group", children: /* @__PURE__ */ jsxs("div", { class: "flex flex-col items-center gap-3 transition-transform duration-200 hover:scale-105", children: [
      /* @__PURE__ */ jsx("div", { class: "relative w-full aspect-square overflow-hidden rounded-2xl bg-surface-container shadow-sm group-hover:shadow-md transition-shadow", children: attendee.creator.coverUrl ? /* @__PURE__ */ jsx(
        "img",
        {
          src: attendee.creator.coverUrl,
          alt: attendee.creator.displayName,
          class: "w-full h-full object-cover"
        }
      ) : /* @__PURE__ */ jsx("div", { class: "w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5", children: /* @__PURE__ */ jsx("span", { class: "text-4xl font-display font-bold text-accent/40", children: attendee.creator.displayName.charAt(0).toUpperCase() }) }) }),
      /* @__PURE__ */ jsxs("div", { class: "text-center w-full", children: [
        /* @__PURE__ */ jsx("p", { class: "text-sm font-semibold text-on-surface-strong group-hover:text-accent transition-colors line-clamp-2", children: attendee.creator.displayName }),
        (attendee.creator.city || attendee.creator.country) && /* @__PURE__ */ jsx("p", { class: "text-xs text-on-surface/70 mt-1", children: attendee.creator.city || attendee.creator.country })
      ] })
    ] }) })) })
  ] });
};
var FairAttendingCreators_default = FairAttendingCreators;
export {
  FairAttendingCreators_default as default
};
