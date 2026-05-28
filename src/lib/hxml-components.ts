type AttrValue = string | number | boolean | undefined | null;
type Attrs = Record<string, AttrValue>;
export type Child = string | false | null | undefined;

function escapeAttr(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function buildAttrs(obj: Attrs): string {
  return Object.entries(obj)
    .filter(([, v]) => v != null && v !== false && v !== "")
    .map(([k, v]) => `${k}="${escapeAttr(String(v))}"`)
    .join(" ");
}

function el(tag: string, props: Attrs, ...children: Child[]): string {
  const a = buildAttrs(props);
  const body = children.filter(Boolean).join("");
  const open = a ? `${tag} ${a}` : tag;
  return body ? `<${open}>${body}</${tag}>` : `<${open} />`;
}

// ---------------------------------------------------------------------------
// Style types — all React Native layout / visual props Hyperview supports
// ---------------------------------------------------------------------------

type FlexAlign =
  | "flex-start"
  | "center"
  | "flex-end"
  | "stretch"
  | "space-between"
  | "space-around"
  | "baseline";

export type StyleProps = {
  id: string;
  // Flex layout
  flex?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: number | string;
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  flexWrap?: "wrap" | "nowrap" | "wrap-reverse";
  alignItems?: FlexAlign;
  alignSelf?: FlexAlign | "auto";
  justifyContent?: FlexAlign;
  // Sizing
  width?: number | string;
  height?: number | string;
  minWidth?: number | string;
  minHeight?: number | string;
  maxWidth?: number | string;
  maxHeight?: number | string;
  // Spacing
  margin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  marginHorizontal?: number;
  marginVertical?: number;
  padding?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingHorizontal?: number;
  paddingVertical?: number;
  // Borders
  borderRadius?: number;
  borderTopLeftRadius?: number;
  borderTopRightRadius?: number;
  borderBottomLeftRadius?: number;
  borderBottomRightRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  borderTopWidth?: number;
  borderTopColor?: string;
  borderBottomWidth?: number;
  borderBottomColor?: string;
  borderLeftWidth?: number;
  borderRightWidth?: number;
  // Colors
  backgroundColor?: string;
  color?: string;
  // Typography
  fontSize?: number;
  fontWeight?:
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900"
    | "bold"
    | "normal";
  fontStyle?: "normal" | "italic";
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: "left" | "center" | "right" | "justify";
  textDecorationLine?: "none" | "underline" | "line-through";
  // Position
  position?: "relative" | "absolute";
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  // Misc
  opacity?: number;
  overflow?: "visible" | "hidden" | "scroll";
  zIndex?: number;
};

// ---------------------------------------------------------------------------
// Trigger / action types for <behavior>
// ---------------------------------------------------------------------------

export type BehaviorTrigger =
  | "press"
  | "longPress"
  | "pressIn"
  | "pressOut"
  | "focus"
  | "blur"
  | "change"
  | "load"
  | "visible"
  | "refresh"
  | "select"
  | "deselect"
  | "submit"
  | "on-event";

export type BehaviorAction =
  | "push"
  | "new"
  | "back"
  | "close"
  | "navigate"
  | "replace"
  | "replace-inner"
  | "append"
  | "prepend"
  | "reload"
  | "dispatch-event"
  | "select-all"
  | "deselect-all"
  | "toggle"
  | "share";

// ---------------------------------------------------------------------------
// Component exports
// ---------------------------------------------------------------------------

/** Root screen wrapper — goes inside <doc> (added by `hxml()`). */
export function screen(...children: Child[]): string {
  return el("screen", {}, ...children);
}

/** Container for style rules. */
export function styles(...rules: Child[]): string {
  return el("styles", {}, ...rules);
}

/** A single named style rule. */
export function style(props: StyleProps): string {
  return el("style", props as Attrs);
}

type BodyProps = {
  style?: string;
  "scroll-orientation"?: "vertical" | "horizontal";
};
/** Screen body — the scrollable content area. */
export function body(props: BodyProps, ...children: Child[]): string {
  return el("body", props as Attrs, ...children);
}

type ViewProps = {
  style?: string;
  id?: string;
  focusable?: "true";
};
/** Generic container view. */
export function view(props: ViewProps, ...children: Child[]): string {
  return el("view", props as Attrs, ...children);
}

type TextProps = {
  style?: string;
  id?: string;
  "number-of-lines"?: number;
  selectable?: "true";
};
/** Text node — content is automatically XML-escaped. */
export function text(props: TextProps, content: string): string {
  return el("text", props as Attrs, xmlText(content));
}

type ImageProps = {
  style?: string;
  source: string;
  id?: string;
  "resize-mode"?: "cover" | "contain" | "stretch" | "center";
};
/** Remote or local image. */
export function image(props: ImageProps): string {
  return el("image", props as Attrs);
}

type ListProps = {
  style?: string;
  id?: string;
  "shows-scroll-indicator"?: "false";
  "initial-num-to-render"?: number;
};
/** Virtualized list (maps to FlatList/SectionList). */
export function list(props: ListProps, ...children: Child[]): string {
  return el("list", props as Attrs, ...children);
}

/** Section header within a <list>. */
export function section(...children: Child[]): string {
  return el("section", {}, ...children);
}

type ItemProps = {
  key?: string | number;
  style?: string;
  id?: string;
};
/** A single row inside a <section>. */
export function item(props: ItemProps, ...children: Child[]): string {
  return el("item", props as Attrs, ...children);
}

type BehaviorProps = {
  trigger: BehaviorTrigger;
  action: BehaviorAction;
  href?: string;
  verb?: "get" | "post" | "put" | "delete" | "patch";
  target?: string;
  "show-during-load"?: string;
  "hide-during-load"?: string;
  "event-name"?: string;
  once?: "true";
  delay?: number;
};
/** Attaches an interaction to its parent element. */
export function behavior(props: BehaviorProps): string {
  return el("behavior", props as Attrs);
}

type SpinnerProps = { style?: string; color?: string };
/** Loading spinner. */
export function spinner(props: SpinnerProps = {}): string {
  return el("spinner", props as Attrs);
}

type FormProps = { id?: string; action?: string; method?: string };
/** Form wrapper for POST submissions. */
export function form(props: FormProps, ...children: Child[]): string {
  return el("form", props as Attrs, ...children);
}

type OptionProps = { style?: string; value: string; selected?: "true" };
export function option(props: OptionProps, label: string): string {
  return el("option", props as Attrs, xmlText(label));
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/** XML-escape a string for safe embedding in text nodes or attributes. */
export function xmlText(s: string | null | undefined): string {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Conditionally include a child.
 *   when(isLoggedIn, view({}, text({}, "Hello")))
 */
export function when(condition: unknown, content: string): Child {
  return condition ? content : null;
}

/** Render an array of children to a single string. */
export function fragment(...children: Child[]): string {
  return children.filter(Boolean).join("");
}
