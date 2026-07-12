import { AuthUser } from "../../../../types";
import FormDelete from "../../../components/forms/FormDelete";
import { Creator, CreatorMessage } from "../../../db/schema";

type CreatorMessageProps = {
  creator: Pick<Creator, "id" | "slug" | "displayName" | "coverUrl">;
  message: CreatorMessage;
  user: AuthUser | null;
  canReadMessages?: boolean;
};

const CreatorMessage = ({
  creator,
  message,
  user,
  canReadMessages = true,
}: CreatorMessageProps) => {
  const canDelete = user?.isAdmin || user?.creator?.id === creator.id;

  const redactClass = !canReadMessages
    ? "select-none blur-[3px] pointer-events-none"
    : "";

  return (
    <article class="rounded-radius border border-outline bg-surface p-4 shadow-sm">
      <header class="mb-3 flex items-center justify-between gap-3">
        <a href={`/creators/${creator.slug}`}>
          <div class="flex items-center gap-2 min-w-0">
            <img
              src={creator.coverUrl ?? ""}
              alt={creator.displayName}
              class="size-8 rounded-full object-cover"
            />
            <span class="truncate text-sm font-medium text-on-surface-strong">
              {creator.displayName}
            </span>
          </div>
        </a>
        <time class="shrink-0 text-xs text-on-surface">
          {message.createdAt
            ? new Date(message.createdAt).toLocaleDateString()
            : ""}
        </time>
        {canDelete && (
          <FormDelete
            action={`/dashboard/messages/${creator.id}/${message.id}`}
            {...{
              "x-target": "toast",
              "@ajax:before":
                "confirm('Delete this post?') || $event.preventDefault()",
              "@ajax:success": "$el.closest('article').remove()",
            }}
          >
            <button
              type="submit"
              class="shrink-0 text-xs text-danger hover:opacity-75 transition cursor-pointer"
            >
              Delete
            </button>
          </FormDelete>
        )}
      </header>
      <div class="relative">
        <div class={redactClass}>
          <p class="whitespace-pre-wrap text-sm text-on-surface">
            {message.body}
          </p>
          {message.imageUrl && (
            <div class="mt-3">
              <img
                src={message.imageUrl}
                alt="Post image"
                class="w-full rounded-radius object-cover border border-outline"
                loading="lazy"
              />
            </div>
          )}
        </div>

        {!canReadMessages && (
          <div class="absolute inset-0 grid place-items-center">
            <div class="rounded-full border border-outline bg-surface/90 px-3 py-1 text-xs font-medium text-on-surface-strong shadow-sm">
              Follow to unlock
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default CreatorMessage;
