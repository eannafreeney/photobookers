type Props = {
  href: string;
};

const EditSpotlightBlurbButton = ({ href }: Props) => (
  <a
    href={href}
    x-target="modal-root"
    class="rounded border border-outline bg-surface-alt px-2 py-1 text-xs font-medium text-on-surface hover:bg-surface"
  >
    Edit blurb
  </a>
);

export default EditSpotlightBlurbButton;
