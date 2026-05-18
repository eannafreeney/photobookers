import { FC } from "hono/jsx";
import { Behavior, Image, Style, Text, View } from "../../../lib/hxml-comps";
import { getCreatorsByCreatorId } from "../../app/services";
import CreatorCard from "./CreatorCard";

type Props = {
  creatorId: string;
  creatorType: "artist" | "publisher";
  baseUrl?: string;
  title?: string;
};

const CreatorsGrid: FC<Props> = async ({
  creatorId,
  creatorType,
  baseUrl = "",
}) => {
  const [error, result] = await getCreatorsByCreatorId(creatorId, creatorType);
  if (error || !result?.creators || result.creators.length === 0) return <></>;

  const { creators } = result;

  return (
    <view xmlns="https://hyperview.org/hyperview">
      {creators.map((creator) => (
        <CreatorCard key={creator.id} creator={creator} baseUrl={baseUrl} />
      ))}
    </view>
  );
};

export default CreatorsGrid;
