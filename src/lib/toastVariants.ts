export const alertVariants = {
  info: {
    border: "border-sky-700",
    bg: "bg-info/10",
    iconWrapper: "bg-sky-700/15 text-sky-700",
    class: "text-info",
    title: "Info",
  },
  success: {
    border: "border-green-700",
    bg: "bg-success/5",
    iconWrapper: "bg-green-700/15 text-green-700",
    class: "text-success",
    title: "Success",
  },
  warning: {
    border: "border-amber-600",
    bg: "bg-warning/10",
    iconWrapper: "bg-amber-600/15 text-amber-600",
    class: "text-warning",
    title: "Warning",
  },
  danger: {
    border: "border-red-700",
    bg: "bg-danger/10",
    iconWrapper: "bg-red-700/15 text-red-700",
    class: "text-danger",
    title: "Error",
  },
  neutral: {
    border: "border-slate-400",
    bg: "bg-slate-500/10 ",
    iconWrapper: "bg-slate-500/15 text-slate-600 ",
    class: "text-slate-700",
    title: "Note",
  },
} as const;

export type AlertType = keyof typeof alertVariants;

export const toastIconSvgs: Record<AlertType, string> = {
  info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-6"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-3a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>`,
  success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-6"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z" clip-rule="evenodd"/></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-6"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>`,
  danger: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-6"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clip-rule="evenodd"/></svg>`,
  neutral: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-6" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-3.5-8.75a.75.75 0 0 0 0 1.5h7a.75.75 0 0 0 0-1.5h-7Z" clip-rule="evenodd"/></svg>`,
};
