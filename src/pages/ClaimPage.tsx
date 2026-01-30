import Modal from "../components/app/Modal";

type ClaimPageProps = {
  creatorId: string;
};

const ClaimPage = ({ creatorId }: ClaimPageProps) => {
  return (
    <Modal>
      <div class="flex flex-col gap-4 p-2">
        <h2>Claim Creator</h2>
        <form method="post" action={`/claim/${creatorId}`}>
          <input type="text" name="name" placeholder="Name" />
          <input type="email" name="email" placeholder="Email" />
          <input type="text" name="message" placeholder="Message" />
          <button type="submit">Claim</button>
        </form>
      </div>
    </Modal>
  );
};
export default ClaimPage;
