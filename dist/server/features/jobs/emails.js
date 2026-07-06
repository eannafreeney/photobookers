function buildNewBookNotificationHtml(creatorDisplayName, bookTitle, bookSlug, bookCoverUrl) {
  const link = `${process.env.SITE_URL ?? "https://photobookers.com"}/books/${bookSlug}`;
  return `
      <h2>New book from ${creatorDisplayName}</h2>
      <p>${creatorDisplayName} has released a new book: <strong>${bookTitle}</strong>.</p>
      ${bookCoverUrl ? `<img src="${bookCoverUrl}" alt="${bookTitle}" width="300" />` : ""}
      <p><a href="${link}">View the book</a></p>
    `;
}
function truncatePostBody(body, maxLen = 200) {
  const trimmed = body.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen).trimEnd()}\u2026`;
}
function buildCreatorPostNotificationHtml(creatorDisplayName, creatorSlug, postBody, imageUrl) {
  const link = `${process.env.SITE_URL ?? "https://photobookers.com"}/creators/${creatorSlug}`;
  const preview = truncatePostBody(postBody);
  return `
      <h2>New post from ${creatorDisplayName}</h2>
      <p>${creatorDisplayName} shared an update on Photobookers:</p>
      <blockquote style="margin: 1em 0; padding-left: 1em; border-left: 3px solid #ccc;">${preview}</blockquote>
      ${imageUrl ? `<img src="${imageUrl}" alt="Post image" width="300" />` : ""}
      <p><a href="${link}">Read on Photobookers</a></p>
    `;
}
export {
  buildCreatorPostNotificationHtml,
  buildNewBookNotificationHtml,
  truncatePostBody
};
