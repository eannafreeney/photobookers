const generateBookPendingReviewEmail = (params) => {
  const heading = params.isResubmit ? "Book resubmitted for review" : "New book submitted for review";
  return `
    <h2>${heading}</h2>
    <p><strong>${params.bookTitle}</strong> is waiting for approval.</p>
    <p><a href="${params.reviewUrl}">Review in admin dashboard</a></p>
  `;
};
export {
  generateBookPendingReviewEmail
};
