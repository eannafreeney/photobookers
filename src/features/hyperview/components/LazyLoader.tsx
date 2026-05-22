import { Spinner, Text } from "../../../lib/hxml-comps";

type Props = { id: string; href: string; style: string };

const LazyLoader = ({ id, href, style }: Props) => {
  return (
    <view
      id={id}
      style={style}
      trigger="visible"
      once="true"
      verb="get"
      href={href}
      action="replace"
    >
      <Spinner />
      <Text style="comments-placeholder">Loading…</Text>
    </view>
  );
};

export default LazyLoader;
