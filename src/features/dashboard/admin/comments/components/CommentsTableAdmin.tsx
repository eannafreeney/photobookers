import Link from "../../../../../components/app/Link";
import Table from "../../../../../components/app/Table";
import { InfiniteScroll } from "../../../../../components/app/InfiniteScroll";
import { formatDate } from "../../../../../utils";
import { getAdminComments } from "../services";
import Button from "../../../../../components/app/Button";
import FormDelete from "../../../../../components/forms/FormDelete";
import { deleteIcon } from "../../../../../lib/icons";
import { deleteRowAttrs } from "@/lib/utils";
import { getDisplayName } from "../../../../app/services";

type Props = {
  currentPath: string;
  currentPage: number;
  searchQuery?: string;
};

const CommentsTableAdmin = async ({
  currentPath,
  currentPage,
  searchQuery,
}: Props) => {
  const [error, result] = await getAdminComments(currentPage, searchQuery);

  if (error) return <div>Error: {error.reason}</div>;
  if (!result?.comments) return <div>No comments found</div>;

  const { comments, totalPages, page } = result;
  const targetId = "comments-table-body";

  return (
    <div x-data>
      <div
        id="comments-table-container"
        class="flex flex-col gap-4"
        x-ref="paginationContent"
      >
        <Table id="comments-table">
          <Table.Head>
            <tr>
              <Table.HeadRow>Comment</Table.HeadRow>
              <Table.HeadRow>Book</Table.HeadRow>
              <Table.HeadRow>User</Table.HeadRow>
              <Table.HeadRow>Created</Table.HeadRow>
              <Table.HeadRow>Actions</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body id={targetId} xMerge="append">
            {comments.map((comment) => (
              <tr key={comment.id}>
                <Table.BodyRow>
                  <span class="line-clamp-2 max-w-md">{comment.body}</span>
                </Table.BodyRow>
                <Table.BodyRow>
                  {comment.book ? (
                    <Link href={`/books/${comment.book.slug}`} target="_blank">
                      {comment.book.title}
                    </Link>
                  ) : (
                    "-"
                  )}
                </Table.BodyRow>
                <Table.BodyRow>
                  <div class="text-sm">{getDisplayName(comment.user)}</div>
                  <div class="text-xs text-on-surface-weak">
                    {comment.user?.email ?? ""}
                  </div>
                </Table.BodyRow>
                <Table.BodyRow>
                  {comment.createdAt ? formatDate(comment.createdAt) : "-"}
                </Table.BodyRow>
                <Table.BodyRow>
                  <div class="flex items-center gap-2">
                    <a href={`/dashboard/admin/comments/${comment.id}`}>
                      <Button variant="outline" color="inverse">
                        <span>Edit</span>
                      </Button>
                    </a>
                    <FormDelete
                      action={`/dashboard/admin/comments/${comment.id}`}
                      {...deleteRowAttrs}
                    >
                      <button
                        type="submit"
                        class="cursor-pointer hover:text-red-500"
                      >
                        {deleteIcon}
                      </button>
                    </FormDelete>
                  </div>
                </Table.BodyRow>
              </tr>
            ))}
          </Table.Body>
        </Table>
        <InfiniteScroll
          baseUrl={currentPath}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
        />
      </div>
    </div>
  );
};

export default CommentsTableAdmin;
