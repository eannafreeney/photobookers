import Button from "../app/Button";

type Props = {
  entity: string;
};

const CopyCellCol = ({ entity }: Props) => {
  return (
    <div
      x-data={`{ cellValue: '${entity}', copied: false }`}
      class="flex items-center gap-2"
    >
      <span x-text="cellValue"></span>
      <Button
        variant="outline"
        width="fit"
        color="inverse"
        x-on:click="copied = !copied; navigator.clipboard.writeText(cellValue)"
        x-text="copied ? 'Copied!' : 'Copy'"
      >
        Copy
      </Button>
    </div>
  );
};
export default CopyCellCol;
