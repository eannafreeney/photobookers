function escapeAttr(v) {
  return v.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
function buildAttrs(obj) {
  return Object.entries(obj).filter(([, v]) => v != null && v !== false && v !== "").map(([k, v]) => `${k}="${escapeAttr(String(v))}"`).join(" ");
}
function el(tag, props, ...children) {
  const a = buildAttrs(props);
  const body2 = children.filter(Boolean).join("");
  const open = a ? `${tag} ${a}` : tag;
  return body2 ? `<${open}>${body2}</${tag}>` : `<${open} />`;
}
function screen(...children) {
  return el("screen", {}, ...children);
}
function styles(...rules) {
  return el("styles", {}, ...rules);
}
function style(props) {
  return el("style", props);
}
function body(props, ...children) {
  return el("body", props, ...children);
}
function view(props, ...children) {
  return el("view", props, ...children);
}
function text(props, content) {
  return el("text", props, xmlText(content));
}
function image(props) {
  return el("image", props);
}
function list(props, ...children) {
  return el("list", props, ...children);
}
function section(...children) {
  return el("section", {}, ...children);
}
function item(props, ...children) {
  return el("item", props, ...children);
}
function behavior(props) {
  return el("behavior", props);
}
function spinner(props = {}) {
  return el("spinner", props);
}
function form(props, ...children) {
  return el("form", props, ...children);
}
function option(props, label) {
  return el("option", props, xmlText(label));
}
function xmlText(s) {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function when(condition, content) {
  return condition ? content : null;
}
function fragment(...children) {
  return children.filter(Boolean).join("");
}
export {
  behavior,
  body,
  form,
  fragment,
  image,
  item,
  list,
  option,
  screen,
  section,
  spinner,
  style,
  styles,
  text,
  view,
  when,
  xmlText
};
