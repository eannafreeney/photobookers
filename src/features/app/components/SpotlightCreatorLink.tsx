import { CreatorCardResult } from "../../../constants/queries";
import Button from "../../../components/app/Button";
import SpotlightCreator from "./SpotlightCreator";

type Props = {
  creator: CreatorCardResult | null | undefined;
  role: string;
};

const SpotlightCreatorLink = ({ creator, role }: Props) => {
  if (!creator) return <></>;

  return (
    <div class="flex items-center justify-between gap-3 border-y border-outline py-4">
      <SpotlightCreator creator={creator} role={role} />
      <a href={`/creators/${creator.slug}`}>
        <Button variant="outline" color="primary" width="full">
          Visit
        </Button>
      </a>
    </div>
  );
};

export default SpotlightCreatorLink;
