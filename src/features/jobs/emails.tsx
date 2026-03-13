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
