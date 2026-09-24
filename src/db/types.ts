import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  users,
  creators,
  books,
  follows,
  collectionItems,
  postLikes,
  bookImages,
  creatorClaims,
  wishlists,
  bookLists,
  bookListItems,
  creatorMilestoneEmails,
  creatorStubOutreachEmails,
  bookOfTheDay,
  artistOfTheWeek,
  publisherOfTheWeek,
  newsletterCampaigns,
  posts,
  bookComments,
  adminNotifications,
  creatorInterviews,
  purchaseClicks,
  bookViews,
  creatorViews,
  bookFairs,
  fairAttendees,
  fairViews,
  bookStores,
  printers,
  printerImages,
  printQuoteRequests,
  printQuoteRecipients,
  magazineIssues,
  magazineIssueBooks,
  publisherReleaseWatchSeen,
} from "./schema";
import {
  magazineIssueStatusEnum,
  bookApprovalStatusEnum,
  bookAvailabilityStatusEnum,
  bookFairListingTierEnum,
  bookFairStatusEnum,
  bookPublicationStatusEnum,
  bookStoreApprovalStatusEnum,
  bookStoreStatusEnum,
  printerStatusEnum,
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
  newsletterCampaignStatusEnum,
  purchaseClickSourceEnum,
} from "./enums";

export type BookPressLink = {
  title: string;
  url: string;
  quote?: string | null;
  /** Piece date as YYYY-MM-DD. Optional; older links omit it. */
  publishedAt?: string | null;
};

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
export type PostLike = InferSelectModel<typeof postLikes>;
export type NewPostLike = InferInsertModel<typeof postLikes>;
export type BookImage = InferSelectModel<typeof bookImages>;
export type NewBookImage = InferInsertModel<typeof bookImages>;
export type CreatorClaim = InferSelectModel<typeof creatorClaims>;
export type NewCreatorClaim = InferInsertModel<typeof creatorClaims>;
export type Wishlist = InferSelectModel<typeof wishlists>;
export type NewWishlist = InferInsertModel<typeof wishlists>;
export type BookList = InferSelectModel<typeof bookLists>;
export type NewBookList = InferInsertModel<typeof bookLists>;
export type BookListItem = InferSelectModel<typeof bookListItems>;
export type NewBookListItem = InferInsertModel<typeof bookListItems>;
export type CreatorMilestoneEmail = InferSelectModel<
  typeof creatorMilestoneEmails
>;
export type NewCreatorMilestoneEmail = InferInsertModel<
  typeof creatorMilestoneEmails
>;
export type CreatorStubOutreachEmail = InferSelectModel<
  typeof creatorStubOutreachEmails
>;
export type NewCreatorStubOutreachEmail = InferInsertModel<
  typeof creatorStubOutreachEmails
>;
export type StubOutreachEmailKind =
  "welcome" | "views_50" | "views_100" | "views_150";
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
export type Post = InferSelectModel<typeof posts>;
export type NewPost = InferInsertModel<typeof posts>;
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
export type CreatorView = InferSelectModel<typeof creatorViews>;
export type NewCreatorView = InferInsertModel<typeof creatorViews>;
export type CreatorViewSource =
  (typeof creatorViewSourceEnum.enumValues)[number];
export type BookFair = InferSelectModel<typeof bookFairs>;
export type NewBookFair = InferInsertModel<typeof bookFairs>;
export type UpdateBookFair = Partial<InferInsertModel<typeof bookFairs>>;
export type BookFairStatus = (typeof bookFairStatusEnum.enumValues)[number];
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
export type Printer = InferSelectModel<typeof printers>;
export type NewPrinter = InferInsertModel<typeof printers>;
export type UpdatePrinter = Partial<InferInsertModel<typeof printers>>;
export type PrinterStatus = (typeof printerStatusEnum.enumValues)[number];
export type PrinterImage = InferSelectModel<typeof printerImages>;
export type NewPrinterImage = InferInsertModel<typeof printerImages>;
export type PrintQuoteRequest = InferSelectModel<typeof printQuoteRequests>;
export type NewPrintQuoteRequest = InferInsertModel<typeof printQuoteRequests>;
export type PrintQuoteRecipient = InferSelectModel<typeof printQuoteRecipients>;
export type NewPrintQuoteRecipient = InferInsertModel<
  typeof printQuoteRecipients
>;
export type MagazineIssue = InferSelectModel<typeof magazineIssues>;
export type NewMagazineIssue = InferInsertModel<typeof magazineIssues>;
export type MagazineIssueStatus =
  (typeof magazineIssueStatusEnum.enumValues)[number];
export type MagazineIssueBook = InferSelectModel<typeof magazineIssueBooks>;
export type NewMagazineIssueBook = InferInsertModel<typeof magazineIssueBooks>;
export type PublisherReleaseWatchSeen = InferSelectModel<
  typeof publisherReleaseWatchSeen
>;
export type NewPublisherReleaseWatchSeen = InferInsertModel<
  typeof publisherReleaseWatchSeen
>;
