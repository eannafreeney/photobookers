import { AuthUser } from "../../../../types";
import FormDelete from "../../../components/forms/FormDelete";
import { Creator, CreatorMessage } from "../../../db/schema";

type CreatorMessageProps = {
  creator: Pick<Creator, "id" | "slug" | "displayName" | "coverUrl">;
  message: CreatorMessage;
  isFirst: boolean;
  user: AuthUser | null;
  canReadMessages: boolean;
};

const CreatorMessage = ({
  creator,
  message,
  isFirst,
  user,
  canReadMessages,
}: CreatorMessageProps) => {
  const canDelete = user?.isAdmin || user?.creator?.id === creator.id;

  const redactClass = !canReadMessages
    ? "select-none blur-[3px] pointer-events-none"
    : "";

  return (
    <article
      class="rounded-radius border border-outline bg-surface p-4 shadow-sm"
      x-data={`{ isExpanded: ${isFirst ? "true" : "false"} }`}
    >
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
          {/* collapsed preview — always visible */}
          <p
            class="whitespace-pre-wrap text-sm text-on-surface line-clamp-2"
            x-show="!isExpanded"
          >
            {message.body}
          </p>

          {/* expanded content */}
          <div x-cloak x-show="isExpanded" x-collapse>
            <p class="whitespace-pre-wrap text-sm text-on-surface">
              {message.body}
            </p>
            {message.imageUrls && message.imageUrls.length > 0 && (
              <div class="mt-3 flex flex-col gap-2">
                {message.imageUrls.map((url, idx) => (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block"
                  >
                    <img
                      src={url}
                      alt={`Post image ${idx + 1}`}
                      class="w-full rounded-radius object-cover border border-outline"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
        {!canReadMessages && (
          <div class="absolute inset-0 grid place-items-center">
            <div class="rounded-full border border-outline bg-surface/90 px-3 py-1 text-xs font-medium text-on-surface-strong shadow-sm">
              Follow to unlock
            </div>
          </div>
        )}
      </div>
      <button
        type="button"
        class="mt-2 flex items-center gap-1 text-xs text-on-surface hover:text-on-surface-strong transition cursor-pointer"
        x-on:click="isExpanded = !isExpanded"
        x-bind:aria-expanded="isExpanded ? 'true' : 'false'"
      >
        <span x-text="isExpanded ? 'Show less' : 'Show more'"></span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke-width="2"
          stroke="currentColor"
          class="size-3 transition"
          x-bind:class="isExpanded ? 'rotate-180' : ''"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>
    </article>
  );
};

export default CreatorMessage;
