const bookSortDate = (book) => book.releaseDate ?? book.createdAt ?? /* @__PURE__ */ new Date(0);
const messageSortDate = (message) => message.createdAt ?? /* @__PURE__ */ new Date(0);
const postSortDate = (post) => post.createdAt ?? /* @__PURE__ */ new Date(0);
const kindRank = {
  message: 0,
  post: 1,
  book: 2
};
const itemId = (item) => item.kind === "book" ? item.book.id : item.kind === "message" ? item.message.id : item.post.id;
const compareFeedItems = (a, b) => {
  const byDate = b.sortDate.getTime() - a.sortDate.getTime();
  if (byDate !== 0) return byDate;
  if (a.kind !== b.kind) return kindRank[a.kind] - kindRank[b.kind];
  return itemId(b).localeCompare(itemId(a));
};
const mergeFeedItems = (books, messages, posts, page, limit) => {
  const items = [
    ...books.map(
      (book) => ({
        kind: "book",
        sortDate: bookSortDate(book),
        book
      })
    ),
    ...messages.map(
      (message) => ({
        kind: "message",
        sortDate: messageSortDate(message),
        message
      })
    ),
    ...posts.map(
      (post) => ({
        kind: "post",
        sortDate: postSortDate(post),
        post
      })
    )
  ];
  items.sort(compareFeedItems);
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
};
export {
  bookSortDate,
  mergeFeedItems,
  messageSortDate,
  postSortDate
};
