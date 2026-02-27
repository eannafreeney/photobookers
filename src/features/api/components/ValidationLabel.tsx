type Props = {
  id: string;
  entityExists: boolean;
};

const ValidationLabel = ({ id, entityExists }: Props) => {
  if (entityExists) {
    return (
      <div id={id}>
        <p class="label text-danger mt-1">✗ Taken</p>
      </div>
    );
  }

  return (
    <div id={id}>
      <p class="label text-success mt-1">✓ Available</p>
    </div>
  );
};

export default ValidationLabel;
