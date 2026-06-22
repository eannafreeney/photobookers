import { InfiniteScroll } from "../../../components/app/InfiniteScroll";
import { Pagination } from "../../../components/app/Pagination";

type Props = {
  isInfiniteScroll?: boolean;
  currentPath: string;
  page: number;
  totalPages: number;
  targetId: string;
  pageParam?: string;
  navId?: string;
};

const ListNavigation = ({
  isInfiniteScroll = false,
  currentPath,
  page,
  totalPages,
  targetId,
  pageParam = "page",
  navId = "pagination",
}: Props) => {
  return isInfiniteScroll ? (
    <InfiniteScroll
      baseUrl={currentPath}
      page={page}
      totalPages={totalPages}
      targetId={targetId}
      pageParam={pageParam}
      navId={navId}
    />
  ) : (
    <Pagination
      baseUrl={currentPath}
      page={page}
      totalPages={totalPages}
      targetId={targetId}
      pageParam={pageParam}
      navId={navId}
    />
  );
};

export default ListNavigation;
