import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { SEARCH_RESULTS_TARGET_ID } from "../../../fs-routes/hyperview/(app)/search.js";
import { Behavior, Form, Style } from "../../../lib/hxml-comps.js";
import { TextField } from "../../../lib/hxml-comps.js";
const SearchForm = ({ baseUrl }) => {
  return /* @__PURE__ */ jsx(Form, { id: "search-form", children: /* @__PURE__ */ jsx(
    TextField,
    {
      style: "search-input",
      name: "q",
      placeholder: "Search books, tags, creators\u2026",
      children: /* @__PURE__ */ jsx(
        Behavior,
        {
          trigger: "change",
          delay: 500,
          verb: "post",
          action: "replace-inner",
          target: SEARCH_RESULTS_TARGET_ID,
          href: `${baseUrl}/hyperview/search`
        }
      )
    }
  ) });
};
var SearchForm_default = SearchForm;
const searchFormStyles = () => /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
  Style,
  {
    id: "search-input",
    borderWidth: 1,
    borderColor: "#e4e0d5",
    borderRadius: 0,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 14,
    paddingRight: 14,
    fontSize: 15,
    backgroundColor: "#fbfaf7",
    color: "#191613",
    marginBottom: 4
  }
) });
export {
  SearchForm_default as default,
  searchFormStyles
};
