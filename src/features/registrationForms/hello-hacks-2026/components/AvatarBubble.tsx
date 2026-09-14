import Image from "next/image";
import {
  HH_AVATAR_HEIGHT,
  HH_AVATAR_WIDTH,
  type HHAvatar,
} from "../Definition";

type AvatarBubbleProps = {
  avatar: HHAvatar;
  /** Any CSS length — callers scale the same circle from grid item to hero. */
  size: string;
  /** Skips lazy-loading for the hero render, which is above the fold. */
  priority?: boolean;
};

/**
 * A single avatar. The fill and the decoration are baked into the art, so this
 * only sizes it and clips the transparent corners; `color` backs the circle so
 * there is no hole while the image loads.
 */
export function AvatarBubble({ avatar, size, priority }: AvatarBubbleProps) {
  return (
    <span
      className="block shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size, backgroundColor: avatar.color }}
    >
      <Image
        src={avatar.src}
        alt=""
        width={HH_AVATAR_WIDTH}
        height={HH_AVATAR_HEIGHT}
        priority={priority}
        unoptimized
        className="h-full w-full object-contain"
      />
    </span>
  );
}
