import Button from "../app/Button";
import { thumbsUpIcon } from "../../lib/icons";

const FormSuccessScreen = ({
  id,
  message,
}: {
  id: string;
  message: string;
}) => {
  return (
    <div id={id} class="flex flex-col gap-6 items-center justify-center">
      <div>{thumbsUpIcon()}</div>
      <h2 class="text-2xl font-bold">Success</h2>
      <p class="text-sm text-center">{message}</p>
      <a href="/">
        <Button variant="solid" color="primary">
          Go to Homepage
        </Button>
      </a>
    </div>
  );
};

export default FormSuccessScreen;
