export const generateBookPendingReviewEmail = (params: {
  bookTitle: string;
  reviewUrl: string;
  isResubmit?: boolean;
}) => {
  const heading = params.isResubmit
    ? "Book resubmitted for review"
    : "New book submitted for review";

  return `
    <h2>${heading}</h2>
    <p><strong>${params.bookTitle}</strong> is waiting for approval.</p>
    <p><a href="${params.reviewUrl}">Review in admin dashboard</a></p>
  `;
};

export const generateNewClaimAdminEmail = (params: {
  creatorName: string;
  claimantName: string;
  claimantEmail: string;
  status: string;
  reviewUrl: string;
}) => {
  const statusLabel =
    params.status === "approved"
      ? "Auto-approved (email domain matched)"
      : params.status === "pending_admin_review"
        ? "Pending admin review"
        : params.status;

  return `
    <h2>New creator claim</h2>
    <p><strong>${params.claimantName}</strong> (${params.claimantEmail}) submitted a claim for <strong>${params.creatorName}</strong>.</p>
    <p>Status: ${statusLabel}</p>
    <p><a href="${params.reviewUrl}">Review in admin dashboard</a></p>
  `;
};
