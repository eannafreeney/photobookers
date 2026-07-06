import {
  HtmlEscapedCallbackPhase,
  resolveCallback
} from "hono/utils/html";
const HXML_CONTENT_TYPE = "application/vnd.hyperview+xml";
const hyperviewXmlFixes = (xml) => xml.replace(/ list-key="/g, ' key="');
const hyperview = (c) => (node, status = 200) => {
  const headers = { "Content-Type": HXML_CONTENT_TYPE };
  if (typeof node !== "object") {
    return c.html(
      hyperviewXmlFixes(node),
      status,
      headers
    );
  }
  return resolveCallback(
    node,
    HtmlEscapedCallbackPhase.Stringify,
    false,
    {}
  ).then(
    (rendered) => c.html(
      hyperviewXmlFixes(rendered),
      status,
      headers
    )
  );
};
function xmlText(s) {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
export {
  HXML_CONTENT_TYPE,
  hyperview,
  xmlText
};
