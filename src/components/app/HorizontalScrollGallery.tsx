type Props = {
  images: string[];
  imageAlt: string;
};

const HorizontalScrollGallery = ({ images, imageAlt }: Props) => {
  if (images.length === 0) return <></>;

  return (
    <div
      x-data="horizontalScrollGallery"
      class="flex h-[min(70vh,36rem)] items-stretch gap-4 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-3 snap-x snap-mandatory scroll-smooth"
      role="region"
      aria-label="Image gallery"
    >
      {images.map((src, index) => (
        <div
          key={src}
          class="h-[min(70vh,36rem)] shrink-0 snap-center overflow-hidden rounded-radius bg-surface-alt"
        >
          <img
            src={src}
            alt={`${imageAlt} ${index + 1}`}
            loading={index === 0 ? "eager" : "lazy"}
            class="block h-[min(70vh,36rem)] w-auto"
          />
        </div>
      ))}
    </div>
  );
};

export default HorizontalScrollGallery;
