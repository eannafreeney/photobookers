import AppLayout from "../../../../../components/layouts/AppLayout";
import Page from "../../../../../components/layouts/Page";
import NavTabs from "../../components/NavTabs";
import SectionTitle from "../../../../../components/app/SectionTitle";
import { CreatorsTable } from "../components/CreatorsTable";
import { AuthUser } from "../../../../../../types";

type Props = {
  user: AuthUser;
  searchQuery?: string;
};

const CreatorsOverviewPageAdmin = ({ user, searchQuery }: Props) => {
  return (
    <AppLayout title="New Creator" user={user}>
      <Page>
        <NavTabs currentPath="/dashboard/admin/creators" />
        <SectionTitle>Creators</SectionTitle>
        {/* <CreatorFormAdmin /> */}
        <CreatorsTable searchQuery={searchQuery} />
      </Page>
    </AppLayout>
  );
};
export default CreatorsOverviewPageAdmin;
