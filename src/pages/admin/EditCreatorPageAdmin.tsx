import { AuthUser } from "../../../types";
import { Creator } from "../../db/schema";
import Page from "../../components/layouts/Page";
import CreatorImageForm from "../../components/cms/forms/CreatorCoverForm";
import AppLayout from "../../components/layouts/AppLayout";
import Breadcrumbs from "../../components/app/Breadcrumbs";
import CreatorBookList from "../../components/dashboard/BookList";
import EditCreatorFormAdmin from "../../components/cms/forms/EditCreatorFormAdmin";

type Props = {
  user: AuthUser;
  creator: Creator;
  currentPath: string;
  currentPage: number;
};

const EditCreatorPage = ({
  user,
  creator,
  currentPath,
  currentPage,
}: Props) => {
  const formValues = JSON.stringify({
    displayName: creator?.displayName,
    bio: creator?.bio,
    city: creator?.city,
    tagline: creator?.tagline,
    country: creator?.country,
    website: creator?.website,
    facebook: creator?.facebook,
    twitter: creator?.twitter,
    instagram: creator?.instagram,
    type: creator?.type ?? "artist",
  });

  return (
    <AppLayout
      title="Edit Creator Profile"
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <Breadcrumbs
          items={[
            {
              label: `Admin Creators Overview`,
              href: "/dashboard/admin/creators",
            },
            {
              label: `Edit ${creator.displayName}`,
            },
          ]}
        />
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div class="md:w-1/3">
            <CreatorImageForm
              initialUrl={creator?.coverUrl ?? null}
              creatorId={creator?.id}
            />
          </div>
          <div
            class="hidden md:block w-px shrink-0 bg-outline self-stretch"
            aria-hidden="true"
          />
          <hr class="my-4 md:hidden" />
          <div class="md:w-2/3">
            <EditCreatorFormAdmin
              formValues={formValues}
              creatorId={creator?.id}
              type={creator?.type}
            />
            <ManualAssignCreatorForm creatorId={creator.id} />
          </div>
        </div>
        <CreatorBookList
          creatorId={creator.id}
          creatorType={creator.type}
          currentPath={currentPath}
          currentPage={currentPage}
        />
      </Page>
    </AppLayout>
  );
};

export default EditCreatorPage;

const ManualAssignCreatorForm = ({ creatorId }: { creatorId: string }) => {
  return (
    <>
      <div class="mt-8 p-4 border border-outline rounded-lg">
        <h3 class="text-lg font-semibold mb-2">Assign creator to user</h3>
        <p class="text-sm text-base-content/70 mb-3">
          Assign this creator profile to an existing user (by email). They will
          own it without going through verification.
        </p>
        <form
          action={`/dashboard/admin/creators/edit/${creatorId}/assign`}
          method="post"
          class="flex flex-wrap items-end gap-3"
        >
          <input
            type="email"
            name="form.email"
            placeholder="User email"
            required
            class="input input-bordered input-sm w-48"
          />
          <input
            type="url"
            name="form.website"
            placeholder="https://their-website.com"
            required
            class="input input-bordered input-sm w-56"
          />
          <button type="submit" class="btn btn-primary btn-sm">
            Assign
          </button>
        </form>
      </div>
    </>
  );
};
