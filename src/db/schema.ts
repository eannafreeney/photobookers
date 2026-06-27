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
  jsonb,
  index,
  doublePrecision,
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

export const creatorInterviewStatusEnum = pgEnum("creator_interview_status", [
  "sent",
  "completed",
  "expired",
  "published",
]);

export const interviewTypeEnum = pgEnum("interview_type", [
  "introduction",
  "book",
]);
export const newsletterCampaignStatusEnum = pgEnum(
  "newsletter_campaign_status",
  ["draft", "approved", "scheduled", "sent", "failed"],
);

export const purchaseClickSourceEnum = pgEnum("purchase_click_source", [
  "web",
  "hyperview",
]);

export const bookViewSourceEnum = pgEnum("book_view_source", [
  "web",
  "hyperview",
]);

export const fairViewSourceEnum = pgEnum("fair_view_source", [
  "web",
  "hyperview",
]);

export const bookFairStatusEnum = pgEnum("book_fair_status", [
  "draft",
  "published",
  "cancelled",
]);

export const bookFairApprovalStatusEnum = pgEnum("book_fair_approval_status", [
  "pending",
  "approved",
  "rejected",
]);

export const bookFairListingTierEnum = pgEnum("book_fair_listing_tier", [
  "free",
  "promoted",
]);

export const bookStoreStatusEnum = pgEnum("book_store_status", [
  "draft",
  "published",
]);

export const bookStoreApprovalStatusEnum = pgEnum("book_store_approval_status", [
  "pending",
  "approved",
  "rejected",
]);

export const fairAttendeeStatusEnum = pgEnum("fair_attendee_status", [
  "pending",
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  createdFairs: many(bookFairs),
  createdStores: many(bookStores),
}));

export const creatorInterviews = pgTable("creator_interviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id")
    .notNull()
    .references(() => creators.id, { onDelete: "cascade" }),
  creatorSlug: varchar("creator_slug", { length: 255 }).notNull(),
  interviewType: interviewTypeEnum("interview_type")
    .notNull()
    .default("introduction"),
  bookId: uuid("book_id").references(() => books.id, { onDelete: "set null" }),
  recipientEmail: text("recipient_email").notNull(),
  inviteToken: varchar("invite_token", { length: 255 }).notNull().unique(),
  invitedByUserId: uuid("invited_by_user_id").references(() => users.id),
  status: creatorInterviewStatusEnum("status").notNull().default("sent"),
  invitedAt: timestamp("invited_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
  answers: jsonb("answers").$type<{
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    q5: string;
  }>(),
  promoImageUrl: text("promo_image_url"),
});

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
    verifiedAt: timestamp("verified_at"),
    coverUrl: text("cover_url"),
    bannerUrl: text("banner_url"),
    city: varchar("city"),
    country: varchar("country"),
    facebook: text("facebook"),
    twitter: text("twitter"),
    instagram: text("instagram"),
    website: text("website"),
    sortName: varchar("sort_name", { length: 255 }),
    email: text("email"),
    welcomeEmailSent: timestamp("welcome_email_sent"),
    interviewEmailSent: timestamp("interview_email_sent"),
    analyticsDigestSentForMonth: varchar("analytics_digest_sent_for_month", {
      length: 7,
    }),
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
  interviews: many(creatorInterviews),
  followers: many(follows),
  claims: many(creatorClaims),
  artistOfTheWeekEntries: many(artistOfTheWeek),
  publisherOfTheWeekEntries: many(publisherOfTheWeek),
  messages: many(creatorMessages),
  fairAttendees: many(fairAttendees),
  milestoneEmails: many(creatorMilestoneEmails),
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
    sortOrder: integer("sort_order"),
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
  purchaseClicks: many(purchaseClicks),
  bookViews: many(bookViews),
}));

export const creatorMilestoneEmails = pgTable(
  "creator_milestone_emails",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    milestone: varchar("milestone", { length: 64 }).notNull(),
    bookId: uuid("book_id").references(() => books.id, { onDelete: "set null" }),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueCreatorMilestone: unique("creator_milestone_emails_creator_milestone").on(
      table.creatorId,
      table.milestone,
    ),
  }),
);

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

export const bookOfTheDay = pgTable(
  "book_of_the_day",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: timestamp("date", { mode: "date" }).notNull(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    artistEmailSentAt: timestamp("artist_email_sent_at"),
    publisherEmailSentAt: timestamp("publisher_email_sent_at"),
    artistFeatureDayEmailSentAt: timestamp("artist_feature_day_email_sent_at"),
    publisherFeatureDayEmailSentAt: timestamp(
      "publisher_feature_day_email_sent_at",
    ),
    instagramImageUrl: text("instagram_image_url"),
    instagramCaption: text("instagram_caption"),
    instagramPreparedAt: timestamp("instagram_prepared_at"),
    instagramBufferPostId: text("instagram_buffer_post_id"),
    instagramQueuedAt: timestamp("instagram_queued_at"),
    instagramError: text("instagram_error"),
    instagramStoryBufferPostId: text("instagram_story_buffer_post_id"),
    instagramStoryQueuedAt: timestamp("instagram_story_queued_at"),
    instagramStoryError: text("instagram_story_error"),
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

// Artist of the week: one per week, optional text
export const artistOfTheWeek = pgTable(
  "artist_of_the_week",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weekStart: timestamp("week_start", { mode: "date" }).notNull(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    emailSentAt: timestamp("email_sent_at"),
    instagramImageUrl: text("instagram_image_url"),
    instagramCaption: text("instagram_caption"),
    instagramPreparedAt: timestamp("instagram_prepared_at"),
    instagramBufferPostId: text("instagram_buffer_post_id"),
    instagramQueuedAt: timestamp("instagram_queued_at"),
    instagramError: text("instagram_error"),
    instagramStoryBufferPostId: text("instagram_story_buffer_post_id"),
    instagramStoryQueuedAt: timestamp("instagram_story_queued_at"),
    instagramStoryError: text("instagram_story_error"),
    interviewReminderSentAt: timestamp("interview_reminder_sent_at"),
    featureDayEmailSentAt: timestamp("feature_day_email_sent_at"),
    relatedNotifySentAt: timestamp("related_notify_sent_at"),
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
    emailSentAt: timestamp("email_sent_at"),
    instagramImageUrl: text("instagram_image_url"),
    instagramCaption: text("instagram_caption"),
    instagramPreparedAt: timestamp("instagram_prepared_at"),
    instagramBufferPostId: text("instagram_buffer_post_id"),
    instagramQueuedAt: timestamp("instagram_queued_at"),
    instagramError: text("instagram_error"),
    instagramStoryBufferPostId: text("instagram_story_buffer_post_id"),
    instagramStoryQueuedAt: timestamp("instagram_story_queued_at"),
    instagramStoryError: text("instagram_story_error"),
    interviewReminderSentAt: timestamp("interview_reminder_sent_at"),
    featureDayEmailSentAt: timestamp("feature_day_email_sent_at"),
    relatedNotifySentAt: timestamp("related_notify_sent_at"),
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

export const newsletterCampaigns = pgTable(
  "newsletter_campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weekStart: timestamp("week_start", { mode: "date" }).notNull(),
    weekEnd: timestamp("week_end", { mode: "date" }).notNull(),
    status: newsletterCampaignStatusEnum("status").notNull().default("draft"),
    templateKey: varchar("template_key", { length: 128 })
      .notNull()
      .default("weekly_botd_v1"),
    templateVersion: integer("template_version").notNull().default(1),
    subject: text("subject").notNull(),
    introText: text("intro_text").notNull(),
    outroText: text("outro_text").notNull(),
    ctaText: text("cta_text").notNull(),
    generatedContent: jsonb("generated_content").$type<{
      generatedAt: string;
      items: Array<{
        date: string;
        bookId: string;
        bookSlug: string;
        title: string;
        coverUrl: string | null;
        artistName: string | null;
        artistSlug: string | null;
        publisherName: string | null;
        publisherSlug: string | null;
      }>;
      artistOfTheWeek?: {
        displayName: string;
        slug: string;
        coverUrl: string | null;
        tagline?: string | null;
        location?: string | null;
      } | null;
      publisherOfTheWeek?: {
        displayName: string;
        slug: string;
        coverUrl: string | null;
        tagline?: string | null;
        location?: string | null;
      } | null;
      newMembers?: Array<{
        displayName: string;
        slug: string;
        type: "artist" | "publisher";
        coverUrl: string | null;
        tagline: string | null;
        location: string | null;
      }>;
      upcomingFair?: {
        name: string;
        slug: string;
        coverUrl: string | null;
        venue: string | null;
        location: string | null;
        startDate: string;
        endDate: string;
      } | null;
    }>(),
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueWeek: unique("newsletter_campaigns_week_start_unique").on(
      table.weekStart,
    ),
  }),
);

export const purchaseClicks = pgTable(
  "purchase_clicks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: uuid("book_id")
      .references(() => books.id)
      .notNull(),
    userId: uuid("user_id").references(() => users.id),
    source: purchaseClickSourceEnum("source").notNull().default("web"),
    referer: text("referer"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    bookIdIdx: index("purchase_clicks_book_id_idx").on(table.bookId),
    createdAtIdx: index("purchase_clicks_created_at_idx").on(table.createdAt),
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

export const bookViews = pgTable(
  "book_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: uuid("book_id")
      .references(() => books.id)
      .notNull(),
    userId: uuid("user_id").references(() => users.id),
    source: bookViewSourceEnum("source").notNull().default("web"),
    referer: text("referer"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    bookIdIdx: index("book_views_book_id_idx").on(table.bookId),
    createdAtIdx: index("book_views_created_at_idx").on(table.createdAt),
  }),
);

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

export const bookFairs = pgTable(
  "book_fairs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    city: varchar("city", { length: 255 }),
    country: varchar("country", { length: 255 }),
    venue: text("venue"),
    website: text("website"),
    coverUrl: text("cover_url"),
    bannerUrl: text("banner_url"),
    startDate: timestamp("start_date", { mode: "date" }).notNull(),
    endDate: timestamp("end_date", { mode: "date" }).notNull(),
    status: bookFairStatusEnum("status").notNull().default("draft"),
    approvalStatus: bookFairApprovalStatusEnum("approval_status")
      .notNull()
      .default("pending"),
    listingTier: bookFairListingTierEnum("listing_tier")
      .notNull()
      .default("free"),
    promotedUntil: timestamp("promoted_until"),
    sortOrder: integer("sort_order"),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    startDateIdx: index("book_fairs_start_date_idx").on(table.startDate),
  }),
);

export const bookFairsRelations = relations(bookFairs, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [bookFairs.createdByUserId],
    references: [users.id],
  }),
  attendees: many(fairAttendees),
  views: many(fairViews),
}));

export const fairAttendees = pgTable(
  "fair_attendees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fairId: uuid("fair_id")
      .notNull()
      .references(() => bookFairs.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    status: fairAttendeeStatusEnum("status").notNull().default("approved"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    fairCreatorUnique: unique("fair_attendees_fair_creator_unique").on(
      table.fairId,
      table.creatorId,
    ),
    fairIdIdx: index("fair_attendees_fair_id_idx").on(table.fairId),
    creatorIdIdx: index("fair_attendees_creator_id_idx").on(table.creatorId),
  }),
);

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

export const fairViews = pgTable(
  "fair_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fairId: uuid("fair_id")
      .references(() => bookFairs.id)
      .notNull(),
    userId: uuid("user_id").references(() => users.id),
    source: fairViewSourceEnum("source").notNull().default("web"),
    referer: text("referer"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    fairIdIdx: index("fair_views_fair_id_idx").on(table.fairId),
    createdAtIdx: index("fair_views_created_at_idx").on(table.createdAt),
  }),
);

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

export const bookStores = pgTable(
  "book_stores",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    address: text("address").notNull(),
    city: varchar("city", { length: 255 }).notNull(),
    country: varchar("country", { length: 255 }).notNull(),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    website: text("website"),
    coverUrl: text("cover_url"),
    bannerUrl: text("banner_url"),
    status: bookStoreStatusEnum("status").notNull().default("draft"),
    approvalStatus: bookStoreApprovalStatusEnum("approval_status")
      .notNull()
      .default("pending"),
    sortOrder: integer("sort_order"),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    countryIdx: index("book_stores_country_idx").on(table.country),
  }),
);

export const bookStoresRelations = relations(bookStores, ({ one }) => ({
  createdBy: one(users, {
    fields: [bookStores.createdByUserId],
    references: [users.id],
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

export type Like = InferSelectModel<typeof likes>;
export type NewLike = InferInsertModel<typeof likes>;

export type BookImage = InferSelectModel<typeof bookImages>;
export type NewBookImage = InferInsertModel<typeof bookImages>;

export type CreatorClaim = InferSelectModel<typeof creatorClaims>;
export type NewCreatorClaim = InferInsertModel<typeof creatorClaims>;

export type Wishlist = InferSelectModel<typeof wishlists>;
export type NewWishlist = InferInsertModel<typeof wishlists>;

export type CreatorMilestoneEmail = InferSelectModel<
  typeof creatorMilestoneEmails
>;
export type NewCreatorMilestoneEmail = InferInsertModel<
  typeof creatorMilestoneEmails
>;

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

export type ArtistOfTheWeek = InferSelectModel<typeof artistOfTheWeek>;
export type NewArtistOfTheWeek = InferInsertModel<typeof artistOfTheWeek>;
export type PublisherOfTheWeek = InferSelectModel<typeof publisherOfTheWeek>;
export type NewPublisherOfTheWeek = InferInsertModel<typeof publisherOfTheWeek>;
export type NewsletterCampaign = InferSelectModel<typeof newsletterCampaigns>;
export type NewNewsletterCampaign = InferInsertModel<
  typeof newsletterCampaigns
>;
export type NewsletterCampaignStatus =
  (typeof newsletterCampaignStatusEnum.enumValues)[number];

export type CreatorMessage = InferSelectModel<typeof creatorMessages>;
export type NewCreatorMessage = InferInsertModel<typeof creatorMessages>;

export type BookComment = InferSelectModel<typeof bookComments>;
export type NewBookComment = InferInsertModel<typeof bookComments>;

export type AdminNotification = InferSelectModel<typeof adminNotifications>;
export type NewAdminNotification = InferInsertModel<typeof adminNotifications>;

export type CreatorInterview = InferSelectModel<typeof creatorInterviews>;
export type NewCreatorInterview = InferInsertModel<typeof creatorInterviews>;
export type CreatorInterviewStatus =
  (typeof creatorInterviewStatusEnum.enumValues)[number];

export type InterviewType = (typeof interviewTypeEnum.enumValues)[number];

export type PurchaseClick = InferSelectModel<typeof purchaseClicks>;
export type NewPurchaseClick = InferInsertModel<typeof purchaseClicks>;
export type PurchaseClickSource =
  (typeof purchaseClickSourceEnum.enumValues)[number];

export type BookView = InferSelectModel<typeof bookViews>;
export type NewBookView = InferInsertModel<typeof bookViews>;
export type BookViewSource = (typeof bookViewSourceEnum.enumValues)[number];

export type BookFair = InferSelectModel<typeof bookFairs>;
export type NewBookFair = InferInsertModel<typeof bookFairs>;
export type UpdateBookFair = Partial<InferInsertModel<typeof bookFairs>>;
export type BookFairStatus = (typeof bookFairStatusEnum.enumValues)[number];
export type BookFairApprovalStatus =
  (typeof bookFairApprovalStatusEnum.enumValues)[number];
export type BookFairListingTier =
  (typeof bookFairListingTierEnum.enumValues)[number];

export type FairAttendee = InferSelectModel<typeof fairAttendees>;
export type NewFairAttendee = InferInsertModel<typeof fairAttendees>;
export type FairAttendeeStatus =
  (typeof fairAttendeeStatusEnum.enumValues)[number];

export type FairView = InferSelectModel<typeof fairViews>;
export type NewFairView = InferInsertModel<typeof fairViews>;
export type FairViewSource = (typeof fairViewSourceEnum.enumValues)[number];

export type BookStore = InferSelectModel<typeof bookStores>;
export type NewBookStore = InferInsertModel<typeof bookStores>;
export type UpdateBookStore = Partial<InferInsertModel<typeof bookStores>>;
export type BookStoreStatus = (typeof bookStoreStatusEnum.enumValues)[number];
export type BookStoreApprovalStatus =
  (typeof bookStoreApprovalStatusEnum.enumValues)[number];
