import { Book, Creator } from "../../../db/schema";

export const generateBookNotificationEmail = (book: Book, creator: Creator) => {
  return `
    <h2>New book created</h2>
    <p>A new book has been published.</p>
    <p>Title: ${book.title}</p>
    <p>Creator: ${creator.displayName}</p>
    
    <p><a href="${process.env.SITE_URL ?? "https://photobookers.com"}/books/${book.slug}">View the book</a></p>
  `;
};
