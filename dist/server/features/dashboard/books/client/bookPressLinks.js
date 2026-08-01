import { MAX_BOOK_PRESS_LINKS } from "../pressLinks.js";
function emptyDraft() {
  return { title: "", url: "", quote: "" };
}
function parsePressLinks(raw) {
  try {
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function bookPressLinksAlpineMethods() {
  return {
    pressModalOpen: false,
    pressEditIndex: null,
    pressDraft: emptyDraft(),
    pressModalError: "",
    syncPressLinks(links) {
      const ctx = this;
      ctx.pressLinks = links;
      ctx.form.press_links = JSON.stringify(links);
    },
    openPressModal(index = null) {
      const ctx = this;
      ctx.pressModalError = "";
      ctx.pressEditIndex = index;
      if (index !== null) {
        const existing = ctx.pressLinks[index];
        ctx.pressDraft = {
          title: existing?.title ?? "",
          url: existing?.url ?? "",
          quote: existing?.quote ?? ""
        };
      } else {
        ctx.pressDraft = emptyDraft();
      }
      ctx.pressModalOpen = true;
    },
    closePressModal() {
      const ctx = this;
      ctx.pressModalOpen = false;
      ctx.pressEditIndex = null;
      ctx.pressDraft = emptyDraft();
      ctx.pressModalError = "";
    },
    savePressLink() {
      const ctx = this;
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
      const links = [...ctx.pressLinks];
      const next = {
        title,
        url,
        quote: quote || null
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
    removePressLink(index) {
      const ctx = this;
      const links = [...ctx.pressLinks];
      links.splice(index, 1);
      ctx.syncPressLinks(links);
    },
    pressLinkHost(url) {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch {
        return url;
      }
    }
  };
}
export {
  bookPressLinksAlpineMethods,
  parsePressLinks
};
