import { AuthUser } from "../../../../types";
import PageTitle from "../../../components/app/PageTitle";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import ErrorPage from "../../../pages/error/errorPage";
import CreatorsCircle from "../components/CreatorsCircle";
import { getAllCreatorsByType } from "../services";

type Props = {
  type: "artist" | "publisher";
  currentPage: number;
  user: AuthUser | null;
  currentPath: string;
};

const CreatorsPage = async ({
  type,
  currentPage,
  user,
  currentPath,
}: Props) => {
  const { creators } = await getAllCreatorsByType(type, currentPage);

  if (!creators) {
    return <ErrorPage errorMessage="Artists not found" />;
  }

  const title = type === "artist" ? "Artists" : "Publishers";

  return (
    <AppLayout title={title} user={user} currentPath={currentPath}>
      <Page>
        <PageTitle title={title} />
        <div class="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-6">
          {creators.map((creator) => (
            <CreatorsCircle creator={creator} />
          ))}
        </div>
      </Page>
    </AppLayout>
  );
};

export default CreatorsPage;
