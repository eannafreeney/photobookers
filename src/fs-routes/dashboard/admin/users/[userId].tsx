import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "../../../../lib/validator";
import { userIdSchema } from "../../../../schemas";
import { getUser } from "../../../../utils";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import PageTitle from "../../../../components/app/PageTitle";
import SectionTitle from "../../../../components/app/SectionTitle";
import Card from "../../../../components/app/Card";
import Link from "../../../../components/app/Link";
import Alert from "../../../../components/app/Alert";
import {
  deleteUserByIdAdmin,
  getUserByIdAdmin,
  updateUserAdmin,
} from "../../../../features/dashboard/admin/users/services";
import { editUserFormAdminSchema } from "../../../../features/dashboard/admin/users/schema";
import { EditUserFormContext } from "../../../../features/dashboard/admin/users/types";
import EditUserFormAdmin from "../../../../features/dashboard/admin/users/forms/EditUserFormAdmin";
import InfoPage from "../../../../pages/InfoPage";
import { dispatchEvents } from "../../../../lib/disatchEvents";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import ResetUserPasswordButton from "../../../../features/dashboard/admin/users/components/ResetUserPasswordButton";
import CollectorPostsTable from "../../../../features/collectors/components/CollectorPostsTable";
import { formatDate } from "../../../../utils";

export const GET = createRoute(paramValidator(userIdSchema), async (c) => {
  const userId = c.req.valid("param").userId;
  const sessionUser = await getUser(c);
  const currentPath = c.req.path;

  const [error, viewedUser] = await getUserByIdAdmin(userId, {
    withActivity: true,
  });

  if (error || !viewedUser)
    return c.html(
      <InfoPage
        errorMessage={error?.reason ?? "User not found"}
        user={sessionUser}
      />,
    );

  const likedBooks = viewedUser?.likedBooks ?? [];
  const wishlistedBooks = viewedUser?.wishlistedBooks ?? [];
  const collectedBooks = viewedUser?.collectedBooks ?? [];
  const followedCreators = viewedUser?.followedCreators ?? [];
  const formValues = {
    email: viewedUser.email,
    firstName: viewedUser.firstName ?? "",
    lastName: viewedUser.lastName ?? "",
  };

  return c.html(
    <AppLayout
      title="Edit User"
      user={sessionUser}
      currentPath={currentPath}
    >
      <Page>
        <PageTitle title={viewedUser?.email} user={sessionUser} />
        <div class="mb-6 flex flex-wrap items-center gap-3">
          <ResetUserPasswordButton userId={userId} />
        </div>
        <EditUserFormAdmin formValues={formValues} userId={userId} />
        <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-semibold">Created:</span>{" "}
            <span>{formatDate(viewedUser.createdAt)}</span>
          </div>
          <div>
            <span class="font-semibold">Updated:</span>{" "}
            <span>
              {viewedUser.updatedAt
                ? formatDate(viewedUser.updatedAt)
                : "—"}
            </span>
          </div>
          <div>
            <span class="font-semibold">Must reset password:</span>{" "}
            <span>{viewedUser.mustResetPassword ? "Yes" : "No"}</span>
          </div>
          <div>
            <span class="font-semibold">Accepts terms:</span>{" "}
            <span>{viewedUser.acceptsTerms ? "Yes" : "No"}</span>
          </div>
        </div>
        <SectionTitle className="mb-4 mt-8">Creator profiles</SectionTitle>
        {viewedUser?.creators.length === 0 ? (
          <p class="text-sm text-on-surface/65">No creator profiles linked.</p>
        ) : (
          <ul class="flex flex-col gap-3">
            {viewedUser?.creators.map((c) => (
              <li>
                <Card>
                  <Card.Body>
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div class="min-w-0">
                        <p class="font-semibold text-on-surface truncate">
                          {c.displayName}
                        </p>
                        <p class="text-xs text-on-surface/65 font-mono truncate">
                          {c.slug}
                        </p>
                      </div>
                      <Link
                        href={`/dashboard/admin/creators/${c.id}`}
                        className="shrink-0 text-sm"
                        hoverUnderline
                      >
                        Edit creator
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </li>
            ))}
          </ul>
        )}
        <SectionTitle className="mb-4">Books liked</SectionTitle>
        {likedBooks?.length === 0 ? (
          <p class="text-sm text-on-surface/65">No liked books.</p>
        ) : (
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {viewedUser?.likedBooks.map((b) => (
              <Card>
                <Card.Image
                  src={b.coverUrl ?? ""}
                  alt={b.title}
                  href={`/books/${b.slug}`}
                  objectCover
                />
                <Card.Body>
                  <Link href={`/books/${b.slug}`}>
                    <Card.Title>{b.title}</Card.Title>
                  </Link>
                  {b.artist?.displayName && (
                    <Card.Text>{b.artist.displayName}</Card.Text>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        <SectionTitle className="mb-4">Books favourited</SectionTitle>
        {wishlistedBooks.length === 0 ? (
          <p class="text-sm text-on-surface/65">No favourited books.</p>
        ) : (
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {wishlistedBooks.map((b) => (
              <Card>
                <Card.Image
                  src={b.coverUrl ?? ""}
                  alt={b.title}
                  href={`/books/${b.slug}`}
                  objectCover
                />
                <Card.Body>
                  <Link href={`/books/${b.slug}`}>
                    <Card.Title>{b.title}</Card.Title>
                  </Link>
                  {b.artist?.displayName && (
                    <Card.Text>{b.artist.displayName}</Card.Text>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        <SectionTitle className="mb-4">Books collected</SectionTitle>
        {collectedBooks.length === 0 ? (
          <p class="text-sm text-on-surface/65">No collected books.</p>
        ) : (
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {collectedBooks.map((b) => (
              <Card>
                <Card.Image
                  src={b.coverUrl ?? ""}
                  alt={b.title}
                  href={`/books/${b.slug}`}
                  objectCover
                />
                <Card.Body>
                  <Link href={`/books/${b.slug}`}>
                    <Card.Title>{b.title}</Card.Title>
                  </Link>
                  {b.artist?.displayName && (
                    <Card.Text>{b.artist.displayName}</Card.Text>
                  )}
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        <SectionTitle className="mb-4">Creators followed</SectionTitle>
        {followedCreators.length === 0 ? (
          <p class="text-sm text-on-surface/65">Not following any creators.</p>
        ) : (
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {followedCreators.map((c) => (
              <Card>
                <Card.Image
                  src={c.coverUrl ?? ""}
                  alt={c.displayName}
                  href={`/dashboard/admin/creators/${c.id}/update`}
                  aspectSquare
                  objectCover
                />
                <Card.Body>
                  <Link href={`/dashboard/admin/creators/${c.id}/update`}>
                    <Card.Title>{c.displayName}</Card.Title>
                  </Link>
                  <Card.Text>{c.slug}</Card.Text>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        <SectionTitle className="mb-4 mt-8">Collector posts</SectionTitle>
        <CollectorPostsTable userId={userId} />
      </Page>
    </AppLayout>,
  );
});

export const POST = createRoute(
  paramValidator(userIdSchema),
  formValidator(editUserFormAdminSchema),
  async (c: EditUserFormContext) => {
    const userId = c.req.valid("param").userId;
    const formData = c.req.valid("form");

    const [updateError] = await updateUserAdmin(userId, formData);
    if (updateError) return showErrorAlert(c, updateError.reason);

    return c.html(<Alert type="success" message="User updated!" />);
  },
);

export const DELETE = createRoute(paramValidator(userIdSchema), async (c) => {
  const userId = c.req.valid("param").userId;
  const [err] = await deleteUserByIdAdmin(userId);
  if (err) return showErrorAlert(c, err.reason);

  return c.html(
    <>
      <Alert type="success" message="User deleted!" />
      {dispatchEvents(["users:updated"])}
    </>,
  );
});
