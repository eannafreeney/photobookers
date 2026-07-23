import Table from "../../../components/app/Table";
import Button from "../../../components/app/Button";
import SectionTitle from "../../../components/app/SectionTitle";
import FormDelete from "../../../components/forms/FormDelete";
import { CollectorPost } from "../../../db/schema";
import { formatDate } from "../../../utils";
import { listCollectorPosts } from "../../../db/queries";

type Props = {
  userId: string;
};

const CollectorPostsTable = async ({ userId }: Props) => {
  const posts = await listCollectorPosts(userId);

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Your posts</SectionTitle>
      <Table id="collector-posts-table">
        <Table.Head>
          <tr>
            <Table.HeadRow>Date</Table.HeadRow>
            <Table.HeadRow>Image</Table.HeadRow>
            <Table.HeadRow>Body</Table.HeadRow>
          </tr>
        </Table.Head>
        <CollectorPostsTableBody posts={posts} />
      </Table>
    </div>
  );
};

type BodyProps = {
  posts: CollectorPost[];
};

export const CollectorPostsTableBody = ({ posts }: BodyProps) => (
  <Table.Body id="collector-posts-table-body">
    {posts.length === 0 ? (
      <tr>
        <td colspan={4} class="px-4 py-6 text-sm text-on-surface text-center">
          No posts yet. Publish your first post above.
        </td>
      </tr>
    ) : (
      posts.map((post) => <CollectorPostRow post={post} />)
    )}
  </Table.Body>
);

const CollectorPostRow = ({ post }: { post: CollectorPost }) => {
  const dateLabel = post.createdAt
    ? formatDate(new Date(post.createdAt))
    : "—";

  return (
    <tr>
      <Table.BodyRow>{dateLabel}</Table.BodyRow>
      <Table.BodyRow>
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt="Post image"
            class="h-12 w-12 rounded-radius border border-outline object-cover"
          />
        ) : (
          <span class="text-on-surface-weak">—</span>
        )}
      </Table.BodyRow>
      <Table.BodyRow>
        <span class="text-on-surface-weak">
          {post.body.length > 100 ? post.body.slice(0, 100) + "..." : post.body}
        </span>
      </Table.BodyRow>
      <Table.BodyRow>
        <div class="flex items-center justify-end gap-2">
          <FormDelete
            action={`/dashboard/posts/${post.id}`}
            {...{
              "x-target": "toast collector-posts-table-body",
              "@ajax:before":
                "confirm('Delete this post?') || $event.preventDefault()",
            }}
          >
            <Button variant="outline" color="danger">
              <span>Delete</span>
            </Button>
          </FormDelete>
        </div>
      </Table.BodyRow>
    </tr>
  );
};

export default CollectorPostsTable;
