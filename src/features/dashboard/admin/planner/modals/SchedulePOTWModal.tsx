import Modal from "../../../../../components/app/Modal";
import POTWForm from "../forms/POTWForm";
import { getCreatorsByTypeForPlanner } from "../services";

type Props = {
  week: string;
  formValues?: {
    weekStart: string;
    creatorId: string;
    text: string;
  };
};

const SchedulePublisherOfTheWeekModal = async ({ week, formValues }: Props) => {
  const creators = await getCreatorsByTypeForPlanner("publisher");

  const options = creators.map((c) => ({
    id: c.id,
    label: c.displayName,
    img: c.coverUrl ?? null,
  }));

  return (
    <Modal title={`Publisher of the Week for ${week}`}>
      <POTWForm options={options} week={week} formValues={formValues} />
    </Modal>
  );
};

export default SchedulePublisherOfTheWeekModal;
