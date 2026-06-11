import CreatorCard from "../../../components/app/CreatorCard";
import ScrollReveal from "../../../components/app/ScrollReveal";
import SectionTitle from "../../../components/app/SectionTitle";
import { useUser } from "../../../contexts/UserContext";
import { getCreatorsByCreatorId, getRelatedCreators } from "../services";
import CreatorsCircle from "./CreatorsCircle";
import ListNavigation from "./ListNavigation";

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
  const user = useUser();
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
        x-merge="append"
        class="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        {creators.map((creator) => (
          <ScrollReveal>
            <CreatorCard
              creator={creator}
              currentPath={currentPath}
              user={user}
              showHeader={false}
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
