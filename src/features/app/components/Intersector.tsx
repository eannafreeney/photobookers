import { loadingIcon } from "../../../components/app/Pagination";

const Intersector = ({ id, endpoint }: { id: string; endpoint: string }) => (
  <div x-data id={id} x-intersect={`$ajax('${endpoint}', { target: '${id}' })`}>
    <div class="flex justify-center items-center min-h-screen">
      {loadingIcon}
    </div>
  </div>
);

export default Intersector;
