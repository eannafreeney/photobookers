import { jsx } from "hono/jsx/jsx-runtime";
import { Behavior, View } from "../../../lib/hxml-comps.js";
import {
  FEATURED_TAB_BODY_ID,
  FEATURED_TAB_SPINNER_ID
} from "./featuredTabIds.js";
const BooksUpdatedListener = ({ refreshHref }) => /* @__PURE__ */ jsx(View, { children: /* @__PURE__ */ jsx(
  Behavior,
  {
    trigger: "on-event",
    "event-name": "books:updated",
    verb: "get",
    action: "replace-inner",
    target: FEATURED_TAB_BODY_ID,
    href: refreshHref,
    "hide-during-load": FEATURED_TAB_BODY_ID,
    "show-during-load": FEATURED_TAB_SPINNER_ID
  }
) });
var BooksUpdatedListener_default = BooksUpdatedListener;
export {
  BooksUpdatedListener_default as default
};
