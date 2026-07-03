export function buildNewBookNotificationHtml(
  creatorDisplayName: string,
  bookTitle: string,
  bookSlug: string,
  bookCoverUrl: string | null,
): string {
  const link = `${process.env.SITE_URL ?? "https://photobookers.com"}/books/${bookSlug}`;
  return `
      <h2>New book from ${creatorDisplayName}</h2>
      <p>${creatorDisplayName} has released a new book: <strong>${bookTitle}</strong>.</p>
      ${bookCoverUrl ? `<img src="${bookCoverUrl}" alt="${bookTitle}" width="300" />` : ""}
      <p><a href="${link}">View the book</a></p>
    `;
}

export function truncatePostBody(body: string, maxLen = 200): string {
  const trimmed = body.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen).trimEnd()}…`;
}

export function buildCreatorPostNotificationHtml(
  creatorDisplayName: string,
  creatorSlug: string,
  postBody: string,
  imageUrl: string | null,
): string {
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
