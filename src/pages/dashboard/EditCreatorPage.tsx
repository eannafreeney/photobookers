import { AuthUser } from "../../../types";
import { Creator } from "../../db/schema";
import CreatorForm from "../../components/cms/forms/CreatorForm";
import SectionTitle from "../../components/app/SectionTitle";
import Page from "../../components/layouts/Page";
import CreatorImageForm from "../../components/cms/forms/CreatorImageForm";
import AppLayout from "../../components/layouts/AppLayout";
import Breadcrumbs from "../../components/app/Breadcrumbs";

type Props = { user: AuthUser; creator: Creator };

const EditCreatorPage = ({ user, creator }: Props) => {
  const formValues = JSON.stringify({
    displayName: creator?.displayName,
    bio: creator?.bio,
    city: creator?.city,
    country: creator?.country,
    website: creator?.website,
    facebook: creator?.facebook,
    twitter: creator?.twitter,
    instagram: creator?.instagram,
    type: creator?.type ?? "artist",
  });

  return (
    <AppLayout title="Edit Creator Profile" user={user}>
      <Page>
        <Breadcrumbs
          items={[
            {
              label: `Dashboard`,
              href: "/dashboard/books",
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
          <hr class="my-4 md:hidden" />
          <div class="md:w-2/3">
            <CreatorForm
              formValues={formValues}
              creatorId={creator?.id}
              type={creator?.type}
            />
          </div>
        </div>
      </Page>
    </AppLayout>
  );
};

export default EditCreatorPage;
