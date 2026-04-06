import { Book, Creator } from "../../../../db/schema";

export const generateBOTWNotificationEmail = (
  creator: { displayName: string; email: string },
  book: Book,
) => {
  return `
    <h2>Book of the Week</h2>
    <p>Your book has been selected as the Book of the Week.</p>
    <p>Creator: ${creator.displayName}</p>
    <p>Title: ${book.title}</p>
    <p><a href="${process.env.SITE_URL ?? "https://photobookers.com"}/dashboard/admin/planner/book-of-the-week?week=${week}">View the book</a></p>
  `;
};
