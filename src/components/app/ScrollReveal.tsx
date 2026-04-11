import { PropsWithChildren } from "hono/jsx";

type Props = PropsWithChildren<{
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  className?: string;
}>;

const ScrollReveal = ({ children }: Props) => {
  return (
    <div
      x-data={`{ shown: false }`}
      x-intersect="shown = true"
      x-bind:class="shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
      class="transition-all duration-700 ease-out"
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
