import SectionTitle from "../../../components/app/SectionTitle";
import { getVerifiedPublishers } from "../services";
import CreatorCardSquare from "./CreatorCardSquare";

const PublishersSlider = async () => {
  const [err, publishers] = await getVerifiedPublishers();
  if (err) return <></>;

  return (
    <>
      <SectionTitle>Popular Publishers</SectionTitle>
      <div class="grid grid-cols-minmax(auto, 1fr) gap-4">
        {publishers.map((publisher) => (
          <CreatorCardSquare creator={publisher} />
        ))}
      </div>
    </>
  );
};

export default PublishersSlider;
