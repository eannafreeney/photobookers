import AppLayout from "../components/layouts/AppLayout";
import { AuthUser, Flash } from "../../types";
import Tabs from "../components/app/Tabs";
import Page from "../components/layouts/Page";

type Props = {
  user: AuthUser | null;
  flash: Flash;
  initialTab: "new-books" | "feed" | "profile";
};

const HomePage = async ({ user, flash, initialTab = "new-books" }: Props) => (
  <AppLayout title="Books" user={user} flash={flash}>
    <Page>
      <Tabs initialTab={initialTab} />
    </Page>
  </AppLayout>
);

export default HomePage;
