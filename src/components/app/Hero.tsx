type HeroProps = {
  url?: string;
  creatorName?: string;
};

const Hero = ({
  url = "https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp",
  creatorName,
}: HeroProps) => {
  return (
    <div class="md:block hidden hero" style={`background-image: url(${url})`}>
      <div class="hero-overlay max-h-[300px] flex items-center justify-center">
        <div class="hero-content text-neutral-content text-center ">
          <div class="max-w-md ">
            <h1 class="text-5xl font-bold">{creatorName}</h1>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Hero;
