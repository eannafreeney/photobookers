import { AuthUser } from "../../../../types";
import Avatar from "../../../components/app/Avatar";
import Card from "../../../components/app/Card";
import GridPanel from "../../../components/app/GridPanel";
import Link from "../../../components/app/Link";
import PageTitle from "../../../components/app/PageTitle";
import { Pagination } from "../../../components/app/Pagination";
import VerifiedCreator from "../../../components/app/VerifiedCreator";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import { Creator } from "../../../db/schema";
import ErrorPage from "../../../pages/error/errorPage";
import CreatorCardSquare from "../components/CreatorCardSquare";
import { getAllCreatorsByType } from "../services";

type Props = {
  type: "artist" | "publisher";
  currentPage: number;
  user: AuthUser | null;
};

const CreatorsPage = async ({ type, currentPage, user }: Props) => {
  const { creators } = await getAllCreatorsByType(type, currentPage, 50);

  if (!creators) {
    return <ErrorPage errorMessage="Artists not found" />;
  }

  const title = type === "artist" ? "Artists" : "Publishers";

  return (
    <AppLayout title={title} user={user}>
      <Page>
        <PageTitle title={title} />
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {creators.map((creator) => (
            <CreatorCardSquare creator={creator} />
          ))}
        </div>
      </Page>
    </AppLayout>
  );
};

export default CreatorsPage;
