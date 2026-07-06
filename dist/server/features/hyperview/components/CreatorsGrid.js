import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { getCreatorsByCreatorId } from "../../app/services.js";
import CreatorCard from "./CreatorCard.js";
const CreatorsGrid = async ({
  creatorId,
  creatorType,
  baseUrl = ""
}) => {
  const [error, result] = await getCreatorsByCreatorId(creatorId, creatorType);
  if (error || !result?.creators || result.creators.length === 0) return /* @__PURE__ */ jsx(Fragment, {});
  const { creators } = result;
  return /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: creators.map((creator) => /* @__PURE__ */ jsx(CreatorCard, { creator, baseUrl }, creator.id)) });
};
var CreatorsGrid_default = CreatorsGrid;
export {
  CreatorsGrid_default as default
};
