import Banner from "../../../components/app/Banner";
import { SITE_SKOOL } from "../../../constants/siteSocial";

const SkoolCommunityBanner = () => (
  <div
    x-cloak
    x-data="{ show: $persist(true).as('skool-community-banner') }"
    x-show="show"
  >
    <Banner
      type="info"
      message="Working on a photobook? Get feedback and learn about editing, design, printing, and more."
    >
      <div class="flex flex-col items-center gap-3 sm:flex-row">
        <a
          href={SITE_SKOOL.href}
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm font-medium underline decoration-accent underline-offset-4"
        >
          Publish Your Photobook
        </a>
        <button
          type="button"
          x-on:click="show = false"
          class="text-sm cursor-pointer hover:opacity-75"
        >
          Dismiss
        </button>
      </div>
    </Banner>
  </div>
);

export default SkoolCommunityBanner;
