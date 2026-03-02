import Modal from "../../../../../components/app/Modal";

const AssignOwnerModal = () => {
  return (
    <Modal title="Assign User as Creator Owner">
      <div
        id="assign-owner-content"
        class="h-64"
        x-init="$ajax('/dashboard/admin/creators/assign-owner-content')"
      >
        ...loading content...
      </div>
    </Modal>
  );
};
export default AssignOwnerModal;
