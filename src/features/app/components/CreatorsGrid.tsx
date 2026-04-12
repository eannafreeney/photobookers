import SectionTitle from "../../../components/app/SectionTitle";
import { getCreatorsByCreatorId, getRelatedCreators } from "../services";
import CreatorsCircle from "./CreatorsCircle";
import ListNavigation from "./ListNavigation";

type Props = {
  creatorId: string;
  creatorType: "artist" | "publisher";
  title?: string;
  currentPath: string;
};

const CreatorsGrid = async ({
  creatorId,
  creatorType,
  title,
  currentPath,
}: Props) => {
  const [error, result] = await getCreatorsByCreatorId(creatorId, creatorType);
  if (error) return <></>;
  const { creators, totalPages, page } = result;
  if (!creators) return <></>;
  if (creators.length === 0) return <></>;

  const targetId = `creators-grid-${creatorId}`;

  return (
    <section>
      {title && <SectionTitle>{title}</SectionTitle>}
      <div
        x-ref="paginationContent"
        id={targetId}
        class="grid grid-cols-2 md:grid-cols-3 gap-6"
      >
        {creators.map((creator) => (
          <CreatorsCircle creator={creator} />
        ))}
        <ListNavigation
          targetId={targetId}
          totalPages={totalPages}
          page={page}
          currentPath={currentPath}
        />
      </div>
    </section>
  );
};

export default CreatorsGrid;
