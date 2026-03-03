import Modal from "../../../../../components/app/Modal";

type Props = {
  creatorName: string;
  creatorId: string;
};

const AssignOwnerModal = ({ creatorName, creatorId }: Props) => {
  return (
    <Modal title={`Assign User as Owner of ${creatorName}`}>
      <div
        id="assign-owner-content"
        class="h-24"
        x-init={`$ajax('/dashboard/admin/creators/assign-owner-content/${creatorId}')`}
      >
        ...loading content...
      </div>
    </Modal>
  );
};
export default AssignOwnerModal;
