import ScrollReveal from "../../../components/app/ScrollReveal";
import SectionTitle from "../../../components/app/SectionTitle";
import { capitalize } from "../../../utils";
import { getCreatorsByCreatorId } from "../services";
import ListNavigation from "./ListNavigation";
import SpotlightCreatorLink from "./SpotlightCreatorLink";

type Props = {
  creatorId: string;
  creatorType: "artist" | "publisher";
  title?: string;
  currentPath: string;
  currentPage: number;
  pageParam?: string;
};

const CreatorsGrid = async ({
  creatorId,
  creatorType,
  title,
  currentPath,
  currentPage,
  pageParam,
}: Props) => {
  const [error, result] = await getCreatorsByCreatorId(
    creatorId,
    creatorType,
    currentPage,
  );
  if (error) return <></>;
  const { creators, totalPages, page } = result;
  if (!creators) return <></>;
  if (creators.length === 0) return <></>;

  const targetId = `creators-grid-${creatorId}`;

  return (
    <section>
      {title && <SectionTitle>{title}</SectionTitle>}
      <div id={targetId} x-merge="append">
        {creators.map((creator) => (
          <ScrollReveal>
            <SpotlightCreatorLink
              creator={creator}
              role={capitalize(creator.type)}
            />
          </ScrollReveal>
        ))}
      </div>
      <ListNavigation
        isInfiniteScroll
        targetId={targetId}
        totalPages={totalPages}
        page={page}
        currentPath={currentPath}
        pageParam={pageParam}
      />
    </section>
  );
};

export default CreatorsGrid;
