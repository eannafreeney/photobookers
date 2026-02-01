import Link from "./Link";
import { Creator } from "../../db/schema";

const SocialLinks = ({ creator }: { creator: Creator }): JSX.Element => {
  if (creator.status === "stub") return <></>;

  return (
    <div class="flex flex-row gap-2 items-center justify-center">
      {creator.website && (
        <Link href={creator.website} target="_blank">
          {websiteIcon}
        </Link>
      )}
      {creator.facebook && (
        <Link href={creator.facebook} target="_blank">
          {facebookIcon}
        </Link>
      )}
      {creator.twitter && (
        <Link href={creator.twitter} target="_blank">
          {twitterIcon}
        </Link>
      )}
      {creator.instagram && (
        <Link href={creator.instagram} target="_blank">
          {instagramIcon}
        </Link>
      )}
      {/* {creator.email && <Link href={creator.email} target="_blank">{emailIcon}</Link>} */}
    </div>
  );
};

export default SocialLinks;

const websiteIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
    />
  </svg>
);

const facebookIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

const twitterIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M20.039 8.272a5.002 5.002 0 0 0-9.499-1.004A5.002 5.002 0 0 0 5 12.5c0 1.381.555 2.631 1.464 3.536a5 5 0 0 0 7.072 0c.909-.905 1.464-2.155 1.464-3.536 0-1.38-.555-2.63-1.464-3.535M9.86 9.86c.211-.211.498-.33.796-.33h.003c.299 0 .586.119.797.33l.043.043a10.5 10.5 0 1 0 4.201 4.202l.042-.042a.75.75 0 0 1 1.06 1.06l-1.06 1.06a2.5 2.5 0 1 1-3.535-3.536l-1.06-1.06ZM10 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
    />
  </svg>
);

const instagramIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-6"
  ></svg>
);

const emailIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
    />
  </svg>
);
