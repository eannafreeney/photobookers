import Link from "./Link";
import { Creator } from "../../db/schema";

type SocialLinksProps = {
  creator: Creator;
};

const SocialLinks = ({ creator }: SocialLinksProps) => {
  return (
    <div class={`flex gap-2 items-center text-xs`}>
      {creator.website && (
        <Link href={creator.website} target="_blank">
          {webIcon}
        </Link>
      )}
      {creator.facebook && (
        <Link href={creator.facebook} target="_blank">
          {facebookIcon}
        </Link>
      )}
      {creator.instagram && (
        <Link href={creator.instagram} target="_blank">
          {instagramIcon}
        </Link>
      )}
      {creator.twitter && (
        <Link href={creator.twitter} target="_blank">
          {twitterIcon}
        </Link>
      )}
    </div>
  );
};

export default SocialLinks;

const webIcon = (
  <svg
    width="24px"
    height="24px"
    stroke-width="1.5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    color="#000000"
  >
    <path
      d="M10.5857 10.5857L16.9496 7.0502L13.4141 13.4142M10.5857 10.5857L7.05012 16.9497L13.4141 13.4142M10.5857 10.5857L13.4141 13.4142"
      stroke="#000000"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke="#000000"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
    <path
      d="M19 12H18"
      stroke="#000000"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
    <path
      d="M6 12H5"
      stroke="#000000"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
    <path
      d="M12 5V6"
      stroke="#000000"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
    <path
      d="M12 18V19"
      stroke="#000000"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
    <path
      d="M7.05029 7.05029L7.7574 7.7574"
      stroke="#000000"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
    <path
      d="M16.2427 16.2427L16.9498 16.9498"
      stroke="#000000"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
  </svg>
);

const facebookIcon = (
  <svg
    width="24px"
    height="24px"
    stroke-width="1.5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    color="#000000"
  >
    <path
      d="M21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8Z"
      stroke="#000000"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
    <path
      d="M11 21C11 18 11 15 11 12C11 9.8125 11.5 8 15 8"
      stroke="#000000"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
    <path
      d="M9 13H11H15"
      stroke="#000000"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
  </svg>
);

const twitterIcon = (
  <svg
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    color="#000000"
  >
    <path
      d="M16.8198 20.7684L3.75317 3.96836C3.44664 3.57425 3.72749 3 4.22678 3H6.70655C6.8917 3 7.06649 3.08548 7.18016 3.23164L20.2468 20.0316C20.5534 20.4258 20.2725 21 19.7732 21H17.2935C17.1083 21 16.9335 20.9145 16.8198 20.7684Z"
      stroke="#000000"
      stroke-width="1.5"
    ></path>
    <path
      d="M20 3L4 21"
      stroke="#000000"
      stroke-width="1.5"
      stroke-linecap="round"
    ></path>
  </svg>
);

const instagramIcon = (
  <svg
    width="24px"
    height="24px"
    stroke-width="1.5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    color="#000000"
  >
    <path
      d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"
      stroke="#000000"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
    <path
      d="M3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16Z"
      stroke="#000000"
      stroke-width="1.5"
    ></path>
    <path
      d="M17.5 6.51L17.51 6.49889"
      stroke="#000000"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></path>
  </svg>
);
