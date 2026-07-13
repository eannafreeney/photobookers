import Table from "../../../../components/app/Table";
import Link from "../../../../components/app/Link";
import Button from "../../../../components/app/Button";
import SectionTitle from "../../../../components/app/SectionTitle";
import { CreatorMessage } from "../../../../db/schema";
import { formatDate } from "../../../../utils";
import { getMessagesByCreator } from "../services";
import DeleteMessageForm from "./DeleteMessageForm";

type Props = {
  creatorId: string;
};

const tableBodyAttrs = {
  "x-init": true,
  "@messages:updated.window":
    "$ajax('/dashboard/messages', { target: 'messages-table-body' })",
};

const MessagesTable = async ({ creatorId }: Props) => {
  const [error, result] = await getMessagesByCreator(creatorId);
  const messages = error || !result ? [] : result.messages;

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Your posts</SectionTitle>
      <Table id="messages-table">
        <Table.Head>
          <tr>
            <Table.HeadRow>Date</Table.HeadRow>
            <Table.HeadRow>Image</Table.HeadRow>
            <Table.HeadRow>Actions</Table.HeadRow>
          </tr>
        </Table.Head>
        <MessagesTableBody creatorId={creatorId} messages={messages} />
      </Table>
    </div>
  );
};

type BodyProps = {
  creatorId: string;
  messages: CreatorMessage[];
};

export const MessagesTableBody = ({ creatorId, messages }: BodyProps) => (
  <Table.Body id="messages-table-body" {...tableBodyAttrs}>
    {messages.length === 0 ? (
      <tr>
        <td
          colspan={3}
          class="px-4 py-6 text-sm text-on-surface text-center"
        >
          No posts yet. Publish your first post above.
        </td>
      </tr>
    ) : (
      messages.map((message) => (
        <MessageTableRow creatorId={creatorId} message={message} />
      ))
    )}
  </Table.Body>
);

type RowProps = {
  creatorId: string;
  message: CreatorMessage;
};

const MessageTableRow = ({ creatorId, message }: RowProps) => {
  const editHref = `/dashboard/messages/${creatorId}/${message.id}`;
  const dateLabel = message.createdAt
    ? formatDate(new Date(message.createdAt))
    : "—";

  return (
    <tr>
      <Table.BodyRow>
        <Link href={editHref} xTarget="modal-root" hoverUnderline>
          {dateLabel}
        </Link>
      </Table.BodyRow>
      <Table.BodyRow>
        {message.imageUrl ? (
          <img
            src={message.imageUrl}
            alt="Post image"
            class="h-12 w-12 rounded-radius border border-outline object-cover"
          />
        ) : (
          <span class="text-on-surface-weak">—</span>
        )}
      </Table.BodyRow>
      <Table.BodyRow>
        <div class="flex items-center gap-2">
          <a href={editHref} x-target="modal-root">
            <Button variant="outline" color="inverse">
              <span>Edit</span>
            </Button>
          </a>
          <DeleteMessageForm creatorId={creatorId} messageId={message.id} />
        </div>
      </Table.BodyRow>
    </tr>
  );
};

export default MessagesTable;
