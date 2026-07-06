function resolveCreatorRecipientEmail(creator) {
  const ownerEmail = creator.ownerEmail?.trim();
  if (ownerEmail) return ownerEmail;
  const creatorEmail = creator.email?.trim();
  return creatorEmail || null;
}
export {
  resolveCreatorRecipientEmail
};
