import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import OptionsComboBox from "../../../../../components/app/OptionsComboBox.js";
import { getAllCreatorProfiles } from "../../creators/services.js";
const CreatorsComboBox = async () => {
  const [error, creators] = await getAllCreatorProfiles();
  if (error) return /* @__PURE__ */ jsxs("div", { children: [
    "Error: ",
    error.reason
  ] });
  const options = creators.map((creator) => ({
    id: creator.id,
    label: creator.displayName,
    img: creator.coverUrl
  }));
  return /* @__PURE__ */ jsx(OptionsComboBox, { options, name: "form.creatorId" });
};
var CreatorsComboBox_default = CreatorsComboBox;
export {
  CreatorsComboBox_default as default
};
