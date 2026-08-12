export function generateStoreUploadInviteEmail(params: {
  storeName: string;
  uploadLink: string;
  storePageUrl: string;
}) {
  return `
    <p>Hi ${params.storeName},</p>
    <p>My name is Eanna de Freine — I am the founder of Photobookers, a platform for discovering photobooks and the shops that stock them.</p>
    <p>Your store is listed on Photobookers, and I would love to show it with photos from you — the space, the shelves, a window display, whatever feels right.</p>
    <p>Please upload <strong>1–5 photos</strong> of the shop, plus an optional wide banner image for the top of your page:</p>
    <p><a href="${params.uploadLink}">Upload photos for ${params.storeName}</a></p>
    <p>You can see your current listing here:<br/>
      <a href="${params.storePageUrl}">${params.storePageUrl}</a>
    </p>
    <p>The link does not require an account and works for 60 days. Reply to this email if you have any questions.</p>
    <p>All the best,<br/>Eanna<br/>Photobookers</p>
  `;
}
