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
import { getAllCreatorsByType } from "../../../services/creators";

type Props = {
  type: "artist" | "publisher";
  currentPath: string;
  currentPage: number;
};

const CreatorsPage = async ({ type, currentPath, currentPage }: Props) => {
  const { creators, totalPages, page } = await getAllCreatorsByType(
    type,
    currentPage,
  );

  if (!creators) {
    return <ErrorPage errorMessage="Artists not found" />;
  }

  const title = type === "artist" ? "Artists" : "Publishers";
  const targetId = `creators-grid-${type}`;

  return (
    <AppLayout title={title}>
      <Page>
        <PageTitle title={title} />
        <GridPanel id={targetId} xMerge="append">
          {creators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </GridPanel>
        <Pagination
          baseUrl={currentPath}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
        />
      </Page>
    </AppLayout>
  );
};

export default CreatorsPage;

const CreatorCard = ({ creator }: { creator: Creator }) => (
  <Link href={`/creators/${creator.slug}`}>
    <div class="flex items-center gap-2">
      <div class="relative">
        <Avatar
          src={creator.coverUrl ?? ""}
          alt={creator.displayName ?? ""}
          size="md"
        />
        <div class="absolute -top-1 -right-1">
          {creator?.ownerUserId && (
            <VerifiedCreator creator={creator} size="xs" />
          )}
        </div>
      </div>
      <Card.SubTitle>{creator.displayName}</Card.SubTitle>
    </div>
  </Link>
);
