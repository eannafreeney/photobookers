import { AuthUser } from "../../../../types";
import Pill from "../../../components/app/Pill";
import {
  type CreatorBrowseFilter,
  creatorsBrowseUrl,
  CREATOR_CATALOG_TARGET_ID,
} from "../creatorsBrowse";

type Props = {
  activeFilter: CreatorBrowseFilter;
  user: AuthUser | null;
};

const pillButtonClass =
  "cursor-pointer border-0 bg-transparent p-0 font-inherit";

const CreatorsBrowseFilters = ({ activeFilter, user }: Props) => {
  const filters: { id: CreatorBrowseFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "artist", label: "Artists" },
    { id: "publisher", label: "Publishers" },
  ];

  if (user) {
    filters.push({ id: "following", label: "Following" });
  }

  return (
    <div class="mb-8 flex flex-wrap justify-center items-center gap-2">
      {filters.map((filter) => (
        <a
          href={creatorsBrowseUrl(filter.id, { fragment: true })}
          x-target={CREATOR_CATALOG_TARGET_ID}
          prefetch="intent"
          aria-current={activeFilter === filter.id ? "page" : undefined}
          class={pillButtonClass}
        >
          <Pill variant={activeFilter === filter.id ? "inverse" : "default"}>
            {filter.label}
          </Pill>
        </a>
      ))}
    </div>
  );
};

export default CreatorsBrowseFilters;
