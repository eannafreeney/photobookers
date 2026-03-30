import SectionTitle from "../../../components/app/SectionTitle";
import { CreatorCardResult } from "../../../constants/queries";
import CreatorsCircle from "./CreatorsCircle";

type Props = {
  creators: CreatorCardResult[];
  title?: string;
};

const CreatorsGrid = async ({ creators, title }: Props) => {
  if (!creators) return <></>;
  if (creators.length === 0) return <></>;

  return (
    <section>
      {title && <SectionTitle>{title}</SectionTitle>}
      <div class="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-8 gap-6">
        {creators.map((creator) => (
          <CreatorsCircle creator={creator} />
        ))}
      </div>
    </section>
  );
};

export default CreatorsGrid;
