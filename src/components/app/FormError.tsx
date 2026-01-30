import Alert from "./Alert";

const FormError = ({ children }: { children: string }) => {
  return (
    <div
      x-sync
      id="form-messages"
      x-data="{ show: true }"
      x-init="setTimeout(() => show = false, 4000)"
      x-show="show"
      x-transition:leave="transition ease-in duration-300"
      x-transition:leave-start="opacity-100"
      x-transition:leave-end="opacity-0"
      class="toast toast-top toast-center"
    >
      <Alert type="danger" title="Problem!" message={children} />
    </div>
  );
};
export default FormError;
