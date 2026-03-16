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

  console.log(artistOfTheWeek, publisherOfTheWeek);

  return (
    <div id="creator-spotlights-fragment">
      <CreatorSpotlightsGrid
        artistOfTheWeek={artistOfTheWeek}
        publisherOfTheWeek={publisherOfTheWeek}
      />
    </div>
  );
};
export default CreatorSpotlightFragment;
