type Props = {
  bannerUrl: string | null;
  displayName: string;
};

const CreatorPageBanner = ({ bannerUrl, displayName }: Props) => {
  if (!bannerUrl) return <></>;

  return (
    <div class="w-full overflow-hidden rounded-radius -mx-4 md:mx-0">
      <img
        src={bannerUrl}
        alt={`${displayName} banner`}
        class="w-full h-48 md:h-64 object-cover"
      />
    </div>
  );
};

export default CreatorPageBanner;
