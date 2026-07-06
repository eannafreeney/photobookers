import { alertVariants, toastIconSvgs } from "./toastVariants.js";
const EMPTY_TOAST_CONTAINER_HTML = '<ul x-sync id="toast" x-merge="prepend" role="status" class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 "></ul>';
const dismissButtonHtml = `<button class="ml-auto cursor-pointer" x-on:click="dismiss()"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" fill="none" stroke-width="2.5" class="size-4 shrink-0"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg></button>`;
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function toastItemHtml(type, message, attrs = {}) {
  const variant = alertVariants[type];
  const attrString = Object.entries({
    "x-data": "alert",
    "x-show": "show",
    "x-transition.duration.500ms": "",
    ...attrs
  }).map(([key, value]) => `${key}="${value}"`).join(" ");
  return `<li ${attrString} class="overflow-hidden rounded-sm border bg-surface text-on-surface ${variant.border}"><div class="flex w-full items-center gap-2 p-2 ${variant.bg}"><div class="rounded-full p-1 ${variant.iconWrapper}">${toastIconSvgs[type]}</div><p class="text-xs font-medium sm:text-sm">${escapeHtml(message)}</p>${dismissButtonHtml}</div></li>`;
}
export {
  EMPTY_TOAST_CONTAINER_HTML,
  toastItemHtml
};
