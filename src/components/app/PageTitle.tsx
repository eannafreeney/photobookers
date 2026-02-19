import { Creator } from "../../db/schema";
import Avatar from "./Avatar";
import VerifiedCreator from "./VerifiedCreator";

type PageTitleProps = {
  title?: string;
  creator?: Creator;
  isMobile?: boolean;
};

const PageTitle = ({ title, creator, isMobile }: PageTitleProps) => {
  return (
    <div class="flex items-center gap-4 mb-0">
      {creator?.coverUrl && (
        <div class="relative">
          <Avatar
            src={creator.coverUrl ?? ""}
            alt={creator.displayName ?? ""}
            // size={isMobile ? "md" : "md"}
            size="md"
          />
          <div class="absolute -top-2 -right-2">
            {creator?.ownerUserId && (
              <VerifiedCreator creator={creator} size="sm" />
            )}
          </div>
        </div>
      )}
      <div class="flex flex-col gap-0.5">
        <div class="text-xl md:text-4xl font-medium -mb-1">
          {creator?.displayName ?? title}
        </div>
        <div class="text-xs text-on-surface-weak flex items-center gap-2">
          {creator?.city ? `${creator.city}, ` : ""}
          {creator?.country ?? ""}
        </div>
      </div>
    </div>
  );
};

export default PageTitle;
