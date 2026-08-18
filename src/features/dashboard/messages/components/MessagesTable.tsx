import Link from "../../../../components/app/Link";
import { CreatorMessage } from "../../../../db/schema";
import { formatDate } from "../../../../utils";
import { getMessagesByCreator } from "../services";
import { getPostLikeStats } from "../../../../domain/posts/likes";
import EditRowButton from "@/features/app/components/EditRowButton";
import DeleteRowButton from "@/features/app/components/DeleteRowButton";

type Props = {
  creatorId: string;
  isMobile?: boolean;
};

const alpineAttrs = {
  "x-init": "true",
  "@messages:updated.window":
    "$ajax('/dashboard/posts', { target: 'posts-table-container' })",
};

const MessagesTable = async ({ creatorId, isMobile = false }: Props) => {
  const [error, result] = await getMessagesByCreator(creatorId);
  const messages = error || !result ? [] : result.messages;
  const likeStats = await getPostLikeStats(messages.map((message) => message.id));

  if (messages.length === 0) {
    return (
      <div x-data id="posts-table-container" {...alpineAttrs}>
        <div class="rounded border border-outline bg-surface-alt p-6 text-sm text-on-surface">
          <p>No posts yet. Publish your first post above.</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <ul
        x-data
        id="posts-table-container"
        class="flex flex-col gap-4"
        {...alpineAttrs}
      >
        {messages.map((message) => (
          <MessageCard
            creatorId={creatorId}
            message={message}
            likeCount={likeStats.get(message.id)?.likeCount ?? 0}
          />
        ))}
      </ul>
    );
  }

  return (
    <div
      x-data
      id="posts-table-container"
      class="overflow-x-auto border border-outline"
      {...alpineAttrs}
    >
      <table class="w-full text-left text-sm">
        <thead class="border-b border-outline bg-surface-alt kicker text-on-surface-weak">
          <tr>
            <th class="px-4 py-3 font-medium">Date</th>
            <th class="px-4 py-3 font-medium">Image</th>
            <th class="px-4 py-3 font-medium">Body</th>
            <th class="px-4 py-3 font-medium">Likes</th>
            <th class="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <MessagesTableBody
          creatorId={creatorId}
          messages={messages}
          likeStats={likeStats}
        />
      </table>
    </div>
  );
};

type BodyProps = {
  creatorId: string;
  messages: CreatorMessage[];
  likeStats: Map<string, { likeCount: number }>;
};

export const MessagesTableBody = ({
  creatorId,
  messages,
  likeStats,
}: BodyProps) => (
  <tbody id="messages-table-body">
    {messages.map((message) => (
      <MessageTableRow
        creatorId={creatorId}
        message={message}
        likeCount={likeStats.get(message.id)?.likeCount ?? 0}
      />
    ))}
  </tbody>
);

const messageDateLabel = (message: CreatorMessage) =>
  message.createdAt ? formatDate(new Date(message.createdAt)) : "—";

const messageExcerpt = (body: string) =>
  body.length > 100 ? body.slice(0, 100) + "..." : body;

const MessageCard = ({
  creatorId,
  message,
  likeCount,
}: {
  creatorId: string;
  message: CreatorMessage;
  likeCount: number;
}) => {
  const editHref = `/dashboard/messages/${creatorId}/${message.id}`;

  return (
    <li class="rounded-radius border border-outline bg-surface overflow-hidden">
      <div class="flex flex-col gap-4 p-4">
        <div class="flex gap-3">
          {message.imageUrl ? (
            <img
              src={message.imageUrl}
              alt="Post image"
              class="h-20 w-14 shrink-0 object-cover rounded-sm"
            />
          ) : null}
          <div class="min-w-0 flex-1">
            <p class="text-sm text-on-surface-weak">
              {messageDateLabel(message)}
            </p>
            <p class="mt-1 text-sm text-on-surface line-clamp-3">
              {messageExcerpt(message.body)}
            </p>
          </div>
        </div>
        <dl class="grid grid-cols-[5.5rem_1fr] items-center gap-x-3 gap-y-3 text-sm">
          <dt class="text-on-surface-weak">Likes</dt>
          <dd class="tabular-nums">{likeCount}</dd>
        </dl>
        <div class="flex flex-wrap justify-evenly items-center gap-2 border-t border-outline pt-3">
          <EditRowButton href={editHref} xTarget="modal-root" />
          <DeleteRowButton
            action={`/dashboard/messages/${creatorId}/${message.id}`}
            confirm="Delete this post?"
            {...{
              "x-target": "toast messages-table-body",
              "@ajax:success": "$dispatch('messages:updated')",
            }}
          />
        </div>
      </div>
    </li>
  );
};

type RowProps = {
  creatorId: string;
  message: CreatorMessage;
  likeCount: number;
};

const MessageTableRow = ({ creatorId, message, likeCount }: RowProps) => {
  const editHref = `/dashboard/messages/${creatorId}/${message.id}`;

  return (
    <tr class="border-b border-outline last:border-0">
      <td class="px-4 py-3">
        <Link href={editHref} xTarget="modal-root" hoverUnderline>
          {messageDateLabel(message)}
        </Link>
      </td>
      <td class="px-4 py-3">
        {message.imageUrl ? (
          <img
            src={message.imageUrl}
            alt="Post image"
            class="h-12 w-12 rounded-radius border border-outline object-cover"
          />
        ) : (
          <span class="text-on-surface-weak">—</span>
        )}
      </td>
      <td class="px-4 py-3">
        <span class="text-on-surface-weak">
          {messageExcerpt(message.body)}
        </span>
      </td>
      <td class="px-4 py-3 tabular-nums">{likeCount}</td>
      <td class="px-4 py-3 text-right">
        <div class="flex items-center justify-end gap-2">
          <EditRowButton href={editHref} xTarget="modal-root" />
          <DeleteRowButton
            action={`/dashboard/messages/${creatorId}/${message.id}`}
            confirm="Delete this post?"
            {...{
              "x-target": "toast messages-table-body",
              "@ajax:success": "$dispatch('messages:updated')",
            }}
          />
        </div>
      </td>
    </tr>
  );
};

export default MessagesTable;
