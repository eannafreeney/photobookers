import type { BookStore } from "../../../../db/schema";
import GridPanel from "../../../../components/app/GridPanel";
import ScrollReveal from "../../../../components/app/ScrollReveal";
import ListNavigation from "../../components/ListNavigation";
import StoreCard from "./StoreCard";

type StoresGridProps = {
  stores: BookStore[];
  page: number;
  totalPages: number;
  baseUrl: string;
  targetId?: string;
  isPaginated?: boolean;
};

const StoresGrid = ({
  stores,
  page,
  totalPages,
  baseUrl,
  targetId = "stores-grid",
  isPaginated = false,
}: StoresGridProps) => {
  if (stores.length === 0) {
    return <div class="text-center py-12 text-gray-500">No bookstores found.</div>;
  }

  return (
    <>
      <GridPanel id={targetId} xMerge={isPaginated ? undefined : "append"}>
        {stores.map((store) => (
          <ScrollReveal>
            <StoreCard store={store} />
          </ScrollReveal>
        ))}
      </GridPanel>
      <ListNavigation
        isInfiniteScroll
        currentPath={baseUrl}
        page={page}
        totalPages={totalPages}
        targetId={targetId}
      />
    </>
  );
};

export default StoresGrid;
