import SectionTitle from "../../../components/app/SectionTitle";
import { CreatorCardResult } from "../../../constants/queries";
import CreatorCardSquare from "./CreatorCardSquare";

type Props = {
  creators: CreatorCardResult[];
  title?: string;
};

const CreatorsGrid = async ({ creators, title }: Props) => {
  if (!creators) return <></>;
  if (creators.length === 0) return <></>;

  return (
    <section>
      {title && <SectionTitle className="mb-2">{title}</SectionTitle>}
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {creators.map((creator) => (
          <CreatorCardSquare creator={creator} />
        ))}
      </div>
    </section>
  );
};

export default CreatorsGrid;
