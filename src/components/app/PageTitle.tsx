import { Creator } from "../../db/schema";
import { useMediaQuery } from "../../lib/device";
import Avatar from "./Avatar";
import VerifiedCreator from "./VerifiedCreator";

type PageTitleProps = {
  title?: string;
  creator?: Creator;
};

const PageTitle = ({ title, creator }: PageTitleProps) => {
  const isMobile = useMediaQuery("(max-width: 767px)"); // or "(max-width: 768px)"

  return (
    <div class="flex items-center gap-3">
      {creator?.coverUrl && (
        <div class="relative">
          <Avatar
            src={creator.coverUrl ?? ""}
            alt={creator.displayName ?? ""}
            size={isMobile ? "sm" : "md"}
          />

          <div class="absolute -top-2 -right-2">
            {creator?.ownerUserId && (
              <VerifiedCreator creator={creator} size="sm" />
            )}
          </div>
        </div>
      )}
      <div class="text-xl md:text-4xl font-medium">
        {creator?.displayName ?? title}
      </div>
      {/* <div>{creator?.ownerUserId && <VerifiedCreator creator={creator} />}</div> */}
    </div>
  );
};

export default PageTitle;
