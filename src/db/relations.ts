import { relations } from "drizzle-orm";
import {
  artistOfTheWeek,
  bookComments,
  bookFairs,
  bookImages,
  bookListItems,
  bookLists,
  bookOfTheDay,
  bookStores,
  bookViews,
  books,
  collectionItems,
  creatorClaims,
  creatorInterviews,
  creatorMilestoneEmails,
  creatorStubOutreachEmails,
  creatorViews,
  creators,
  fairAttendees,
  fairViews,
  follows,
  magazineIssueBooks,
  magazineIssues,
  postLikes,
  posts,
  printQuoteRecipients,
  printQuoteRequests,
  printerBooks,
  printerImages,
  printers,
  publisherOfTheWeek,
  purchaseClicks,
  users,
  wishlists,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  creators: many(creators),
  createdBooks: many(books, { relationName: "bookCreator" }),
  submittedBooks: many(books, { relationName: "bookSubmitter" }),
  follows: many(follows),
  collections: many(collectionItems),
  postLikes: many(postLikes),
  wishlists: many(wishlists),
  bookLists: many(bookLists),
  claims: many(creatorClaims),
  comments: many(bookComments),
  createdFairs: many(bookFairs),
  createdStores: many(bookStores),
  posts: many(posts),
}));

export const creatorInterviewsRelations = relations(
  creatorInterviews,
  ({ one }) => ({
    creator: one(creators, {
      fields: [creatorInterviews.creatorId],
      references: [creators.id],
    }),
    invitedBy: one(users, {
      fields: [creatorInterviews.invitedByUserId],
      references: [users.id],
    }),
    book: one(books, {
      fields: [creatorInterviews.bookId],
      references: [books.id],
    }),
  }),
);

export const creatorsRelations = relations(creators, ({ one, many }) => ({
  owner: one(users, {
    fields: [creators.ownerUserId],
    references: [users.id],
  }),
  booksAsArtist: many(books, {
    relationName: "artistCreator",
  }),
  booksAsPublisher: many(books, {
    relationName: "publisherCreator",
  }),
  interviews: many(creatorInterviews),
  followers: many(follows),
  claims: many(creatorClaims),
  artistOfTheWeekEntries: many(artistOfTheWeek),
  publisherOfTheWeekEntries: many(publisherOfTheWeek),
  fairAttendees: many(fairAttendees),
  milestoneEmails: many(creatorMilestoneEmails),
  stubOutreachEmails: many(creatorStubOutreachEmails),
  views: many(creatorViews),
}));

export const creatorStubOutreachEmailsRelations = relations(
  creatorStubOutreachEmails,
  ({ one }) => ({
    creator: one(creators, {
      fields: [creatorStubOutreachEmails.creatorId],
      references: [creators.id],
    }),
  }),
);

export const booksRelations = relations(books, ({ one, many }) => ({
  artist: one(creators, {
    fields: [books.artistId],
    references: [creators.id],
    relationName: "artistCreator",
  }),
  publisher: one(creators, {
    fields: [books.publisherId],
    references: [creators.id],
    relationName: "publisherCreator",
  }),
  creatorUser: one(users, {
    fields: [books.createdByUserId],
    references: [users.id],
    relationName: "bookCreator",
  }),
  submittedByUser: one(users, {
    fields: [books.submittedByUserId],
    references: [users.id],
    relationName: "bookSubmitter",
  }),
  comments: many(bookComments),
  images: many(bookImages),
  wishlists: many(wishlists),
  bookListItems: many(bookListItems),
  collections: many(collectionItems),
  bookOfTheDay: one(bookOfTheDay),
  purchaseClicks: many(purchaseClicks),
  bookViews: many(bookViews),
  printerBooks: many(printerBooks),
}));

export const creatorMilestoneEmailsRelations = relations(
  creatorMilestoneEmails,
  ({ one }) => ({
    creator: one(creators, {
      fields: [creatorMilestoneEmails.creatorId],
      references: [creators.id],
    }),
    book: one(books, {
      fields: [creatorMilestoneEmails.bookId],
      references: [books.id],
    }),
  }),
);

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerUserId],
    references: [users.id],
  }),

  targetUser: one(users, {
    fields: [follows.targetUserId],
    references: [users.id],
  }),

  targetCreator: one(creators, {
    fields: [follows.targetCreatorId],
    references: [creators.id],
  }),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
}));

export const bookImagesRelations = relations(bookImages, ({ one }) => ({
  book: one(books, {
    fields: [bookImages.bookId],
    references: [books.id],
  }),
}));

export const bookCommentsRelations = relations(bookComments, ({ one }) => ({
  book: one(books, {
    fields: [bookComments.bookId],
    references: [books.id],
  }),
  user: one(users, {
    fields: [bookComments.userId],
    references: [users.id],
  }),
}));

export const creatorClaimsRelations = relations(creatorClaims, ({ one }) => ({
  creator: one(creators, {
    fields: [creatorClaims.creatorId],
    references: [creators.id],
  }),
  user: one(users, {
    fields: [creatorClaims.userId],
    references: [users.id],
  }),
}));

export const collectionItemsRelations = relations(
  collectionItems,
  ({ one }) => ({
    user: one(users, {
      fields: [collectionItems.userId],
      references: [users.id],
    }),
    book: one(books, {
      fields: [collectionItems.bookId],
      references: [books.id],
    }),
  }),
);

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [wishlists.bookId],
    references: [books.id],
  }),
}));

export const bookListsRelations = relations(bookLists, ({ one, many }) => ({
  user: one(users, {
    fields: [bookLists.userId],
    references: [users.id],
  }),
  items: many(bookListItems),
}));

export const bookListItemsRelations = relations(bookListItems, ({ one }) => ({
  list: one(bookLists, {
    fields: [bookListItems.listId],
    references: [bookLists.id],
  }),
  book: one(books, {
    fields: [bookListItems.bookId],
    references: [books.id],
  }),
}));

export const bookOfTheDayRelations = relations(bookOfTheDay, ({ one }) => ({
  book: one(books, {
    fields: [bookOfTheDay.bookId],
    references: [books.id],
  }),
}));

export const artistOfTheWeekRelations = relations(
  artistOfTheWeek,
  ({ one }) => ({
    creator: one(creators, {
      fields: [artistOfTheWeek.creatorId],
      references: [creators.id],
    }),
  }),
);

export const publisherOfTheWeekRelations = relations(
  publisherOfTheWeek,
  ({ one }) => ({
    creator: one(creators, {
      fields: [publisherOfTheWeek.creatorId],
      references: [creators.id],
    }),
  }),
);

export const purchaseClicksRelations = relations(purchaseClicks, ({ one }) => ({
  book: one(books, {
    fields: [purchaseClicks.bookId],
    references: [books.id],
  }),
  user: one(users, {
    fields: [purchaseClicks.userId],
    references: [users.id],
  }),
}));

export const bookViewsRelations = relations(bookViews, ({ one }) => ({
  book: one(books, {
    fields: [bookViews.bookId],
    references: [books.id],
  }),
  user: one(users, {
    fields: [bookViews.userId],
    references: [users.id],
  }),
}));

export const creatorViewsRelations = relations(creatorViews, ({ one }) => ({
  creator: one(creators, {
    fields: [creatorViews.creatorId],
    references: [creators.id],
  }),
  user: one(users, {
    fields: [creatorViews.userId],
    references: [users.id],
  }),
}));

export const bookFairsRelations = relations(bookFairs, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [bookFairs.createdByUserId],
    references: [users.id],
  }),
  attendees: many(fairAttendees),
  views: many(fairViews),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  likes: many(postLikes),
}));

export const fairAttendeesRelations = relations(fairAttendees, ({ one }) => ({
  fair: one(bookFairs, {
    fields: [fairAttendees.fairId],
    references: [bookFairs.id],
  }),
  creator: one(creators, {
    fields: [fairAttendees.creatorId],
    references: [creators.id],
  }),
}));

export const fairViewsRelations = relations(fairViews, ({ one }) => ({
  fair: one(bookFairs, {
    fields: [fairViews.fairId],
    references: [bookFairs.id],
  }),
  user: one(users, {
    fields: [fairViews.userId],
    references: [users.id],
  }),
}));

export const printersRelations = relations(printers, ({ many }) => ({
  images: many(printerImages),
  printedBooks: many(printerBooks),
  recipients: many(printQuoteRecipients),
}));

export const printerBooksRelations = relations(printerBooks, ({ one }) => ({
  printer: one(printers, {
    fields: [printerBooks.printerId],
    references: [printers.id],
  }),
  book: one(books, {
    fields: [printerBooks.bookId],
    references: [books.id],
  }),
}));

export const printerImagesRelations = relations(printerImages, ({ one }) => ({
  printer: one(printers, {
    fields: [printerImages.printerId],
    references: [printers.id],
  }),
}));

export const printQuoteRequestsRelations = relations(
  printQuoteRequests,
  ({ one, many }) => ({
    user: one(users, {
      fields: [printQuoteRequests.userId],
      references: [users.id],
    }),
    recipients: many(printQuoteRecipients),
  }),
);

export const printQuoteRecipientsRelations = relations(
  printQuoteRecipients,
  ({ one }) => ({
    request: one(printQuoteRequests, {
      fields: [printQuoteRecipients.requestId],
      references: [printQuoteRequests.id],
    }),
    printer: one(printers, {
      fields: [printQuoteRecipients.printerId],
      references: [printers.id],
    }),
  }),
);

export const bookStoresRelations = relations(bookStores, ({ one }) => ({
  createdBy: one(users, {
    fields: [bookStores.createdByUserId],
    references: [users.id],
  }),
}));

export const magazineIssuesRelations = relations(
  magazineIssues,
  ({ one, many }) => ({
    createdByUser: one(users, {
      fields: [magazineIssues.createdByUserId],
      references: [users.id],
    }),
    books: many(magazineIssueBooks),
  }),
);

export const magazineIssueBooksRelations = relations(
  magazineIssueBooks,
  ({ one }) => ({
    issue: one(magazineIssues, {
      fields: [magazineIssueBooks.issueId],
      references: [magazineIssues.id],
    }),
    book: one(books, {
      fields: [magazineIssueBooks.bookId],
      references: [books.id],
    }),
  }),
);
