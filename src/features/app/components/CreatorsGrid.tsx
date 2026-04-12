import ScrollReveal from "../../../components/app/ScrollReveal";
import SectionTitle from "../../../components/app/SectionTitle";
import { getCreatorsByCreatorId, getRelatedCreators } from "../services";
import CreatorsCircle from "./CreatorsCircle";
import ListNavigation from "./ListNavigation";

type Props = {
  creatorId: string;
  creatorType: "artist" | "publisher";
  title?: string;
  currentPath: string;
  isMobile?: boolean;
  currentPage: number;
  pageParam?: string;
};

const CreatorsGrid = async ({
  isMobile,
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
      <div
        x-ref="creatorsContent"
        id={targetId}
        x-merge={isMobile ? "append" : "replace"}
        class="grid grid-cols-2 md:grid-cols-3 gap-6"
      >
        {creators.map((creator) => (
          <ScrollReveal>
            <CreatorsCircle creator={creator} />
          </ScrollReveal>
        ))}
      </div>
      <ListNavigation
        isInfiniteScroll={isMobile}
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
