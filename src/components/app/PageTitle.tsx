import { Creator } from "../../db/schema";
import { useMediaQuery } from "../../lib/device";
import Avatar from "./Avatar";

type PageTitleProps = {
  title?: string;
  creator?: Creator;
};

const PageTitle = ({ title, creator }: PageTitleProps) => {
  const isMobile = useMediaQuery("(max-width: 767px)"); // or "(max-width: 768px)"
  // console.log(isMobile);

  return (
    <div class="flex items-center gap-2">
      {creator?.coverUrl && (
        <Avatar
          src={creator.coverUrl ?? ""}
          alt={creator.displayName ?? ""}
          size={isMobile ? "sm" : "md"}
        />
      )}
      <div class="text-xl md:text-4xl font-medium my-4">
        {creator?.displayName ?? title}
      </div>
    </div>
  );
};

export default PageTitle;
