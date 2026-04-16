import { Creator } from "../../../../db/schema";

export const generateWelcomeEmail = (creator: Creator, loginLink: string) => {
  const creatorName = creator.displayName;
  const profileUrl = `https://photobookers.com/creators/${creator.slug}`;
  return `
      <p>Hi ${creatorName},</p>
      <p>I hope you are well.</p>
      <p>
        My name is Eanna de Freine — I previously founded the independent publisher
        The Velvet Cell (Berlin/Bremen), which I stepped away from in 2025 to focus on new projects.
      </p>
      <p>
        I am writing to invite you to join Photobookers, a platform for discovering photobooks and following
        the artists and publishers behind them — something closer in spirit to Bandcamp, but for photobooks.
      </p>
      <p>The idea is to create a dedicated space where collectors can:</p>
      <ul>
        <li>Follow publishers and artists they admire</li>
        <li>Explore full catalogues in one place</li>
        <li>Save books to their collections or wishlists</li>
        <li>Stay informed about new releases</li>
      </ul>
      <p>
        We also curate the platform weekly with a Book of the Week, featured titles,
        and artist/publisher spotlights.
      </p>
      <p>
        I have long admired what you are doing, and I would love to include you as part of the platform.
        I have already created a profile for you with a small selection of your books.
      </p>
      <p>
        <a href="${loginLink}">Log in to your account</a> to claim and edit your profile.
      </p>
      <p>
        You are very welcome to claim and edit the page here:<br />
        <a href="${profileUrl}">View Profile</a>
      </p>
      <p>— or just reply and I can set it up for you.</p>
      <p>
        We are still in an early phase, but building something thoughtful for the photobook community is the goal.
      </p>
      <p>
        All the best,<br />
        Eanna
      </p>
    `;
};

export const generateWelcomeEmailForCreator = (
  creator: Creator,
  loginLink: string,
) => {
  const creatorName = creator.displayName;
  const profileUrl = `https://photobookers.com/creators/${creator.slug}`;
  return `
    <p>Hi ${creatorName},</p>
      <p>I hope you are well. Please forgive the cold email.
        I am writing today to share your Photobookers profile with you.
      </p>
      <p>
        About me: I am the founder of the independent publisher
        The Velvet Cell (Berlin/Bremen), which I stepped away from in 2025 to focus on new projects.
      </p>
      <p>
        I am now building Photobookers, a platform for discovering photobooks and following
        the artists and publishers behind them — something close in spirit to Bandcamp, but for photobooks.
      </p>
      <p>
        View your profile here: <br/>
        <a href="${profileUrl}">View Profile</a>
      </p>
      <p>
        <a href="${loginLink}">Log in to your account</a> to claim and edit your profile.
      </p>
      <p>The idea is to create a dedicated space where artists and publishers can:</p>
      <ul>
        <li>Share their books and catalogues</li>
        <li>Connect with fans directly</li>
        <li>Get discovered by new collectors</li>
      </ul>
      <p>...and collectors can:</p>
      <ul>
        <li>Follow publishers and artists they admire</li>
        <li>Explore full catalogues in one place</li>
        <li>Save books to their collections or wishlists</li>
        <li>Stay informed about new releases</li>
      </ul>
      <p>
        We also curate the platform weekly with a Book of the Week, featured titles,
        and artist/publisher spotlights.
      </p>
      <p>
        I would love to include you as part of the platform.
        I have already created a profile for you with a small selection of your books.
      </p>
      <p>
        We are still in an early phase, but building something thoughtful for the photobook community is the goal.
      </p>
      <p>
        All the best,<br />
        Eanna
      </p>
  `;
};

export const generateInterviewInviteEmail = (params: {
  creatorName: string;
  interviewLink: string;
}) => {
  return `
    <p>Hi ${params.creatorName},</p>
    <p>I hope you are well. My name is Eanna de Freine — I am the founder of Photobookers, a platform for discovering photobooks and following the artists and publishers behind them.</p>
    <p>The idea is to create a dedicated space where collectors can follow publishers and artists they admire, explore full catalogues in one place, and stay informed about new releases — something close in spirit to Bandcamp, but for photobooks.</p>
    <p>As part of the platform, we publish short interviews with the creators and publishers featured on the site. I would love to include your voice, and I have put together five questions I think you would have a lot to say about.</p>
    <p>It should take no more than 10 minutes to complete, and your answers will be published on our main page and promoted on our social media channels.</p>
    <p><a href="${params.interviewLink}">Start the interview</a></p>
    <p>Please do not hesitate to reply to this email if you have any questions.</p>
    <p>All the best,<br/>Eanna<br/>Photobookers</p>
  `;
};

export const generateBookApprovedEmail = (params: {
  creatorName: string;
  bookTitle: string;
  bookUrl: string;
}) => {
  return `
    <p>Hi ${params.creatorName},</p>
    <p>Great news — your book <strong>${params.bookTitle}</strong> has been approved and is now live on Photobookers.</p>
    <p><a href="${params.bookUrl}">View your book</a></p>
    <p>Thank you,<br/>Photobookers</p>
  `;
};

export const generateBookRejectedEmail = (params: {
  creatorName: string;
  bookTitle: string;
  feedback: string;
}) => {
  return `
    <p>Hi ${params.creatorName},</p>
    <p>Thank you for submitting <strong>${params.bookTitle}</strong> to Photobookers.</p>
    <p>Unfortunately we are unable to approve it at this time. Here is some feedback:</p>
    <blockquote style="border-left: 3px solid #ccc; padding-left: 1rem; margin: 1rem 0;">
      ${params.feedback}
    </blockquote>
    <p>Please make the necessary updates and resubmit, or reply to this email if you have any questions.</p>
    <p>Thank you,<br/>Photobookers</p>
  `;
};
