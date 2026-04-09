import Card from "../../../components/app/Card";
import { formatDate } from "../../../utils";

type CreditsProps = {
  releaseDate: Date | null;
};

const Credits = ({ releaseDate }: CreditsProps) => (
  <div class="flex flex-col gap-2">
    {releaseDate && (
      <>
        <p class="text-sm font-medium text-on-surface-strong">Release Date:</p>
        <Card.Text>{formatDate(releaseDate)}</Card.Text>
      </>
    )}
    <p class="text-sm font-medium text-on-surface-strong">Credits</p>
    <p class="text-sm text-on-surface">
      All images on this page are owned by the respective creator.
    </p>
  </div>
);

export default Credits;
