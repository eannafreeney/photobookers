const siteUrl = () => process.env.SITE_URL ?? "https://photobookers.com";

/**
 * Email sent to an artist whose book has been selected for a magazine issue,
 * inviting them to answer the editor's question for that book. Mirrors the raw
 * `<p>` style of the other creator emails (the send function wraps branding).
 */
export const generateMagazineArtistPromptEmail = (params: {
  artistName: string;
  bookTitle: string;
  issueTitle: string;
  issueKicker: string | null;
  artistPrompt: string;
  bookUrl: string;
}) => {
  const feature = params.issueKicker
    ? `${params.issueKicker} — ${params.issueTitle}`
    : params.issueTitle;
  return `
    <p>Hi ${params.artistName},</p>
    <p>My name is Eanna de Freine — I am the founder of Photobookers.</p>
    <p>
      Great news: your book <strong>${params.bookTitle}</strong> has been selected
      to feature in our upcoming magazine issue, <strong>${feature}</strong>.
    </p>
    <p>
      As part of the feature I would love to include a few words from you. Here is
      the question I have for you about this book:
    </p>
    <blockquote style="border-left: 3px solid #ccc; padding-left: 1rem; margin: 1rem 0;">
      ${params.artistPrompt}
    </blockquote>
    <p>
      Just reply to this email with your answer — a sentence or two is perfect, and
      it will be published alongside the book in the issue.
    </p>
    <p>You can see the book on your profile here:<br/>
      <a href="${params.bookUrl}">View book</a>
    </p>
    <p>Thank you,<br/>Eanna<br/>Photobookers</p>
  `;
};

export const magazineSiteUrl = siteUrl;
