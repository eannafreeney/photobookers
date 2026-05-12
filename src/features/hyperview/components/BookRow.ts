import {
  view,
  text,
  item,
  image,
  behavior,
  when,
} from "../../../lib/hxml-components";
import type { BookCardResult } from "../../../constants/queries";

export function bookRow(book: BookCardResult, baseUrl: string): string {
  const subtitle =
    book.artist?.displayName ?? book.publisher?.displayName ?? "";
  const detailUrl = `${baseUrl}/hyperview/books/${book.slug}/tab/book`;

  return item(
    { key: book.id, style: "item" },
    behavior({ trigger: "press", action: "push", href: detailUrl }),
    view(
      { style: "item-inner" },
      book.coverUrl
        ? image({ style: "cover", source: book.coverUrl })
        : view({ style: "cover-placeholder" }),
      view(
        { style: "item-text" },
        text({ style: "item-title" }, book.title),
        when(subtitle, text({ style: "item-subtitle" }, subtitle)),
      ),
      text({ style: "chevron" }, "›"),
    ),
  );
}
