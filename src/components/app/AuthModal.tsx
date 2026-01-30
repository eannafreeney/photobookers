import Button from "./Button";
import Link from "./Link";
import Modal from "./Modal";

type Props = {
  action: string;
  redirectUrl?: string;
};

const AuthModal = ({ action, redirectUrl }: Props) => {
  return (
    <Modal>
      <div class="flex flex-col gap-4 p-2">
        <div id="modal-content">{`Please login or register ${action}`}</div>
        <div class="flex flex-col gap-2">
          <Link
            href={`/auth/login${
              redirectUrl ? `?redirectUrl=${redirectUrl}` : ""
            }`}
          >
            <Button variant="outline" color="primary">
              <span>Login</span>
            </Button>
          </Link>
          <Link href="/auth/accounts">
            <Button variant="solid" color="primary">
              <span>Register</span>
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
};
export default AuthModal;
