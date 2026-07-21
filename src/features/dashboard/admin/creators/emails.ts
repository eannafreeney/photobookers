import { Creator } from "../../../../db/schema";

const siteUrl = () => process.env.SITE_URL ?? "https://photobookers.com";

export const generateWelcomeEmail = (creator: Creator, claimLink: string) => {
  const creatorName = creator.displayName;
  const profileUrl = `${siteUrl()}/creators/${creator.slug}`;
  return `
      <p>Hi ${creatorName},</p>
      <p>I hope you are well.</p>
      <p>
        My name is Eanna de Freine — I previously founded the independent publisher
        The Velvet Cell (Berlin/Bremen), and I am now building Photobookers.
      </p>
      <p>
        Photobookers is a curated home for photobook culture — closer in spirit to
        Bandcamp than a generic marketplace. Collectors browse books, artists,
        publishers, and fairs in one place; follow the people behind the work; save
        titles to favourites and collections; and get updates when creators they follow
        publish something new.
      </p>
      <p>
        We run editorial features throughout the week — Book of the Day, Artist and
        Publisher of the Week, short interviews, a weekly newsletter, and a monthly
        digital magazine. There is also an iOS app for browsing on the go.
      </p>
      <p>For artists and publishers, a profile means:</p>
      <ul>
        <li>A home for your catalog, with covers, details, and links to where people can buy</li>
        <li>Discovery through search, tags, fairs, and editorial features</li>
        <li>Analytics on views, outbound purchase clicks, favourites, and collections</li>
        <li>A way for collectors to follow your work and hear from you directly</li>
      </ul>
      <p>
        You keep control of your shop, links, and terms. We help the right people find you.
      </p>
      <p>
        I have long admired what you are doing, and I have already put together a profile
        for you with a small selection of your books.
      </p>
      <p>
        <a href="${profileUrl}">View your profile</a> — or
        <a href="${claimLink}">Claim your profile</a> to manage your books, update your page,
        and see your stats.
      </p>
      <p>If that is easier, just reply and I can set it up for you.</p>
      <p>
        All the best,<br />
        Eanna
      </p>
    `;
};

export const generateWelcomeEmailForCreator = (
  creator: Creator,
  claimLink: string,
) => {
  const creatorName = creator.displayName;
  const profileUrl = `${siteUrl()}/creators/${creator.slug}`;
  return `
    <p>Hi ${creatorName},</p>
      <p>
        I hope you are well. Please forgive the cold email — I am writing to share
        your Photobookers profile with you.
      </p>
      <p>
        About me: I previously founded the independent publisher The Velvet Cell
        (Berlin/Bremen), and I am now building Photobookers — a curated home for
        photobook culture, closer in spirit to Bandcamp than a generic marketplace.
      </p>
      <p>
        Collectors use Photobookers to browse books, artists, publishers, and fairs;
        follow the people behind the work; save titles to favourites and collections;
        and discover through Book of the Day, Artist and Publisher of the Week,
        interviews, our weekly newsletter, and a monthly digital magazine.
      </p>
      <p>For artists and publishers, a profile means:</p>
      <ul>
        <li>A home for your catalog, with covers, details, and links to where people can buy</li>
        <li>Discovery through search, tags, fairs, and editorial features</li>
        <li>Analytics on views, outbound purchase clicks, favourites, and collections</li>
        <li>A way for collectors to follow your work and hear from you directly</li>
      </ul>
      <p>
        You keep control of your shop, links, and terms. We help the right people find you.
      </p>
      <p>
        I have already put together a profile for you with a small selection of your books.
      </p>
      <p>
        <a href="${profileUrl}">View your profile</a> — or
        <a href="${claimLink}">Claim your profile</a> to manage your books, update your page,
        and see your stats.
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
  profileUrl: string;
}) => {
  return `
  
    <p>Hi ${params.creatorName},</p>
    <p>I hope you are well. My name is Eanna de Freine — I am the founder of Photobookers, a platform for discovering photobooks and following the artists and publishers behind them.</p>
    <p>We are publishing short interviews with the creators and publishers featured on the site. I would love to include your voice, and I have put together five questions for you.</p>
    <p>It should take no more than 10 minutes to complete, and your answers will be published on our main page and promoted on our social media channels.</p>
    <p><a href="${params.interviewLink}">Start the interview</a></p>
    <p>If you haven't yet, you can view your profile here: <br/>
      <a href="${params.profileUrl}">View Profile</a>
    </p>
    <p>Please do not hesitate to reply to this email if you have any questions.</p>
    <p>All the best,<br/>Eanna<br/>Photobookers</p>
  `;
};

export const generateInterviewInviteResendEmail = (params: {
  creatorName: string;
  profileUrl: string;
  interviewLink: string;
}) => {
  return `
    <p>Hi ${params.creatorName},</p>
    <p>Apologies — I sent you an email earlier today about our interview feature, but a link to your profile was missing. Please disregard the previous email.</p>
    <p>Here is the corrected version:</p>
    <hr/>
    <p>My name is Eanna de Freine — I am the founder of Photobookers, a platform for discovering photobooks and following the artists and publishers behind them.</p>
    <p>We are publishing short interviews with the creators and publishers featured on the site. I would love to include your voice, and I have put together five questions for you.</p>
    <p>It should take no more than 10 minutes to complete, and your answers will be published on our main page and promoted on our social media channels.</p>
    <p><a href="${params.interviewLink}">Start the interview</a></p>
    <p>You can also view your profile here:<br/>
      <a href="${params.profileUrl}">View Profile</a>
    </p>
    <p>Please do not hesitate to reply to this email if you have any questions.</p>
    <p>All the best,<br/>Eanna<br/>Photobookers</p>
  `;
};

export const generateBookApprovedEmail = (params: {
  creatorName: string;
  bookTitle: string;
  dashboardBookUrl: string;
}) => {
  return `
    <p>Hi ${params.creatorName},</p>
    <p>Great news — your book <strong>${params.bookTitle}</strong> has been approved. You can publish it from your dashboard when you are ready (add a cover first if you have not already).</p>
    <p><a href="${params.dashboardBookUrl}">Open your book in the dashboard</a></p>
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

export const generateBookFeedbackEmail = (params: {
  creatorName: string;
  bookTitle: string;
  feedback: string;
}) => {
  return `
    <p>Hi ${params.creatorName},</p>
    <p>While reviewing <strong>${params.bookTitle}</strong>, we have some feedback:</p>
    <blockquote style="border-left: 3px solid #ccc; padding-left: 1rem; margin: 1rem 0;">
      ${params.feedback}
    </blockquote>
    <p>Please make the necessary updates, or reply to this email if you have any questions.</p>
    <p>Thank you,<br/>Photobookers</p>
  `;
};
