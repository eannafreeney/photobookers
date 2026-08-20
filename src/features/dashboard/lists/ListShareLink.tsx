import ShareButton from "../../api/components/ShareButton";
import { listShareText, listShareTitle } from "../../../lib/share";

type Props = {
  listTitle: string;
  ownerName: string;
  publicUrl: string;
  /** Compact for table cells; fuller for the list detail page. */
  layout?: "compact" | "detail";
};

const absoluteUrl = (path: string) => {
  const siteUrl = (process.env.SITE_URL ?? "https://photobookers.com").replace(
    /\/$/,
    "",
  );
  return `${siteUrl}${path}`;
};

const ListShareLink = ({
  listTitle,
  ownerName,
  publicUrl,
  layout = "compact",
}: Props) => {
  const fullUrl = absoluteUrl(publicUrl);

  if (layout === "detail") {
    return (
      <div class="flex flex-col gap-2 rounded-radius border border-outline bg-surface-alt p-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <p class="text-sm font-medium text-on-surface-strong">Share this list</p>
          <a
            href={publicUrl}
            class="mt-1 block break-all text-sm text-accent underline underline-offset-2"
            target="_blank"
            rel="noreferrer"
          >
            {fullUrl}
          </a>
        </div>
        <div class="shrink-0 sm:w-40">
          <ShareButton
            title={listShareTitle(listTitle)}
            text={listShareText(listTitle, ownerName)}
            url={fullUrl}
          />
        </div>
      </div>
    );
  }

  return (
    <div class="flex items-center gap-3">
      <a
        href={publicUrl}
        class="text-accent underline underline-offset-2"
        target="_blank"
        rel="noreferrer"
      >
        View
      </a>
      <ShareButton
        variant="inline"
        title={listShareTitle(listTitle)}
        text={listShareText(listTitle, ownerName)}
        url={fullUrl}
      />
    </div>
  );
};

export default ListShareLink;
