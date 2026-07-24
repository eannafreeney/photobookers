import Link from "../../../../../components/app/Link";
import { eyeIcon, eyeSlashIcon } from "../../../../../lib/icons";

type Props = {
  fairId: string;
  slug: string;
  status: "draft" | "published" | "cancelled";
};

const FairPreviewButton = ({ fairId, slug, status }: Props) => {
  const isPublic = status === "published";

  return (
    <div id={`fair-preview-${fairId}`}>
      <Link
        href={`/fairs/${slug}`}
        target="_blank"
        title={isPublic ? "View fair" : "Preview fair (admin)"}
      >
        <span class="cursor-pointer hover:text-accent">
          {isPublic ? eyeIcon() : eyeSlashIcon()}
        </span>
      </Link>
    </div>
  );
};

export default FairPreviewButton;
