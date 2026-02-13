import { Creator } from "../../db/schema";
import { useMediaQuery } from "../../lib/device";
import Avatar from "./Avatar";

type PageTitleProps = {
  title?: string;
  creator?: Creator;
};

const PageTitle = ({ title, creator }: PageTitleProps) => {
  const isMobile = useMediaQuery("(max-width: 767px)"); // or "(max-width: 768px)"

  return (
    <div class="flex items-center gap-2">
      {creator?.coverUrl && (
        <Avatar
          src={creator.coverUrl ?? ""}
          alt={creator.displayName ?? ""}
          size={isMobile ? "sm" : "md"}
        />
      )}
      <div class="flex flex-col gap-2">
        <div class="text-xl md:text-4xl font-medium my-4">
          {creator?.displayName ?? title}
        </div>
        <div class="text-sm text-gray-500">
          {creator?.city ? `${creator.city}, ` : ""}
          {creator?.country ?? ""}
        </div>
      </div>
    </div>
  );
};

export default PageTitle;
