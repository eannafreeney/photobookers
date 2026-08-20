import { PropsWithChildren } from "hono/jsx";
import { loadingIcon } from "../../../components/app/Pagination";

type Props = PropsWithChildren<{
  id: string;
  endpoint: string;
}>;

const Intersector = ({ id, endpoint, children }: Props) => {
  const alpineAttrs = {
    "x-intersect.margin.700px": `$ajax('${endpoint}', { target: '${id}' })`,
  };

  return (
    <div id={id} x-data {...alpineAttrs}>
      {children || <LoadingIcon />}
    </div>
  );
};

export default Intersector;

/**
 * Fallback for callers without a skeleton. Deliberately not `min-h-screen`:
 * an over-tall placeholder makes the page shrink under the reader when the
 * fragment lands.
 */
const LoadingIcon = () => (
  <div class="flex min-h-[280px] items-center justify-center">{loadingIcon}</div>
);
