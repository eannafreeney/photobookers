import { AuthUser } from "../../../../types";
import CreatorCard from "../../../components/app/CreatorCard";
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
  isMobile?: boolean;
  user: AuthUser | null;
};

const CreatorsGrid = async ({
  creatorId,
  creatorType,
  title,
  currentPath,
  currentPage,
  pageParam,
  isMobile = false,
  user = null,
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
        id={targetId}
        x-merge="append"
        class={isMobile ? undefined : "grid grid-cols-2 md:grid-cols-4 gap-6"}
      >
        {creators.map((creator) => (
          <ScrollReveal>
            {isMobile ? (
              <SpotlightCreatorLink
                creator={creator}
                role={capitalize(creator.type)}
              />
            ) : (
              <CreatorCard
                creator={creator}
                currentPath={currentPath}
                user={user}
                showHeader={false}
              />
            )}
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
