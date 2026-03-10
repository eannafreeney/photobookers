import Modal from "../../../../../components/app/Modal";

const ScheduleFeaturedModal = async ({ week }: { week: string }) => {
  return (
    <Modal title="Set 5 featured books">
      <div
        id="featured-set-modal-content"
        x-init={`$ajax('/dashboard/admin/planner/featured/featured-modal-content?week=${week}', { target: 'featured-set-modal-content' })`}
      >
        ...loading...
      </div>
    </Modal>
  );
};

export default ScheduleFeaturedModal;
