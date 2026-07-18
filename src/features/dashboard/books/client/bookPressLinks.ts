import type { BookPressLink } from "../../../../db/schema";
import { MAX_BOOK_PRESS_LINKS } from "../pressLinks";

type PressDraft = {
  title: string;
  url: string;
  quote: string;
};

function emptyDraft(): PressDraft {
  return { title: "", url: "", quote: "" };
}

export function parsePressLinks(raw: string | undefined): BookPressLink[] {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Shared Alpine methods for bookForm / bookFormAdmin press-links editor.
 * Expects `this.pressLinks` (array) and `this.form.press_links` (JSON string).
 * Callers must init `pressLinks` from form values — getters don't survive object spread.
 */
export function bookPressLinksAlpineMethods() {
  return {
    pressModalOpen: false,
    pressEditIndex: null as number | null,
    pressDraft: emptyDraft(),
    pressModalError: "",

    syncPressLinks(links: BookPressLink[]) {
      const ctx = this as any;
      ctx.pressLinks = links;
      ctx.form.press_links = JSON.stringify(links);
    },

    openPressModal(index: number | null = null) {
      const ctx = this as any;
      ctx.pressModalError = "";
      ctx.pressEditIndex = index;
      if (index !== null) {
        const existing = (ctx.pressLinks as BookPressLink[])[index];
        ctx.pressDraft = {
          title: existing?.title ?? "",
          url: existing?.url ?? "",
          quote: existing?.quote ?? "",
        };
      } else {
        ctx.pressDraft = emptyDraft();
      }
      ctx.pressModalOpen = true;
    },

    closePressModal() {
      const ctx = this as any;
      ctx.pressModalOpen = false;
      ctx.pressEditIndex = null;
      ctx.pressDraft = emptyDraft();
      ctx.pressModalError = "";
    },

    savePressLink() {
      const ctx = this as any;
      const title = ctx.pressDraft.title.trim();
      const url = ctx.pressDraft.url.trim();
      const quote = ctx.pressDraft.quote.trim();

      if (!title) {
        ctx.pressModalError = "Title is required";
        return;
      }
      if (!url) {
        ctx.pressModalError = "URL is required";
        return;
      }
      try {
        new URL(url);
      } catch {
        ctx.pressModalError = "Enter a valid URL (including https://)";
        return;
      }

      const links = [...(ctx.pressLinks as BookPressLink[])];
      const next: BookPressLink = {
        title,
        url,
        quote: quote || null,
      };

      if (ctx.pressEditIndex === null) {
        if (links.length >= MAX_BOOK_PRESS_LINKS) {
          ctx.pressModalError = `You can add up to ${MAX_BOOK_PRESS_LINKS} press links`;
          return;
        }
        links.push(next);
      } else {
        links[ctx.pressEditIndex] = next;
      }

      ctx.syncPressLinks(links);
      ctx.closePressModal();
    },

    removePressLink(index: number) {
      const ctx = this as any;
      const links = [...(ctx.pressLinks as BookPressLink[])];
      links.splice(index, 1);
      ctx.syncPressLinks(links);
    },

    pressLinkHost(url: string): string {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch {
        return url;
      }
    },
  };
}
