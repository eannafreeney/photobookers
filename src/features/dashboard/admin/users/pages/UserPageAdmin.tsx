import AppLayout from "../../../../../components/layouts/AppLayout";
import Page from "../../../../../components/layouts/Page";
import { getUserByIdAdmin } from "../services";
import InfoPage from "../../../../../pages/InfoPage";
import { AuthUser } from "../../../../../../types";
import PageTitle from "../../../../../components/app/PageTitle";
import Card from "../../../../../components/app/Card";
import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";

type Props = {
  userId: string;
  user: AuthUser;
};

const UserPageAdmin = async ({ userId, user: sessionUser }: Props) => {
  const [error, viewedUser] = await getUserByIdAdmin(userId, {
    withActivity: true,
  });

  if (error)
    return <InfoPage errorMessage={error?.reason} user={sessionUser} />;

  const likedBooks = viewedUser?.likedBooks ?? [];
  const wishlistedBooks = viewedUser?.wishlistedBooks ?? [];
  const collectedBooks = viewedUser?.collectedBooks ?? [];
  const followedCreators = viewedUser?.followedCreators ?? [];

  return (
    <AppLayout title="Admin Dashboard" user={sessionUser}>
      <Page>
        <PageTitle title={viewedUser?.email} user={sessionUser} />
        <div>
          <div>
            <span>Email:</span>
            <span>{viewedUser?.email}</span>
          </div>
          <div>
            <span>First Name:</span>
            <span>{viewedUser?.firstName}</span>
          </div>
          <div>
            <span>Last Name:</span>
            <span>{viewedUser?.lastName}</span>
          </div>
          <div>
            <span>Created At:</span>
            <span>{viewedUser?.createdAt}</span>
          </div>
          <div>
            <span>Updated At:</span>
            <span>{viewedUser?.updatedAt}</span>
          </div>
          <div>
            <span>Must Reset Password:</span>
            <span>{viewedUser?.mustResetPassword ? "Yes" : "No"}</span>
          </div>
          <div>
            <span>Accepts Terms:</span>
            <span>{viewedUser?.acceptsTerms ? "Yes" : "No"}</span>
          </div>
          <SectionTitle className="mb-4">Creator profiles</SectionTitle>
          {viewedUser?.creators.length === 0 ? (
            <p class="text-sm text-on-surface/65">
              No creator profiles linked.
            </p>
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
                          href={`/dashboard/admin/creators/${c.id}/update`}
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
        </div>
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

        <SectionTitle className="mb-4">Books wishlisted</SectionTitle>
        {wishlistedBooks.length === 0 ? (
          <p class="text-sm text-on-surface/65">No wishlisted books.</p>
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
      </Page>
    </AppLayout>
  );
};

export default UserPageAdmin;
