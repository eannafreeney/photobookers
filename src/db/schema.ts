import {
  pgTable,
  text,
  varchar,
  timestamp,
  uuid,
  pgEnum,
  integer,
  primaryKey,
  unique,
  check,
  boolean,
} from "drizzle-orm/pg-core";
import {
  InferSelectModel,
  InferInsertModel,
  relations,
  sql,
} from "drizzle-orm";

export const bookAvailabilityStatusEnum = pgEnum("book_availability_status", [
  "sold_out",
  "unavailable",
  "available",
]);

export const bookApprovalStatusEnum = pgEnum("book_approval_status", [
  "pending",
  "approved",
  "rejected",
]);

export const bookPublicationStatusEnum = pgEnum("book_publication_status", [
  "published",
  "draft",
]);
export const followTargetEnum = pgEnum("follow_target", ["user", "creator"]);
export const creatorTypeEnum = pgEnum("creator_type", ["publisher", "artist"]);
export const creatorStatusEnum = pgEnum("creator_status", [
  "stub",
  "verified",
  "suspended",
  "deleted",
]);
export const creatorClaimStatusEnum = pgEnum("creator_claim_status", [
  "pending",
  "pending_admin_review",
  "approved",
  "rejected",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  profileImageUrl: text("profile_image_url"),
  acceptsTerms: timestamp("accepts_terms"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  mustResetPassword: boolean("must_reset_password").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  creators: many(creators),
  books: many(books),
  follows: many(follows),
  collections: many(collectionItems),
  likes: many(likes),
  wishlists: many(wishlists),
  claims: many(creatorClaims),
  comments: many(bookComments),
}));

export const adminNotifications = pgTable("admin_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type", { length: 64 }).notNull(), // e.g. "book_published"
  title: text("title").notNull(),
  body: text("body").notNull(),
  targetUrl: text("target_url"),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creators = pgTable(
  "creators",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug").notNull().unique(),
    ownerUserId: uuid("owner_user_id").references(() => users.id),
    type: creatorTypeEnum("type").notNull(),
    displayName: text("display_name").notNull(),
    tagline: text("tagline"),
    bio: text("bio"),
    status: creatorStatusEnum("status").default("stub"),
    coverUrl: text("cover_url"),
    city: varchar("city"),
    country: varchar("country"),
    facebook: text("facebook"),
    twitter: text("twitter"),
    instagram: text("instagram"),
    website: text("website"),
    sortName: varchar("sort_name", { length: 255 }),
    email: text("email"),
    welcomeEmailSent: timestamp("welcome_email_sent"),
    createdByUserId: uuid("created_by_user_id")
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueOwnerType: [table.ownerUserId, table.type], // enforce one profile per type
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
  followers: many(follows),
  claims: many(creatorClaims),
  artistOfTheWeekEntries: many(artistOfTheWeek),
  publisherOfTheWeekEntries: many(publisherOfTheWeek),
  messages: many(creatorMessages),
}));

export const books = pgTable(
  "books",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    artistId: uuid("artist_id").references(() => creators.id),
    publisherId: uuid("publisher_id").references(() => creators.id),
    releaseDate: timestamp("release_date"),
    availabilityStatus: bookAvailabilityStatusEnum("availability_status")
      .default("available")
      .notNull(),
    approvalStatus:
      bookApprovalStatusEnum("approval_status").default("pending"),
    publicationStatus:
      bookPublicationStatusEnum("publication_status").default("draft"),
    coverUrl: text("cover_url"),
    purchaseLink: text("purchase_link"),
    images: text("images").array(),
    tags: text("tags").array(),
    createdByUserId: uuid("created_by_user_id")
      .references(() => users.id)
      .notNull(),
    notifyFollowersOnRelease: boolean("notify_followers_on_release")
      .default(false)
      .notNull(),
    notifyFollowersScheduledDate: timestamp("notify_followers_scheduled_date"),
    notifyFollowersSentAt: timestamp("notify_followers_sent_at"),
    notifyFollowersCreatorId: uuid("notify_followers_creator_id").references(
      () => creators.id,
    ),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    coverRequiredForPublish: check(
      "cover_required_for_publish",
      sql`${table.coverUrl} IS NOT NULL OR ${table.publicationStatus} = 'draft'`,
    ),
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
  }),
  comments: many(bookComments),
  images: many(bookImages),
  likes: many(likes),
  wishlists: many(wishlists),
  collections: many(collectionItems),
  bookOfTheDay: one(bookOfTheDay),
  bookOfTheWeekEntry: one(bookOfTheWeek),
  featuredBooksOfTheWeekEntry: one(featuredBooksOfTheWeek),
}));

export const follows = pgTable(
  "follows",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    followerUserId: uuid("follower_user_id")
      .notNull()
      .references(() => users.id),
    targetType: followTargetEnum("target_type").notNull(),
    targetUserId: uuid("target_user_id").references(() => users.id),
    targetCreatorId: uuid("target_creator_id").references(() => creators.id),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      userFollowUnique: unique("user_follow_unique").on(
        table.followerUserId,
        table.targetUserId,
        table.targetCreatorId,
      ),
    };
  },
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

export const creatorMessages = pgTable("creator_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  imageUrls: text("image_urls").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
export const creatorMessagesRelations = relations(
  creatorMessages,
  ({ one }) => ({
    creator: one(creators, {
      fields: [creatorMessages.creatorId],
      references: [creators.id],
    }),
  }),
);

export const bookImages = pgTable("book_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookId: uuid("book_id")
    .references(() => books.id, { onDelete: "cascade" })
    .notNull(),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookImagesRelations = relations(bookImages, ({ one }) => ({
  book: one(books, {
    fields: [bookImages.bookId],
    references: [books.id],
  }),
}));

export const bookComments = pgTable("book_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookId: uuid("book_id")
    .references(() => books.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

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

export const creatorClaims = pgTable("creator_claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id")
    .references(() => creators.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  status: creatorClaimStatusEnum("status").notNull().default("pending"), // pending, approved, rejected
  requestedAt: timestamp("requested_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  verificationUrl: text("verification_url"), // The website URL to verify
});

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

export const collectionItems = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  bookId: uuid("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

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

export const likes = pgTable(
  "likes",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey(table.userId, table.bookId),
    };
  },
);

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  book: one(books, {
    fields: [likes.bookId],
    references: [books.id],
  }),
}));

export const wishlists = pgTable(
  "wishlists",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      pk: primaryKey(table.userId, table.bookId), // prevents duplicates
    };
  },
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

// Add to imports at top if not already there - you have timestamp, uuid, text, unique

export const bookOfTheDay = pgTable(
  "book_of_the_day",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: timestamp("date", { mode: "date" }).notNull(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueDate: unique("book_of_the_day_date_unique").on(table.date),
    uniqueBook: unique("book_of_the_day_book_unique").on(table.bookId),
  }),
);

export const bookOfTheDayRelations = relations(bookOfTheDay, ({ one }) => ({
  book: one(books, {
    fields: [bookOfTheDay.bookId],
    references: [books.id],
  }),
}));

export const bookOfTheWeek = pgTable(
  "book_of_the_week",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weekStart: timestamp("week_start", { mode: "date" }).notNull(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueWeek: unique("book_of_the_week_week_unique").on(table.weekStart),
    uniqueBook: unique("book_of_the_week_book_unique").on(table.bookId),
  }),
);

export const bookOfTheWeekRelations = relations(bookOfTheWeek, ({ one }) => ({
  book: one(books, {
    fields: [bookOfTheWeek.bookId],
    references: [books.id],
  }),
}));

// New table: 5 featured books per week; each book can only be featured once ever
export const featuredBooksOfTheWeek = pgTable(
  "featured_books_of_the_week",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weekStart: timestamp("week_start", { mode: "date" }).notNull(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    position: integer("position").notNull(), // 1-5
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueWeekPosition: unique("featured_books_week_position_unique").on(
      table.weekStart,
      table.position,
    ),
    uniqueBook: unique("featured_books_book_unique").on(table.bookId), // book only featured once
  }),
);

export const featuredBooksOfTheWeekRelations = relations(
  featuredBooksOfTheWeek,
  ({ one }) => ({
    book: one(books, {
      fields: [featuredBooksOfTheWeek.bookId],
      references: [books.id],
    }),
  }),
);

// Artist of the week: one per week, optional text
export const artistOfTheWeek = pgTable(
  "artist_of_the_week",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weekStart: timestamp("week_start", { mode: "date" }).notNull(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    text: text("text").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueWeek: unique("artist_of_the_week_week_unique").on(table.weekStart),
  }),
);

export const artistOfTheWeekRelations = relations(
  artistOfTheWeek,
  ({ one }) => ({
    creator: one(creators, {
      fields: [artistOfTheWeek.creatorId],
      references: [creators.id],
    }),
  }),
);

// Publisher of the week: one per week, optional text
export const publisherOfTheWeek = pgTable(
  "publisher_of_the_week",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weekStart: timestamp("week_start", { mode: "date" }).notNull(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    text: text("text").notNull().default(""),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueWeek: unique("publisher_of_the_week_week_unique").on(table.weekStart),
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

// Infer types from tables
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Creator = InferSelectModel<typeof creators>;
export type NewCreator = InferInsertModel<typeof creators>;
export type UpdateCreator = Partial<InferInsertModel<typeof creators>>;

export type Book = InferSelectModel<typeof books>;
export type NewBook = InferInsertModel<typeof books>;
export type UpdateBook = Partial<InferInsertModel<typeof books>>;

export type Follow = InferSelectModel<typeof follows>;
export type NewFollow = InferInsertModel<typeof follows>;

export type CollectionItem = InferSelectModel<typeof collectionItems>;
export type NewCollectionItem = InferInsertModel<typeof collectionItems>;

export type Like = InferSelectModel<typeof likes>;
export type NewLike = InferInsertModel<typeof likes>;

export type BookImage = InferSelectModel<typeof bookImages>;
export type NewBookImage = InferInsertModel<typeof bookImages>;

export type CreatorClaim = InferSelectModel<typeof creatorClaims>;
export type NewCreatorClaim = InferInsertModel<typeof creatorClaims>;

export type Wishlist = InferSelectModel<typeof wishlists>;
export type NewWishlist = InferInsertModel<typeof wishlists>;

// Infer enum types
export type CreatorType = (typeof creatorTypeEnum.enumValues)[number];
export type FollowTarget = (typeof followTargetEnum.enumValues)[number];
export type CreatorClaimStatus =
  (typeof creatorClaimStatusEnum.enumValues)[number];

export type BookApprovalStatus =
  (typeof bookApprovalStatusEnum.enumValues)[number];
export type BookPublicationStatus =
  (typeof bookPublicationStatusEnum.enumValues)[number];
export type BookAvailabilityStatus =
  (typeof bookAvailabilityStatusEnum.enumValues)[number];
export type CreatorStatus = (typeof creatorStatusEnum.enumValues)[number];

export type BookOfTheDay = InferSelectModel<typeof bookOfTheDay>;
export type NewBookOfTheDay = InferInsertModel<typeof bookOfTheDay>;

export type BookOfTheWeek = InferSelectModel<typeof bookOfTheWeek>;
export type NewBookOfTheWeek = InferInsertModel<typeof bookOfTheWeek>;

export type FeaturedBookOfTheWeek = InferSelectModel<
  typeof featuredBooksOfTheWeek
>;
export type NewFeaturedBookOfTheWeek = InferInsertModel<
  typeof featuredBooksOfTheWeek
>;
export type ArtistOfTheWeek = InferSelectModel<typeof artistOfTheWeek>;
export type NewArtistOfTheWeek = InferInsertModel<typeof artistOfTheWeek>;
export type PublisherOfTheWeek = InferSelectModel<typeof publisherOfTheWeek>;
export type NewPublisherOfTheWeek = InferInsertModel<typeof publisherOfTheWeek>;

export type CreatorMessage = InferSelectModel<typeof creatorMessages>;
export type NewCreatorMessage = InferInsertModel<typeof creatorMessages>;

export type BookComment = InferSelectModel<typeof bookComments>;
export type NewBookComment = InferInsertModel<typeof bookComments>;

export type AdminNotification = InferSelectModel<typeof adminNotifications>;
export type NewAdminNotification = InferInsertModel<typeof adminNotifications>;
