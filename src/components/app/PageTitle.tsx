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
    <div class="hidden md:flex items-center gap-4 mb-8 border-b border-outline pb-4">
      {creator?.coverUrl && (
        <div class="relative">
          <Avatar
            src={creator.coverUrl ?? ""}
            alt={creator.displayName ?? ""}
            size="md"
          />
          <div class="absolute -top-2 -right-2">
            <VerifiedCreator
              creatorStatus={creator.status ?? "stub"}
              size="sm"
            />
          </div>
        </div>
      )}
      <div class="flex flex-col gap-0.5">
        <div class="font-display text-3xl md:text-5xl font-medium text-on-surface-strong -mb-1">
          {creator?.displayName ?? title}
        </div>
      </div>
      {canEdit && (
        <a href={`/dashboard/admin/creators/${creator?.id}`}>
          <Button variant="outline" color="secondary" width="sm">
            Edit
          </Button>
        </a>
      )}
    </div>
  );
};

export default PageTitle;
