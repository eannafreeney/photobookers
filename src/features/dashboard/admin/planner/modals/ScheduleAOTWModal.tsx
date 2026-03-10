import Modal from "../../../../../components/app/Modal";
import AOTWForm from "../forms/AOTWForm";
import { getCreatorsByTypeForPlanner } from "../services";

type Props = {
  week: string;
  formValues?: {
    weekStart: string;
    creatorId: string;
    text: string;
  };
};

const ScheduleAOTWModal = async ({ week, formValues }: Props) => {
  const creators = await getCreatorsByTypeForPlanner("artist");

  const options = creators.map((c) => ({
    id: c.id,
    label: c.displayName,
    img: c.coverUrl ?? null,
  }));

  return (
    <Modal title={`Artist of the Week for ${week}`}>
      <AOTWForm options={options} week={week} formValues={formValues} />
    </Modal>
  );
};
export default ScheduleAOTWModal;
