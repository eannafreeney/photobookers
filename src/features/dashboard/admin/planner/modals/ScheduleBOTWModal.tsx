import Modal from "../../../../../components/app/Modal";

const ScheduleBOTWModal = async ({ week }: { week: string }) => {
  return (
    <Modal title="Schedule Book of the Week">
      <div
        id="schedule-modal-content"
        class="h-24"
        x-init={`$ajax('/dashboard/admin/planner/book-of-the-week/schedule-modal-content?week=${week}')`}
      >
        ...loading content...
      </div>
    </Modal>
  );
};

export default ScheduleBOTWModal;
