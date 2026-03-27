import OptionsComboBox from "../../../../../components/app/OptionsComboBox";
import { getAllCreatorProfiles } from "../../creators/services";

const CreatorsComboBox = async () => {
  const [error, creators] = await getAllCreatorProfiles();
  if (error) return <div>Error: {error.reason}</div>;

  const options = creators.map((creator) => ({
    id: creator.id,
    label: creator.displayName,
    img: creator.coverUrl,
  }));

  return <OptionsComboBox options={options} name="form.creatorId" />;
};

export default CreatorsComboBox;
