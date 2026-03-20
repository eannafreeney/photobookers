import Button from "../../../components/app/Button";
import { thumbsUpIcon } from "../../../lib/icons";

const RegisterSuccessScreen = () => {
  return (
    <div
      id="register-form"
      class="flex flex-col gap-6 items-center justify-center"
    >
      <div>{thumbsUpIcon()}</div>
      <h2 class="text-2xl font-bold">Success</h2>
      <p class="text-sm text-center">
        Your account has been successfully created. Please check your email for
        verification.
      </p>
      <a href="/">
        <Button variant="solid" color="primary">
          Go to Homepage
        </Button>
      </a>
    </div>
  );
};

export default RegisterSuccessScreen;
