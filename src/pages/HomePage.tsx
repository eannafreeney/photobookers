import AppLayout from "../components/layouts/AppLayout";
import { AuthUser, Flash } from "../../types";
import Tabs from "../components/app/Tabs";
import Page from "../components/layouts/Page";
import NavTabs from "../components/layouts/NavTabs";

type Props = {
  user: AuthUser | null;
  flash: Flash;
  initialTab: "new-books" | "feed" | "library";
  currentPath: string;
};

const HomePage = async ({
  user,
  flash,
  initialTab = "new-books",
  currentPath,
}: Props) => {
  console.log("currentPath in HomePage", currentPath);
  return (
    <AppLayout title="Books" user={user} flash={flash}>
      <Page>
        <NavTabs currentPath={currentPath} />
        {/* <Tabs initialTab={initialTab} /> */}
      </Page>
    </AppLayout>
  );
};

export default HomePage;
