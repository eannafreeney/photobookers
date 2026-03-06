import SectionTitle from "../../../components/app/SectionTitle";
import CardCreatorCard from "../../../components/app/CardCreatorCard";
import { getRelatedCreators } from "../services";

type Props = {
  creatorType: "artist" | "publisher";
  creatorId: string;
};

const RelatedCreators = async ({ creatorType, creatorId }: Props) => {
  const relatedCreators = await getRelatedCreators(creatorId, creatorType);
  if (relatedCreators.length === 0) return <></>;

  const title = creatorType === "publisher" ? "Artists" : "Publishers";

  return (
    <section class="flex flex-col gap-2">
      <SectionTitle>{title}</SectionTitle>
      <ul class="flex flex-col gap-4">
        {relatedCreators.map((c) => (
          <CardCreatorCard creator={c} avatarSize="sm" />
        ))}
      </ul>
    </section>
  );
};

export default RelatedCreators;
