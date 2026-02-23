import { Creator } from "../../db/schema";
import Avatar from "./Avatar";
import Button from "./Button";
import VerifiedCreator from "./VerifiedCreator";
import { AuthUser } from "../../../types";
import { canEditCreator } from "../../lib/permissions";

type PageTitleProps = {
  title?: string;
  creator?: Creator;
  user?: AuthUser | null;
};

const PageTitle = ({ title, creator, user }: PageTitleProps) => {
  const canEdit = user && creator ? canEditCreator(user, creator) : false;
  return (
    <div class="flex items-center gap-4 mb-2">
      {creator?.coverUrl && (
        <div class="relative">
          <Avatar
            src={creator.coverUrl ?? ""}
            alt={creator.displayName ?? ""}
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
        {/* <Card.SubTitle>
          {creator?.city ? `${creator.city}, ` : ""}
          {creator?.country ?? ""}
        </Card.SubTitle> */}
      </div>
      {canEdit && (
        <a href={`/dashboard/admin/creators/edit/${creator?.id}`}>
          <Button variant="outline" color="secondary" width="sm">
            Edit
          </Button>
        </a>
      )}
    </div>
  );
};

export default PageTitle;
