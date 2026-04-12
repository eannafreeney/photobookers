import { InfiniteScroll } from "../../../components/app/InfiniteScroll";
import { Pagination } from "../../../components/app/Pagination";

type Props = {
  isInfiniteScroll?: boolean;
  currentPath: string;
  page: number;
  totalPages: number;
  targetId: string;
  pageParam?: string;
};

const ListNavigation = ({
  isInfiniteScroll = false,
  currentPath,
  page,
  totalPages,
  targetId,
  pageParam = "page",
}: Props) => {
  return isInfiniteScroll ? (
    <InfiniteScroll
      baseUrl={currentPath}
      page={page}
      totalPages={totalPages}
      targetId={targetId}
      pageParam={pageParam}
    />
  ) : (
    <Pagination
      baseUrl={currentPath}
      page={page}
      totalPages={totalPages}
      targetId={targetId}
      pageParam={pageParam}
    />
  );
};

export default ListNavigation;
