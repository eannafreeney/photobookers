import { jsx } from "hono/jsx/jsx-runtime";
const View = ({
  style,
  id,
  children,
  hide,
  xmlns,
  sticky = false,
  "safe-area": safeArea
}) => /* @__PURE__ */ jsx(
  "view",
  {
    xmlns,
    style,
    id,
    hide,
    sticky,
    "safe-area": safeArea,
    children
  }
);
const SafeAreaView = ({ id, children }) => /* @__PURE__ */ jsx("view", { style: "margin: 0px 20px 0px 20px;", id, children });
const ScrollView = ({
  horizontal,
  "content-container-style": contentContainerStyle,
  "hide-scroll-indicator": hideScrollIndicator = "true",
  children,
  style,
  id,
  hide,
  ...rest
}) => /* @__PURE__ */ jsx(
  "view",
  {
    scroll: "true",
    "scroll-orientation": horizontal ? "horizontal" : "vertical",
    "content-container-style": contentContainerStyle,
    style,
    id,
    hide,
    "shows-scroll-indicator": !hideScrollIndicator,
    ...rest,
    children
  }
);
const Doc = ({ children }) => /* @__PURE__ */ jsx("doc", { xmlns: "https://hyperview.org/hyperview", children });
const Screen = ({ style, children }) => /* @__PURE__ */ jsx("screen", { style, children });
const Body = ({
  id,
  scroll = "true",
  style,
  children,
  "keyboard-should-persist-taps": keyboardShouldPersistTaps
}) => /* @__PURE__ */ jsx(
  "body",
  {
    id,
    scroll,
    style,
    "keyboard-should-persist-taps": keyboardShouldPersistTaps ?? (scroll === "true" ? "handled" : void 0),
    children
  }
);
const Header = ({
  style,
  children
}) => /* @__PURE__ */ jsx("header", { style, children });
const List = ({ style, id, children, ...rest }) => /* @__PURE__ */ jsx("list", { style, id, ...rest, children });
const Section = ({ children }) => /* @__PURE__ */ jsx("section", { children });
const SectionTitle = ({ style, children }) => /* @__PURE__ */ jsx("section-title", { style, children });
const Item = ({ itemKey, style, id, children, ...rest }) => /* @__PURE__ */ jsx("item", { style, id, "list-key": itemKey, ...rest, children });
const Items = ({
  xmlns = "https://hyperview.org/hyperview",
  children
}) => /* @__PURE__ */ jsx("items", { xmlns, children });
const Image = ({ "resize-mode": resizeModeLegacy, resizeMode, ...rest }) => /* @__PURE__ */ jsx("image", { ...rest, resizeMode: resizeMode ?? resizeModeLegacy });
const Behavior = ({ trigger = "press", action = "push", ...props }) => /* @__PURE__ */ jsx("behavior", { trigger, action, ...props });
const Styles = ({ children }) => /* @__PURE__ */ jsx("styles", { children });
const Style = ({ children, ...props }) => /* @__PURE__ */ jsx("style", { ...props, children });
const Form = ({
  id,
  children
}) => /* @__PURE__ */ jsx("form", { id, children });
const SelectSingle = ({ style, id, name, children }) => /* @__PURE__ */ jsx("select-single", { style, id, name, children });
const Option = (props) => /* @__PURE__ */ jsx("option", { ...props });
const Modifier = (props) => /* @__PURE__ */ jsx("modifier", { ...props });
const TextField = ({ children, ...props }) => /* @__PURE__ */ jsx("text-field", { ...props, children });
const Spinner = () => /* @__PURE__ */ jsx("spinner", { color: "#a22c29" });
const Text = ({ style, id, children }) => /* @__PURE__ */ jsx("text", { style, id, children });
export {
  Behavior,
  Body,
  Doc,
  Form,
  Header,
  Image,
  Item,
  Items,
  List,
  Modifier,
  Option,
  SafeAreaView,
  Screen,
  ScrollView,
  Section,
  SectionTitle,
  SelectSingle,
  Spinner,
  Style,
  Styles,
  Text,
  TextField,
  View
};
