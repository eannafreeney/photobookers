import SectionTitle from "../../../components/app/SectionTitle";
import { getRelatedCreators } from "../services";
import { CreatorCardResult } from "../../../constants/queries";
import Card from "../../../components/app/Card";
import Link from "../../../components/app/Link";
import VerifiedCreator from "../../../components/app/VerifiedCreator";
import CreatorCardSquare from "./CreatorCardSquare";

type Props = {
  creatorType: "artist" | "publisher";
  creatorId: string;
};

const RelatedCreators = async ({ creatorType, creatorId }: Props) => {
  const relatedCreators = await getRelatedCreators(creatorId, creatorType);
  if (relatedCreators.length === 0) return <></>;

  const title = creatorType === "publisher" ? "Artists" : "Publishers";

  return (
    <section class="my-4">
      <SectionTitle className="mb-2">{title}</SectionTitle>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {relatedCreators.map((creator) => (
          <CreatorCardSquare creator={creator} />
        ))}
      </div>
    </section>
  );
};

export default RelatedCreators;
