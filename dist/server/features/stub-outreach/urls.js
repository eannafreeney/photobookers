function stubClaimStartUrl(creatorId) {
  const siteUrl = process.env.SITE_URL ?? "https://photobookers.com";
  return `${siteUrl.replace(/\/$/, "")}/claims/${creatorId}/start`;
}
export {
  stubClaimStartUrl
};
