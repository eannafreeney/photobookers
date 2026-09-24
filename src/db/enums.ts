import { pgEnum } from "drizzle-orm/pg-core";

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

export const creatorViewSourceEnum = pgEnum("creator_view_source", [
  "web",
  "hyperview",
]);

export const bookFairStatusEnum = pgEnum("book_fair_status", [
  "draft",
  "published",
  "cancelled",
]);

export const bookFairListingTierEnum = pgEnum("book_fair_listing_tier", [
  "free",
  "promoted",
]);

export const bookStoreStatusEnum = pgEnum("book_store_status", [
  "draft",
  "published",
]);

export const printerStatusEnum = pgEnum("printer_status", [
  "draft",
  "published",
]);

export const bookStoreApprovalStatusEnum = pgEnum(
  "book_store_approval_status",
  ["pending", "approved", "rejected"],
);

export const fairAttendeeStatusEnum = pgEnum("fair_attendee_status", [
  "pending",
  "approved",
  "rejected",
]);

export const magazineIssueStatusEnum = pgEnum("magazine_issue_status", [
  "draft",
  "approved",
  "published",
]);
