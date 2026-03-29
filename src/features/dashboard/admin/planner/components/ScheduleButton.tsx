type ScheduleButtonProps = {
  href: string;
  text: string;
};

const ScheduleButton = ({ href, text }: ScheduleButtonProps) => (
  <a
    href={href}
    x-target="modal-root"
    class="flex min-h-16 flex-col items-center justify-center rounded border border-dashed border-outline bg-surface-alt/50 py-4 text-sm font-medium text-on-surface hover:border-outline-strong hover:bg-surface-alt hover:text-on-surface"
  >
    {text}
  </a>
);

export default ScheduleButton;
