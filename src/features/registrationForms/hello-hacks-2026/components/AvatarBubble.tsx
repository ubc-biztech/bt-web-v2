import Image from "next/image";
import {
  HH_BIZBOT_CIRCLE_SHARE,
  HH_BIZBOT_RATIO,
  HH_BIZBOT_SRC,
  HH_BIZBOT_SRC_LARGE,
} from "../Definition";

type AvatarBubbleProps = {
  color: string;
  /** Any CSS length — callers scale the same circle from grid item to hero. */
  size: string;
  large?: boolean;
};

/**
 * The coloured circle every avatar is built from. All six share one BizBot
 * render and differ only by the fill behind it.
 */
export function AvatarBubble({
  color,
  size,
  large = false,
}: AvatarBubbleProps) {
  const width = large ? 320 : 160;

  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full"
      style={{ width: size, height: size, backgroundColor: color }}
    >
      <Image
        src={large ? HH_BIZBOT_SRC_LARGE : HH_BIZBOT_SRC}
        alt=""
        width={width}
        height={Math.round(width / HH_BIZBOT_RATIO)}
        className="h-auto"
        style={{ width: HH_BIZBOT_CIRCLE_SHARE }}
      />
    </span>
  );
}
