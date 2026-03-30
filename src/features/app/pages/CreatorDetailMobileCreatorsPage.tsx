import { AuthUser } from "../../../../types";
import MobileCreatorCard from "../../../components/app/MobileCreatorCard";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import InfoPage from "../../../pages/InfoPage";
import CreatorNavTabs from "../components/CreatorNavTabs";
import CreatorsGrid from "../components/RelatedCreators";
import { getCreatorAndAssociatedCreatorsByCreatorSlugMobile } from "../services";

type CreatorDetailMobileCreatorsProps = {
  creatorSlug: string;
  user: AuthUser | null;
  currentPath: string;
};

const CreatorDetailMobileCreatorsPage = async ({
  creatorSlug,
  user,
  currentPath,
}: CreatorDetailMobileCreatorsProps) => {
  const [error, result] =
    await getCreatorAndAssociatedCreatorsByCreatorSlugMobile(creatorSlug);

  if (error) {
    return <InfoPage errorMessage={error.reason} user={user} />;
  }

  const { creator, associatedCreators } = result;

  return (
    <AppLayout
      title={creator?.displayName ?? ""}
      user={user}
      currentPath={currentPath}
      adminEditHref={`/dashboard/admin/creators/${creator.id}/update`}
    >
      <Page>
        <div class="flex flex-col gap-4">
          <MobileCreatorCard creator={creator} user={user} />
          <CreatorNavTabs
            showCreatorsTab={associatedCreators.length > 0}
            creator={creator}
            currentPath={currentPath}
          />
          <CreatorsGrid creators={associatedCreators} />
        </div>
      </Page>
    </AppLayout>
  );
};

export default CreatorDetailMobileCreatorsPage;
