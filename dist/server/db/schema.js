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
  doublePrecision
} from "drizzle-orm/pg-core";
import {
  relations,
  sql
} from "drizzle-orm";
const bookAvailabilityStatusEnum = pgEnum("book_availability_status", [
  "sold_out",
  "unavailable",
  "available"
]);
const bookApprovalStatusEnum = pgEnum("book_approval_status", [
  "pending",
  "approved",
  "rejected"
]);
const bookPublicationStatusEnum = pgEnum("book_publication_status", [
  "published",
  "draft"
]);
const followTargetEnum = pgEnum("follow_target", ["user", "creator"]);
const creatorTypeEnum = pgEnum("creator_type", ["publisher", "artist"]);
const creatorStatusEnum = pgEnum("creator_status", [
  "stub",
  "verified",
  "suspended",
  "deleted"
]);
const creatorClaimStatusEnum = pgEnum("creator_claim_status", [
  "pending",
  "pending_admin_review",
  "approved",
  "rejected"
]);
const creatorInterviewStatusEnum = pgEnum("creator_interview_status", [
  "sent",
  "completed",
  "expired",
  "published"
]);
const interviewTypeEnum = pgEnum("interview_type", [
  "introduction",
  "book"
]);
const newsletterCampaignStatusEnum = pgEnum(
  "newsletter_campaign_status",
  ["draft", "approved", "scheduled", "sent", "failed"]
);
const purchaseClickSourceEnum = pgEnum("purchase_click_source", [
  "web",
  "hyperview"
]);
const bookViewSourceEnum = pgEnum("book_view_source", [
  "web",
  "hyperview"
]);
const fairViewSourceEnum = pgEnum("fair_view_source", [
  "web",
  "hyperview"
]);
const creatorViewSourceEnum = pgEnum("creator_view_source", [
  "web",
  "hyperview"
]);
const bookFairStatusEnum = pgEnum("book_fair_status", [
  "draft",
  "published",
  "cancelled"
]);
const bookFairApprovalStatusEnum = pgEnum("book_fair_approval_status", [
  "pending",
  "approved",
  "rejected"
]);
const bookFairListingTierEnum = pgEnum("book_fair_listing_tier", [
  "free",
  "promoted"
]);
const bookStoreStatusEnum = pgEnum("book_store_status", [
  "draft",
  "published"
]);
const bookStoreApprovalStatusEnum = pgEnum("book_store_approval_status", [
  "pending",
  "approved",
  "rejected"
]);
const fairAttendeeStatusEnum = pgEnum("fair_attendee_status", [
  "pending",
  "approved",
  "rejected"
]);
const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  profileImageUrl: text("profile_image_url"),
  acceptsTerms: timestamp("accepts_terms"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  mustResetPassword: boolean("must_reset_password").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date())
});
const usersRelations = relations(users, ({ many }) => ({
  creators: many(creators),
  books: many(books),
  follows: many(follows),
  collections: many(collectionItems),
  likes: many(likes),
  wishlists: many(wishlists),
  claims: many(creatorClaims),
  comments: many(bookComments),
  createdFairs: many(bookFairs),
  createdStores: many(bookStores)
}));
const creatorInterviews = pgTable("creator_interviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  creatorSlug: varchar("creator_slug", { length: 255 }).notNull(),
  interviewType: interviewTypeEnum("interview_type").notNull().default("introduction"),
  bookId: uuid("book_id").references(() => books.id, { onDelete: "set null" }),
  recipientEmail: text("recipient_email").notNull(),
  inviteToken: varchar("invite_token", { length: 255 }).notNull().unique(),
  invitedByUserId: uuid("invited_by_user_id").references(() => users.id),
  status: creatorInterviewStatusEnum("status").notNull().default("sent"),
  invitedAt: timestamp("invited_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"),
  answers: jsonb("answers").$type(),
  promoImageUrl: text("promo_image_url")
});
const creatorInterviewsRelations = relations(
  creatorInterviews,
  ({ one }) => ({
    creator: one(creators, {
      fields: [creatorInterviews.creatorId],
      references: [creators.id]
    }),
    invitedBy: one(users, {
      fields: [creatorInterviews.invitedByUserId],
      references: [users.id]
    }),
    book: one(books, {
      fields: [creatorInterviews.bookId],
      references: [books.id]
    })
  })
);
const adminNotifications = pgTable("admin_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type", { length: 64 }).notNull(),
  // e.g. "book_published"
  title: text("title").notNull(),
  body: text("body").notNull(),
  targetUrl: text("target_url"),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
const creators = pgTable(
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
      length: 7
    }),
    stubOutreachOptOutAt: timestamp("stub_outreach_opt_out_at"),
    verifiedInstagramQueuedAt: timestamp("verified_instagram_queued_at"),
    verifiedInstagramBufferPostId: text("verified_instagram_buffer_post_id"),
    verifiedInstagramError: text("verified_instagram_error"),
    createdByUserId: uuid("created_by_user_id").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date())
  },
  (table) => ({
    uniqueOwnerType: [table.ownerUserId, table.type]
    // enforce one profile per type
  })
);
const creatorsRelations = relations(creators, ({ one, many }) => ({
  owner: one(users, {
    fields: [creators.ownerUserId],
    references: [users.id]
  }),
  booksAsArtist: many(books, {
    relationName: "artistCreator"
  }),
  booksAsPublisher: many(books, {
    relationName: "publisherCreator"
  }),
  interviews: many(creatorInterviews),
  followers: many(follows),
  claims: many(creatorClaims),
  artistOfTheWeekEntries: many(artistOfTheWeek),
  publisherOfTheWeekEntries: many(publisherOfTheWeek),
  messages: many(creatorMessages),
  fairAttendees: many(fairAttendees),
  milestoneEmails: many(creatorMilestoneEmails),
  stubOutreachEmails: many(creatorStubOutreachEmails),
  views: many(creatorViews)
}));
const creatorStubOutreachEmails = pgTable(
  "creator_stub_outreach_emails",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
    kind: varchar("kind", { length: 32 }).notNull(),
    sentAt: timestamp("sent_at").defaultNow().notNull()
  },
  (table) => ({
    uniqueCreatorKind: unique("creator_stub_outreach_emails_creator_kind").on(
      table.creatorId,
      table.kind
    )
  })
);
const creatorStubOutreachEmailsRelations = relations(
  creatorStubOutreachEmails,
  ({ one }) => ({
    creator: one(creators, {
      fields: [creatorStubOutreachEmails.creatorId],
      references: [creators.id]
    })
  })
);
const books = pgTable(
  "books",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    artistId: uuid("artist_id").references(() => creators.id),
    publisherId: uuid("publisher_id").references(() => creators.id),
    releaseDate: timestamp("release_date"),
    availabilityStatus: bookAvailabilityStatusEnum("availability_status").default("available").notNull(),
    approvalStatus: bookApprovalStatusEnum("approval_status").default("pending"),
    publicationStatus: bookPublicationStatusEnum("publication_status").default("draft"),
    coverUrl: text("cover_url"),
    purchaseLink: text("purchase_link"),
    images: text("images").array(),
    tags: text("tags").array(),
    createdByUserId: uuid("created_by_user_id").references(() => users.id).notNull(),
    notifyFollowersOnRelease: boolean("notify_followers_on_release").default(false).notNull(),
    notifyFollowersScheduledDate: timestamp("notify_followers_scheduled_date"),
    notifyFollowersSentAt: timestamp("notify_followers_sent_at"),
    notifyFollowersCreatorId: uuid("notify_followers_creator_id").references(
      () => creators.id
    ),
    sortOrder: integer("sort_order"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date())
  },
  (table) => ({
    coverRequiredForPublish: check(
      "cover_required_for_publish",
      sql`${table.coverUrl} IS NOT NULL OR ${table.publicationStatus} = 'draft'`
    )
  })
);
const booksRelations = relations(books, ({ one, many }) => ({
  artist: one(creators, {
    fields: [books.artistId],
    references: [creators.id],
    relationName: "artistCreator"
  }),
  publisher: one(creators, {
    fields: [books.publisherId],
    references: [creators.id],
    relationName: "publisherCreator"
  }),
  creatorUser: one(users, {
    fields: [books.createdByUserId],
    references: [users.id]
  }),
  comments: many(bookComments),
  images: many(bookImages),
  likes: many(likes),
  wishlists: many(wishlists),
  collections: many(collectionItems),
  bookOfTheDay: one(bookOfTheDay),
  purchaseClicks: many(purchaseClicks),
  bookViews: many(bookViews)
}));
const creatorMilestoneEmails = pgTable(
  "creator_milestone_emails",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
    milestone: varchar("milestone", { length: 64 }).notNull(),
    bookId: uuid("book_id").references(() => books.id, { onDelete: "set null" }),
    sentAt: timestamp("sent_at").defaultNow().notNull()
  },
  (table) => ({
    uniqueCreatorMilestone: unique("creator_milestone_emails_creator_milestone").on(
      table.creatorId,
      table.milestone
    )
  })
);
const creatorMilestoneEmailsRelations = relations(
  creatorMilestoneEmails,
  ({ one }) => ({
    creator: one(creators, {
      fields: [creatorMilestoneEmails.creatorId],
      references: [creators.id]
    }),
    book: one(books, {
      fields: [creatorMilestoneEmails.bookId],
      references: [books.id]
    })
  })
);
const follows = pgTable(
  "follows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    followerUserId: uuid("follower_user_id").notNull().references(() => users.id),
    targetType: followTargetEnum("target_type").notNull(),
    targetUserId: uuid("target_user_id").references(() => users.id),
    targetCreatorId: uuid("target_creator_id").references(() => creators.id),
    createdAt: timestamp("created_at").defaultNow()
  },
  (table) => {
    return {
      userFollowUnique: unique("user_follow_unique").on(
        table.followerUserId,
        table.targetUserId,
        table.targetCreatorId
      )
    };
  }
);
const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerUserId],
    references: [users.id]
  }),
  targetUser: one(users, {
    fields: [follows.targetUserId],
    references: [users.id]
  }),
  targetCreator: one(creators, {
    fields: [follows.targetCreatorId],
    references: [creators.id]
  })
}));
const creatorMessages = pgTable("creator_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  imageUrls: text("image_urls").array(),
  notifyFollowersSentAt: timestamp("notify_followers_sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date())
});
const creatorMessagesRelations = relations(
  creatorMessages,
  ({ one }) => ({
    creator: one(creators, {
      fields: [creatorMessages.creatorId],
      references: [creators.id]
    })
  })
);
const bookImages = pgTable("book_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookId: uuid("book_id").references(() => books.id, { onDelete: "cascade" }).notNull(),
  imageUrl: text("image_url").notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
const bookImagesRelations = relations(bookImages, ({ one }) => ({
  book: one(books, {
    fields: [bookImages.bookId],
    references: [books.id]
  })
}));
const bookComments = pgTable("book_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookId: uuid("book_id").references(() => books.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date())
});
const bookCommentsRelations = relations(bookComments, ({ one }) => ({
  book: one(books, {
    fields: [bookComments.bookId],
    references: [books.id]
  }),
  user: one(users, {
    fields: [bookComments.userId],
    references: [users.id]
  })
}));
const creatorClaims = pgTable("creator_claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  creatorId: uuid("creator_id").references(() => creators.id).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: creatorClaimStatusEnum("status").notNull().default("pending"),
  // pending, approved, rejected
  requestedAt: timestamp("requested_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  verificationUrl: text("verification_url")
  // The website URL to verify
});
const creatorClaimsRelations = relations(creatorClaims, ({ one }) => ({
  creator: one(creators, {
    fields: [creatorClaims.creatorId],
    references: [creators.id]
  }),
  user: one(users, {
    fields: [creatorClaims.userId],
    references: [users.id]
  })
}));
const collectionItems = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: uuid("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow()
});
const collectionItemsRelations = relations(
  collectionItems,
  ({ one }) => ({
    user: one(users, {
      fields: [collectionItems.userId],
      references: [users.id]
    }),
    book: one(books, {
      fields: [collectionItems.bookId],
      references: [books.id]
    })
  })
);
const likes = pgTable(
  "likes",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    bookId: uuid("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow()
  },
  (table) => {
    return {
      pk: primaryKey(table.userId, table.bookId)
    };
  }
);
const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id]
  }),
  book: one(books, {
    fields: [likes.bookId],
    references: [books.id]
  })
}));
const wishlists = pgTable(
  "wishlists",
  {
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    bookId: uuid("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow()
  },
  (table) => {
    return {
      pk: primaryKey(table.userId, table.bookId)
      // prevents duplicates
    };
  }
);
const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id]
  }),
  book: one(books, {
    fields: [wishlists.bookId],
    references: [books.id]
  })
}));
const bookOfTheDay = pgTable(
  "book_of_the_day",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: timestamp("date", { mode: "date" }).notNull(),
    bookId: uuid("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
    artistEmailSentAt: timestamp("artist_email_sent_at"),
    publisherEmailSentAt: timestamp("publisher_email_sent_at"),
    artistFeatureDayEmailSentAt: timestamp("artist_feature_day_email_sent_at"),
    publisherFeatureDayEmailSentAt: timestamp(
      "publisher_feature_day_email_sent_at"
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
    updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date())
  },
  (table) => ({
    uniqueDate: unique("book_of_the_day_date_unique").on(table.date),
    uniqueBook: unique("book_of_the_day_book_unique").on(table.bookId)
  })
);
const bookOfTheDayRelations = relations(bookOfTheDay, ({ one }) => ({
  book: one(books, {
    fields: [bookOfTheDay.bookId],
    references: [books.id]
  })
}));
const artistOfTheWeek = pgTable(
  "artist_of_the_week",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weekStart: timestamp("week_start", { mode: "date" }).notNull(),
    creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
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
    updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date())
  },
  (table) => ({
    uniqueWeek: unique("artist_of_the_week_week_unique").on(table.weekStart)
  })
);
const artistOfTheWeekRelations = relations(
  artistOfTheWeek,
  ({ one }) => ({
    creator: one(creators, {
      fields: [artistOfTheWeek.creatorId],
      references: [creators.id]
    })
  })
);
const publisherOfTheWeek = pgTable(
  "publisher_of_the_week",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weekStart: timestamp("week_start", { mode: "date" }).notNull(),
    creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
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
    updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date())
  },
  (table) => ({
    uniqueWeek: unique("publisher_of_the_week_week_unique").on(table.weekStart)
  })
);
const publisherOfTheWeekRelations = relations(
  publisherOfTheWeek,
  ({ one }) => ({
    creator: one(creators, {
      fields: [publisherOfTheWeek.creatorId],
      references: [creators.id]
    })
  })
);
const newsletterCampaigns = pgTable(
  "newsletter_campaigns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weekStart: timestamp("week_start", { mode: "date" }).notNull(),
    weekEnd: timestamp("week_end", { mode: "date" }).notNull(),
    status: newsletterCampaignStatusEnum("status").notNull().default("draft"),
    templateKey: varchar("template_key", { length: 128 }).notNull().default("weekly_botd_v1"),
    templateVersion: integer("template_version").notNull().default(1),
    subject: text("subject").notNull(),
    introText: text("intro_text").notNull(),
    outroText: text("outro_text").notNull(),
    ctaText: text("cta_text").notNull(),
    generatedContent: jsonb("generated_content").$type(),
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date())
  },
  (table) => ({
    uniqueWeek: unique("newsletter_campaigns_week_start_unique").on(
      table.weekStart
    )
  })
);
const purchaseClicks = pgTable(
  "purchase_clicks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: uuid("book_id").references(() => books.id).notNull(),
    userId: uuid("user_id").references(() => users.id),
    source: purchaseClickSourceEnum("source").notNull().default("web"),
    referer: text("referer"),
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (table) => ({
    bookIdIdx: index("purchase_clicks_book_id_idx").on(table.bookId),
    createdAtIdx: index("purchase_clicks_created_at_idx").on(table.createdAt)
  })
);
const purchaseClicksRelations = relations(purchaseClicks, ({ one }) => ({
  book: one(books, {
    fields: [purchaseClicks.bookId],
    references: [books.id]
  }),
  user: one(users, {
    fields: [purchaseClicks.userId],
    references: [users.id]
  })
}));
const bookViews = pgTable(
  "book_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: uuid("book_id").references(() => books.id).notNull(),
    userId: uuid("user_id").references(() => users.id),
    source: bookViewSourceEnum("source").notNull().default("web"),
    referer: text("referer"),
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (table) => ({
    bookIdIdx: index("book_views_book_id_idx").on(table.bookId),
    createdAtIdx: index("book_views_created_at_idx").on(table.createdAt)
  })
);
const bookViewsRelations = relations(bookViews, ({ one }) => ({
  book: one(books, {
    fields: [bookViews.bookId],
    references: [books.id]
  }),
  user: one(users, {
    fields: [bookViews.userId],
    references: [users.id]
  })
}));
const creatorViews = pgTable(
  "creator_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id").references(() => creators.id).notNull(),
    userId: uuid("user_id").references(() => users.id),
    source: creatorViewSourceEnum("source").notNull().default("web"),
    referer: text("referer"),
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (table) => ({
    creatorIdIdx: index("creator_views_creator_id_idx").on(table.creatorId),
    createdAtIdx: index("creator_views_created_at_idx").on(table.createdAt)
  })
);
const creatorViewsRelations = relations(creatorViews, ({ one }) => ({
  creator: one(creators, {
    fields: [creatorViews.creatorId],
    references: [creators.id]
  }),
  user: one(users, {
    fields: [creatorViews.userId],
    references: [users.id]
  })
}));
const bookFairs = pgTable(
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
    approvalStatus: bookFairApprovalStatusEnum("approval_status").notNull().default("pending"),
    listingTier: bookFairListingTierEnum("listing_tier").notNull().default("free"),
    promotedUntil: timestamp("promoted_until"),
    sortOrder: integer("sort_order"),
    createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date())
  },
  (table) => ({
    startDateIdx: index("book_fairs_start_date_idx").on(table.startDate)
  })
);
const bookFairsRelations = relations(bookFairs, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [bookFairs.createdByUserId],
    references: [users.id]
  }),
  attendees: many(fairAttendees),
  views: many(fairViews)
}));
const fairAttendees = pgTable(
  "fair_attendees",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fairId: uuid("fair_id").notNull().references(() => bookFairs.id, { onDelete: "cascade" }),
    creatorId: uuid("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
    status: fairAttendeeStatusEnum("status").notNull().default("approved"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date())
  },
  (table) => ({
    fairCreatorUnique: unique("fair_attendees_fair_creator_unique").on(
      table.fairId,
      table.creatorId
    ),
    fairIdIdx: index("fair_attendees_fair_id_idx").on(table.fairId),
    creatorIdIdx: index("fair_attendees_creator_id_idx").on(table.creatorId)
  })
);
const fairAttendeesRelations = relations(fairAttendees, ({ one }) => ({
  fair: one(bookFairs, {
    fields: [fairAttendees.fairId],
    references: [bookFairs.id]
  }),
  creator: one(creators, {
    fields: [fairAttendees.creatorId],
    references: [creators.id]
  })
}));
const fairViews = pgTable(
  "fair_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fairId: uuid("fair_id").references(() => bookFairs.id).notNull(),
    userId: uuid("user_id").references(() => users.id),
    source: fairViewSourceEnum("source").notNull().default("web"),
    referer: text("referer"),
    createdAt: timestamp("created_at").defaultNow().notNull()
  },
  (table) => ({
    fairIdIdx: index("fair_views_fair_id_idx").on(table.fairId),
    createdAtIdx: index("fair_views_created_at_idx").on(table.createdAt)
  })
);
const fairViewsRelations = relations(fairViews, ({ one }) => ({
  fair: one(bookFairs, {
    fields: [fairViews.fairId],
    references: [bookFairs.id]
  }),
  user: one(users, {
    fields: [fairViews.userId],
    references: [users.id]
  })
}));
const bookStores = pgTable(
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
    approvalStatus: bookStoreApprovalStatusEnum("approval_status").notNull().default("pending"),
    sortOrder: integer("sort_order"),
    createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => /* @__PURE__ */ new Date())
  },
  (table) => ({
    countryIdx: index("book_stores_country_idx").on(table.country)
  })
);
const bookStoresRelations = relations(bookStores, ({ one }) => ({
  createdBy: one(users, {
    fields: [bookStores.createdByUserId],
    references: [users.id]
  })
}));
export {
  adminNotifications,
  artistOfTheWeek,
  artistOfTheWeekRelations,
  bookApprovalStatusEnum,
  bookAvailabilityStatusEnum,
  bookComments,
  bookCommentsRelations,
  bookFairApprovalStatusEnum,
  bookFairListingTierEnum,
  bookFairStatusEnum,
  bookFairs,
  bookFairsRelations,
  bookImages,
  bookImagesRelations,
  bookOfTheDay,
  bookOfTheDayRelations,
  bookPublicationStatusEnum,
  bookStoreApprovalStatusEnum,
  bookStoreStatusEnum,
  bookStores,
  bookStoresRelations,
  bookViewSourceEnum,
  bookViews,
  bookViewsRelations,
  books,
  booksRelations,
  collectionItems,
  collectionItemsRelations,
  creatorClaimStatusEnum,
  creatorClaims,
  creatorClaimsRelations,
  creatorInterviewStatusEnum,
  creatorInterviews,
  creatorInterviewsRelations,
  creatorMessages,
  creatorMessagesRelations,
  creatorMilestoneEmails,
  creatorMilestoneEmailsRelations,
  creatorStatusEnum,
  creatorStubOutreachEmails,
  creatorStubOutreachEmailsRelations,
  creatorTypeEnum,
  creatorViewSourceEnum,
  creatorViews,
  creatorViewsRelations,
  creators,
  creatorsRelations,
  fairAttendeeStatusEnum,
  fairAttendees,
  fairAttendeesRelations,
  fairViewSourceEnum,
  fairViews,
  fairViewsRelations,
  followTargetEnum,
  follows,
  followsRelations,
  interviewTypeEnum,
  likes,
  likesRelations,
  newsletterCampaignStatusEnum,
  newsletterCampaigns,
  publisherOfTheWeek,
  publisherOfTheWeekRelations,
  purchaseClickSourceEnum,
  purchaseClicks,
  purchaseClicksRelations,
  users,
  usersRelations,
  wishlists,
  wishlistsRelations
};
