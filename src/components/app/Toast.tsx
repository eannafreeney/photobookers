import { fadeTransition } from "../../lib/transitions";
import Alert from "./Alert";

const Toast = ({ flash }: { flash: any }) => {
  console.log("Toast flash:", flash);
  if (!flash || !flash.type || !flash.message) return <></>;

  return <Alert type={flash.type} message={flash.message} />;

  const classes = {
    success: "alert-success",
    error: "alert-error",
    info: "alert-info",
  };

  return (
    <div
      x-data="{ show: true }"
      x-init="setTimeout(() => { show = false }, 4000)"
      x-show="show"
      {...fadeTransition}
      class="toast toast-top toast-center"
    >
      <div
        class={`alert ${
          classes[flash.type as keyof typeof classes]
        } text-white`}
      >
        {flash.message}
      </div>
    </div>
  );
};

export default Toast;
