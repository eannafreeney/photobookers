import { InfiniteScroll } from "../../../components/app/InfiniteScroll";
import { Pagination } from "../../../components/app/Pagination";

type Props = {
  isInfiniteScroll?: boolean;
  currentPath: string;
  page: number;
  totalPages: number;
  targetId: string;
};

const ListNavigation = ({
  isInfiniteScroll = false,
  currentPath,
  page,
  totalPages,
  targetId,
}: Props) => {
  return isInfiniteScroll ? (
    <InfiniteScroll
      baseUrl={currentPath}
      page={page}
      totalPages={totalPages}
      targetId={targetId}
    />
  ) : (
    <Pagination
      baseUrl={currentPath}
      page={page}
      totalPages={totalPages}
      targetId={targetId}
    />
  );
};

export default ListNavigation;
