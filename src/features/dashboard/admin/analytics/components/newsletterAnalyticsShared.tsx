import type { NewsletterSignupsDashboard } from "../../../../newsletter-analytics/signups";

export type NewsletterAnalyticsDataProps = {
  data: NewsletterSignupsDashboard;
};

export const newsletterAnalyticsDisclaimer =
  "Newsletter signup data from your Brevo list. Daily counts use each contact's Brevo created date.";
