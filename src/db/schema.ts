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
  "publisher_reviewed",
  "admin_accepted",
  "admin_rejected",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  acceptsTerms: timestamp("accepts_terms"),
  acceptsNewsletter: timestamp("accepts_newsletter"),
  acceptsEmails: timestamp("accepts_emails"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  creators: many(creators),
  books: many(books),
  follows: many(follows),
  collections: many(collectionItems),
  wishlists: many(wishlists),
  claims: many(creatorClaims),
}));

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
    createdByUserId: uuid("created_by_user_id")
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueOwnerType: [table.ownerUserId, table.type], // enforce one profile per type
  })
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
}));

export const books = pgTable(
  "books",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    specs: text("specs"),
    artistId: uuid("artist_id").references(() => creators.id),
    publisherId: uuid("publisher_id").references(() => creators.id),
    releaseDate: timestamp("release_date"),
    tagline: text("tagline"),
    availabilityStatus: bookAvailabilityStatusEnum(
      "availability_status"
    ).default("available"),
    approvalStatus:
      bookApprovalStatusEnum("approval_status").default("pending"),
    publicationStatus:
      bookPublicationStatusEnum("publication_status").default("draft"),
    coverUrl: text("cover_url"),
    images: text("images").array(),
    tags: text("tags").array(),
    createdByUserId: uuid("created_by_user_id")
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    coverRequiredForPublish: check(
      "cover_required_for_publish",
      sql`${table.coverUrl} IS NOT NULL OR ${table.publicationStatus} = 'draft'`
    ),
  })
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
  images: many(bookImages),
  wishlists: many(wishlists),
  collections: many(collectionItems),
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
        table.targetCreatorId
      ),
    };
  }
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

export const bookImages = pgTable("book_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookId: uuid("book_id")
    .references(() => books.id)
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

export const verificationMethodEnum = pgEnum("verification_method", [
  "website",
  "instagram",
]);

export const creatorClaims = pgTable("creator_claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id")
    .references(() => creators.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  status: creatorClaimStatusEnum("status").notNull().default("pending"), // pending, approved, rejected
  requestedAt: timestamp("requested_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  creatorCreatedByUserId: uuid("creator_created_by_user_id").references(
    () => users.id
  ),
  verificationToken: varchar("token", { length: 255 }).notNull(),
  verificationMethod: verificationMethodEnum("verification_method").default(
    "website"
  ),
  verificationUrl: text("verification_url"), // The website URL to verify
  verificationCode: varchar("verification_code", { length: 10 }), // The code to find on website
  codeExpiresAt: timestamp("code_expires_at"),
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
  creatorCreatedBy: one(users, {
    fields: [creatorClaims.creatorCreatedByUserId],
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
  })
);

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
  }
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
export type VerificationMethod =
  (typeof verificationMethodEnum.enumValues)[number];
export type BookApprovalStatus =
  (typeof bookApprovalStatusEnum.enumValues)[number];
export type BookPublicationStatus =
  (typeof bookPublicationStatusEnum.enumValues)[number];
export type BookAvailabilityStatus =
  (typeof bookAvailabilityStatusEnum.enumValues)[number];
export type CreatorStatus = (typeof creatorStatusEnum.enumValues)[number];
