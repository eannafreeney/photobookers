import { Creator } from "../../../../db/schema";

export const generateWelcomeEmail = (creator: Creator) => {
  const creatorName = creator.displayName;
  const profileUrl = `${process.env.SITE_URL ?? "https://photobookers.com"}/creators/${creator.slug}`;
  return `
      <p>Hi ${creatorName},</p>
      <p>I hope you are well.</p>
      <p>
        My name is Eanna de Freine — I previously founded the independent publisher
        The Velvet Cell (Berlin/Bremen), which I stepped away from in 2025 to focus on new projects.
      </p>
      <p>
        I am now building Photobookers, a platform for discovering photobooks and following
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

export const generateWelcomeEmailForCreator = (creator: Creator) => {
  const creatorName = creator.displayName;
  const profileUrl = `https://photobookers.com/creators/${creator.slug}`;
  return `
    <p>Hi ${creatorName},</p>
      <p>I hope you are well. Please forgive the cold email.</p>
      <p>
        I am writing today to share your Photobookers profile with you and to invite you to claim and edit it.
      </p>
      <p>
        I am the founder of the independent publisher
        The Velvet Cell (Berlin/Bremen), which I stepped away from in 2025 to focus on new projects.
      </p>
      <p>
        I am now building Photobookers, a platform for discovering photobooks and following
        the artists and publishers behind them — something closer in spirit to Bandcamp, but for photobooks.
      </p>
      <p>The idea is to create a dedicated space where artists and publishers can:</p>
      <ul>
        <li>Share their books and catalogues</li>
        <li>Connect with fans directly</li>
        <li>Stay informed about new releases</li>
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
