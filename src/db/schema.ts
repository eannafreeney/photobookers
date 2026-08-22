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
import { sql } from "drizzle-orm";
import {
  bookApprovalStatusEnum,
  bookAvailabilityStatusEnum,
  bookFairListingTierEnum,
  bookFairStatusEnum,
  bookPublicationStatusEnum,
  bookStoreApprovalStatusEnum,
  bookStoreStatusEnum,
  bookViewSourceEnum,
  creatorClaimStatusEnum,
  creatorInterviewStatusEnum,
  creatorStatusEnum,
  creatorTypeEnum,
  creatorViewSourceEnum,
  fairAttendeeStatusEnum,
  fairViewSourceEnum,
  followTargetEnum,
  interviewTypeEnum,
  magazineIssueStatusEnum,
  newsletterCampaignStatusEnum,
  purchaseClickSourceEnum,
} from "./enums";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  profileImageUrl: text("profile_image_url"),
  shelfSlug: varchar("shelf_slug", { length: 255 }).unique(),
  shelfPublic: boolean("shelf_public").default(false).notNull(),
  acceptsTerms: timestamp("accepts_terms"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  mustResetPassword: boolean("must_reset_password").default(false).notNull(),
  verificationFeedbackEmailSentAt: timestamp(
    "verification_feedback_email_sent_at",
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

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
  reminderSentAt: timestamp("reminder_sent_at"),
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
    substack: text("substack"),
    website: text("website"),
    sortName: varchar("sort_name", { length: 255 }),
    email: text("email"),
    welcomeEmailSent: timestamp("welcome_email_sent"),
    interviewEmailSent: timestamp("interview_email_sent"),
    analyticsDigestSentForMonth: varchar("analytics_digest_sent_for_month", {
      length: 7,
    }),
    stubOutreachOptOutAt: timestamp("stub_outreach_opt_out_at"),
    interviewReminderOptOutAt: timestamp("interview_reminder_opt_out_at"),
    verifiedInstagramQueuedAt: timestamp("verified_instagram_queued_at"),
    verifiedInstagramBufferPostId: text("verified_instagram_buffer_post_id"),
    verifiedInstagramPreviewEmailSentAt: timestamp(
      "verified_instagram_preview_email_sent_at",
    ),
    verifiedInstagramCancelledAt: timestamp("verified_instagram_cancelled_at"),
    verifiedInstagramError: text("verified_instagram_error"),
    verificationFeedbackEmailSentAt: timestamp(
      "verification_feedback_email_sent_at",
    ),
    profileShareEmailSentAt: timestamp("profile_share_email_sent_at"),
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

export const creatorStubOutreachEmails = pgTable(
  "creator_stub_outreach_emails",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    kind: varchar("kind", { length: 32 }).notNull(),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueCreatorKind: unique("creator_stub_outreach_emails_creator_kind").on(
      table.creatorId,
      table.kind,
    ),
  }),
);

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
    /** External press / review links curated by the creator or admin. */
    pressLinks: jsonb("press_links")
      .$type<{ title: string; url: string; quote?: string | null }[]>()
      .default([])
      .notNull(),
    images: text("images").array(),
    tags: text("tags").array(),
    createdByUserId: uuid("created_by_user_id")
      .references(() => users.id)
      .notNull(),
    submittedByUserId: uuid("submitted_by_user_id").references(() => users.id),
    notifyFollowersOnRelease: boolean("notify_followers_on_release")
      .default(false)
      .notNull(),
    notifyFollowersScheduledDate: timestamp("notify_followers_scheduled_date"),
    notifyFollowersSentAt: timestamp("notify_followers_sent_at"),
    notifyFollowersCreatorId: uuid("notify_followers_creator_id").references(
      () => creators.id,
    ),
    sortOrder: integer("sort_order"),
    liveEmailSentAt: timestamp("live_email_sent_at"),
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

export const creatorMilestoneEmails = pgTable(
  "creator_milestone_emails",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .notNull()
      .references(() => creators.id, { onDelete: "cascade" }),
    milestone: varchar("milestone", { length: 64 }).notNull(),
    bookId: uuid("book_id").references(() => books.id, {
      onDelete: "set null",
    }),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueCreatorMilestone: unique(
      "creator_milestone_emails_creator_milestone",
    ).on(table.creatorId, table.milestone),
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

// Short updates keyed by user. Creators surface these on their page;
// collectors on their public shelf.
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  imageUrl: text("image_url"),
  notifyFollowersSentAt: timestamp("notify_followers_sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export const postLikes = pgTable(
  "post_likes",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.postId),
    postIdIdx: index("post_likes_post_id_idx").on(table.postId),
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

export const bookLists = pgTable(
  "book_lists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    description: text("description"),
    isPublic: boolean("is_public").default(false).notNull(),
    isPromoted: boolean("is_promoted").default(false).notNull(),
    promotedAt: timestamp("promoted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    userSlugUnique: unique("book_lists_user_slug_unique").on(
      table.userId,
      table.slug,
    ),
  }),
);

export const bookListItems = pgTable(
  "book_list_items",
  {
    listId: uuid("list_id")
      .notNull()
      .references(() => bookLists.id, { onDelete: "cascade" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    position: integer("position").default(0).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    pk: primaryKey(table.listId, table.bookId),
  }),
);

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
    featuredImageUrl: text("featured_image_url"),
    instagramImageUrls: text("instagram_image_urls").array(),
    artistProvidedStoryImageUrl: text("artist_provided_story_image_url"),
    artistStoryImageEmailSentAt: timestamp("artist_story_image_email_sent_at"),
    spotlightBlurb: text("spotlight_blurb"),
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
    featuredImageUrl: text("featured_image_url"),
    instagramImageUrls: text("instagram_image_urls").array(),
    artistProvidedStoryImageUrl: text("artist_provided_story_image_url"),
    artistStoryImageEmailSentAt: timestamp("artist_story_image_email_sent_at"),
    spotlightBlurb: text("spotlight_blurb"),
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
    contentPreviewEmailSentAt: timestamp("content_preview_email_sent_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueWeek: unique("artist_of_the_week_week_unique").on(table.weekStart),
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
    featuredImageUrl: text("featured_image_url"),
    instagramImageUrls: text("instagram_image_urls").array(),
    artistProvidedStoryImageUrl: text("artist_provided_story_image_url"),
    artistStoryImageEmailSentAt: timestamp("artist_story_image_email_sent_at"),
    spotlightBlurb: text("spotlight_blurb"),
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
    /** Absolute URL the CTA button links to. Null falls back to the app home. */
    ctaHref: text("cta_href"),
    generatedContent: jsonb("generated_content").$type<{
      generatedAt: string;
      botdEntries?: Array<{
        date?: string;
        bookId: string;
        bookSlug: string;
        title: string;
        coverUrl: string | null;
        artistName: string | null;
        artistSlug: string | null;
        publisherName: string | null;
        publisherSlug: string | null;
      }>;
      items?: Array<{
        date?: string;
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
        weekKey?: string;
        coverUrl: string | null;
        tagline?: string | null;
        location?: string | null;
      } | null;
      publisherOfTheWeek?: {
        displayName: string;
        slug: string;
        weekKey?: string;
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
      trending?: {
        books: Array<{
          bookId: string;
          bookSlug: string;
          title: string;
          coverUrl: string | null;
          artistName: string | null;
          publisherName: string | null;
        }>;
        artists: Array<{
          displayName: string;
          slug: string;
          type: "artist" | "publisher";
          coverUrl: string | null;
          instagram?: string | null;
        }>;
        publishers: Array<{
          displayName: string;
          slug: string;
          type: "artist" | "publisher";
          coverUrl: string | null;
          instagram?: string | null;
        }>;
      };
      trendingInstagram?: {
        preparedAt?: string;
        editionWeekStart: string;
        posts: Partial<
          Record<
            "books" | "artists" | "publishers",
            {
              imageUrls: string[];
              caption: string;
              bufferPostId?: string | null;
              queuedAt?: string | null;
              previewEmailSentAt?: string | null;
              cancelledAt?: string | null;
              error?: string | null;
            }
          >
        >;
      };
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
      .references(() => books.id, { onDelete: "cascade" })
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

export const bookViews = pgTable(
  "book_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: uuid("book_id")
      .references(() => books.id, { onDelete: "cascade" })
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

export const creatorViews = pgTable(
  "creator_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .references(() => creators.id)
      .notNull(),
    userId: uuid("user_id").references(() => users.id),
    source: creatorViewSourceEnum("source").notNull().default("web"),
    referer: text("referer"),
    /** `?ref=` campaign tag, e.g. "badge" for embedded profile badges. */
    ref: varchar("ref", { length: 32 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    creatorIdIdx: index("creator_views_creator_id_idx").on(table.creatorId),
    createdAtIdx: index("creator_views_created_at_idx").on(table.createdAt),
    creatorRefIdx: index("creator_views_creator_ref_idx").on(
      table.creatorId,
      table.ref,
    ),
  }),
);

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
    listingTier: bookFairListingTierEnum("listing_tier")
      .notNull()
      .default("free"),
    promotedUntil: timestamp("promoted_until"),
    sortOrder: integer("sort_order"),
    instagramQueuedAt: timestamp("instagram_queued_at"),
    instagramBufferPostId: text("instagram_buffer_post_id"),
    instagramError: text("instagram_error"),
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

export const magazineIssues = pgTable(
  "magazine_issues",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    status: magazineIssueStatusEnum("status").default("draft").notNull(),
    // Null until an approved issue is assigned a number.
    issueNumber: integer("issue_number"),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    kicker: text("kicker"),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    // The generated concept the issue was built around.
    theme: text("theme"),
    editorsLetterTitle: text("editors_letter_title"),
    editorsLetter: text("editors_letter").array(),
    coverUrl: text("cover_url"),
    bannerUrl: text("banner_url"),
    publishedLabel: text("published_label"),
    readingMinutes: integer("reading_minutes"),
    // Generation provenance (which seed/model produced a draft).
    generationSeed: text("generation_seed"),
    generationModel: text("generation_model"),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    uniqueIssueNumber: unique("magazine_issues_issue_number_unique").on(
      table.issueNumber,
    ),
    statusIdx: index("magazine_issues_status_idx").on(table.status),
  }),
);

export const magazineIssueBooks = pgTable(
  "magazine_issue_books",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    issueId: uuid("issue_id")
      .notNull()
      .references(() => magazineIssues.id, { onDelete: "cascade" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
    blurb: text("blurb"),
    /** Admin-chosen image URL to feature for this book in the issue. Falls back
     *  to the book's cover / first image when null. */
    selectedImageUrl: text("selected_image_url"),
    artistPrompt: text("artist_prompt"),
    artistQuote: text("artist_quote"),
    artistEmailSentAt: timestamp("artist_email_sent_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    uniqueIssueBook: unique("magazine_issue_books_issue_book_unique").on(
      table.issueId,
      table.bookId,
    ),
    issueIdx: index("magazine_issue_books_issue_idx").on(table.issueId),
  }),
);

/** Snapshot of publisher catalogue products for weekly new-release watch. */
export const publisherReleaseWatchSeen = pgTable(
  "publisher_release_watch_seen",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    publisherId: varchar("publisher_id", { length: 64 }).notNull(),
    productKey: text("product_key").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
  },
  (table) => ({
    uniquePublisherProduct: unique(
      "publisher_release_watch_seen_publisher_product_unique",
    ).on(table.publisherId, table.productKey),
    publisherIdx: index("publisher_release_watch_seen_publisher_idx").on(
      table.publisherId,
    ),
  }),
);

export type {
  BookPressLink,
  User,
  NewUser,
  Creator,
  NewCreator,
  UpdateCreator,
  Book,
  NewBook,
  UpdateBook,
  Follow,
  NewFollow,
  CollectionItem,
  NewCollectionItem,
  PostLike,
  NewPostLike,
  BookImage,
  NewBookImage,
  CreatorClaim,
  NewCreatorClaim,
  Wishlist,
  NewWishlist,
  BookList,
  NewBookList,
  BookListItem,
  NewBookListItem,
  CreatorMilestoneEmail,
  NewCreatorMilestoneEmail,
  CreatorStubOutreachEmail,
  NewCreatorStubOutreachEmail,
  StubOutreachEmailKind,
  CreatorType,
  FollowTarget,
  CreatorClaimStatus,
  BookApprovalStatus,
  BookPublicationStatus,
  BookAvailabilityStatus,
  CreatorStatus,
  BookOfTheDay,
  NewBookOfTheDay,
  ArtistOfTheWeek,
  NewArtistOfTheWeek,
  PublisherOfTheWeek,
  NewPublisherOfTheWeek,
  NewsletterCampaign,
  NewNewsletterCampaign,
  NewsletterCampaignStatus,
  Post,
  NewPost,
  BookComment,
  NewBookComment,
  AdminNotification,
  NewAdminNotification,
  CreatorInterview,
  NewCreatorInterview,
  CreatorInterviewStatus,
  InterviewType,
  PurchaseClick,
  NewPurchaseClick,
  PurchaseClickSource,
  BookView,
  NewBookView,
  BookViewSource,
  CreatorView,
  NewCreatorView,
  CreatorViewSource,
  BookFair,
  NewBookFair,
  UpdateBookFair,
  BookFairStatus,
  BookFairListingTier,
  FairAttendee,
  NewFairAttendee,
  FairAttendeeStatus,
  FairView,
  NewFairView,
  FairViewSource,
  BookStore,
  NewBookStore,
  UpdateBookStore,
  BookStoreStatus,
  BookStoreApprovalStatus,
  MagazineIssue,
  NewMagazineIssue,
  MagazineIssueStatus,
  MagazineIssueBook,
  NewMagazineIssueBook,
  PublisherReleaseWatchSeen,
  NewPublisherReleaseWatchSeen,
} from "./types";
