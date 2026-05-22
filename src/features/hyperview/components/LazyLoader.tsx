import { Spinner, Text } from "../../../lib/hxml-comps";

type Props = { id: string; href: string; style: string; trigger?: string };

const LazyLoader = ({ id, href, style, trigger = "visible" }: Props) => {
  return (
    <view
      id={id}
      style={style}
      trigger={trigger}
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
