import type { BookFair } from "../../../../db/schema";
import GridPanel from "../../../../components/app/GridPanel";
import ScrollReveal from "../../../../components/app/ScrollReveal";
import FairCard from "./FairCard";
import { InfiniteScroll } from "../../../../components/app/InfiniteScroll";
import { Pagination } from "../../../../components/app/Pagination";

type FairsGridProps = {
  fairs: BookFair[];
  page: number;
  totalPages: number;
  baseUrl: string;
  targetId?: string;
  isPaginated?: boolean;
};

const FairsGrid = ({
  fairs,
  page,
  totalPages,
  baseUrl,
  targetId = "fairs-grid",
  isPaginated = false,
}: FairsGridProps) => {
  if (fairs.length === 0) {
    return (
      <div class="text-center py-12 text-gray-500">
        No fairs found.
      </div>
    );
  }

  return (
    <>
      <GridPanel id={targetId} xMerge={isPaginated ? undefined : "append"}>
        {fairs.map((fair) => (
          <ScrollReveal>
            <FairCard fair={fair} />
          </ScrollReveal>
        ))}
      </GridPanel>
      {isPaginated ? (
        <Pagination page={page} totalPages={totalPages} baseUrl={baseUrl} targetId={targetId} />
      ) : (
        <InfiniteScroll
          baseUrl={baseUrl}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
        />
      )}
    </>
  );
};

export default FairsGrid;
