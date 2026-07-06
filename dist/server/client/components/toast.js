import Alpine from "alpinejs";
import {
  EMPTY_TOAST_CONTAINER_HTML,
  toastItemHtml
} from "../../lib/toastMarkup.js";
function ensureToastContainer() {
  let container = document.getElementById("toast");
  if (!container) {
    document.body.insertAdjacentHTML("beforeend", EMPTY_TOAST_CONTAINER_HTML);
    container = document.getElementById("toast");
    Alpine.initTree(container);
  }
  return container;
}
function prependToast(type, message, options) {
  const container = ensureToastContainer();
  if (options?.saving) {
    container.querySelectorAll("[data-saving-toast]").forEach((el) => el.remove());
  }
  const attrs = {};
  if (options?.saving) attrs["data-saving-toast"] = "";
  container.insertAdjacentHTML(
    "afterbegin",
    toastItemHtml(type, message, attrs)
  );
  const li = container.firstElementChild;
  if (li) Alpine.initTree(li);
}
export {
  EMPTY_TOAST_CONTAINER_HTML,
  prependToast
};
