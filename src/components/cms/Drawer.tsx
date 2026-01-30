export const Drawer = ({
  children,
  buttonText,
}: {
  children: JSX.Element;
  buttonText: string;
}) => {
  return (
    <div class="drawer">
      <input id="my-drawer-1" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content">
        <label for="my-drawer-1" class="btn drawer-button">
          {buttonText}
        </label>
      </div>
      <div class="drawer-side">
        <label
          for="my-drawer-1"
          aria-label="close sidebar"
          class="drawer-overlay"
        ></label>
        <div class="menu bg-base-200 min-h-full w-80 p-4">{children}</div>
      </div>
    </div>
  );
};
