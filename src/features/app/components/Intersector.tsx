import { PropsWithChildren } from "hono/jsx";
import { loadingIcon } from "../../../components/app/Pagination";

type Props = PropsWithChildren<{
  id: string;
  endpoint: string;
}>;

const Intersector = ({ id, endpoint, children }: Props) => {
  const alpineAttrs = {
    "x-intersect.margin.400px": `$ajax('${endpoint}', { target: '${id}' })`,
  };

  return (
    <div id={id} x-data {...alpineAttrs}>
      {children || loadingIcon}
    </div>
  );
};

export default Intersector;
