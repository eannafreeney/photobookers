import {
  getThisWeeksArtistOfTheWeek,
  getThisWeeksPublisherOfTheWeek,
} from "../CreatorSpotlightServices";
import CreatorSpotlightsGrid from "../components/CreatorSpotlightGrid";

const CreatorSpotlightFragment = async () => {
  const [artistOfTheWeek, publisherOfTheWeek] = await Promise.all([
    getThisWeeksArtistOfTheWeek(),
    getThisWeeksPublisherOfTheWeek(),
  ]);

  if (!artistOfTheWeek || !publisherOfTheWeek) return <></>;

  return (
    <div id="creator-spotlights-fragment">
      {/* <CreatorSpotlightsGrid
        artistOfTheWeek={artistOfTheWeek}
        publisherOfTheWeek={publisherOfTheWeek}
      /> */}
    </div>
  );
};
export default CreatorSpotlightFragment;
