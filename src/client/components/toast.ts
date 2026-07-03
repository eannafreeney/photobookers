import Alpine from "alpinejs";
import { type AlertType } from "../../lib/toastVariants";
import {
  EMPTY_TOAST_CONTAINER_HTML,
  toastItemHtml,
} from "../../lib/toastMarkup";

export { EMPTY_TOAST_CONTAINER_HTML };

function ensureToastContainer(): HTMLElement {
  let container = document.getElementById("toast");
  if (!container) {
    document.body.insertAdjacentHTML("beforeend", EMPTY_TOAST_CONTAINER_HTML);
    container = document.getElementById("toast")!;
    Alpine.initTree(container);
  }
  return container;
}

export function prependToast(
  type: AlertType,
  message: string,
  options?: { saving?: boolean },
) {
  const container = ensureToastContainer();
  if (options?.saving) {
    container
      .querySelectorAll("[data-saving-toast]")
      .forEach((el) => el.remove());
  }

  const attrs: Record<string, string> = {};
  if (options?.saving) attrs["data-saving-toast"] = "";

  container.insertAdjacentHTML(
    "afterbegin",
    toastItemHtml(type, message, attrs),
  );
  const li = container.firstElementChild as HTMLElement | null;
  if (li) Alpine.initTree(li);
}
