import { AuthUser } from "../../../../types";
import CreatorCard from "../../../components/app/CreatorCard";
import MobileCreatorCard from "../../../components/app/MobileCreatorCard";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import InfoPage from "../../../pages/InfoPage";
import CreatorNavTabs from "../components/CreatorNavTabs";
import RelatedCreators from "../components/RelatedCreators";
import { getCreatorAboutBySlug } from "../services";

type Props = {
  currentPath: string;
  user: AuthUser | null;
  creatorSlug: string;
};

const CreatorDetailMobileAboutPage = async ({
  currentPath,
  user,
  creatorSlug,
}: Props) => {
  const [error, result] = await getCreatorAboutBySlug(creatorSlug);

  if (error) {
    return <InfoPage errorMessage={error.reason} user={user} />;
  }

  const { creator, relatedCreators } = result;

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
            showCreatorsTab={relatedCreators.length > 0}
            creator={creator}
            currentPath={currentPath}
          />
          <CreatorCard
            creator={creator}
            currentPath={currentPath}
            user={user}
            title=""
          />
          <RelatedCreators
            creators={relatedCreators}
            title="You may also like..."
          />
        </div>
      </Page>
    </AppLayout>
  );
};

export default CreatorDetailMobileAboutPage;
