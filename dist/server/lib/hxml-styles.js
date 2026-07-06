import { style, fragment } from "./hxml-components.js";
function baseStyles() {
  return fragment(
    style({ id: "body", flex: 1, backgroundColor: "#f8f7f5" }),
    style({ id: "text-sm", fontSize: 13, color: "#666666" })
  );
}
export {
  baseStyles
};
