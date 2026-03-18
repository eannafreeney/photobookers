import Button from "./Button";
import Link from "./Link";
import Modal from "./Modal";

type Props = {
  action: string;
  redirectUrl?: string;
  registerButtonUrl?: string;
};

const AuthModal = ({
  action,
  redirectUrl,
  registerButtonUrl = "/auth/accounts",
}: Props) => {
  return (
    <Modal title={`Please login or register ${action}`}>
      {/* <div class="flex flex-col gap-4"> */}
      <div class="flex items-center justify-center gap-2">
        <Link
          href={`/auth/login${
            redirectUrl ? `?redirectUrl=${redirectUrl}` : ""
          }`}
          className="w-full"
        >
          <Button variant="outline" color="primary" width="full">
            <span>Login</span>
          </Button>
        </Link>
        <Link href={registerButtonUrl} className="w-full">
          <Button variant="solid" color="primary" width="full">
            <span>Register</span>
          </Button>
        </Link>
      </div>
      {/* </div> */}
    </Modal>
  );
};
export default AuthModal;
