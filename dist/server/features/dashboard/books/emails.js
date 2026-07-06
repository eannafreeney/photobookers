const generateBookNotificationEmail = (book, creator) => {
  return `
    <h2>New book created</h2>
    <p>A new book has been published.</p>
    <p>Title: ${book.title}</p>
    <p>Creator: ${creator.displayName}</p>
    
    <p><a href="${process.env.SITE_URL ?? "https://photobookers.com"}/books/${book.slug}">View the book</a></p>
  `;
};
export {
  generateBookNotificationEmail
};
