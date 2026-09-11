import Image from "next/image";
import {
  HH_BIZBOT_CIRCLE_SHARE,
  HH_BIZBOT_RATIO,
  HH_BIZBOT_SRC,
  HH_BIZBOT_SRC_LARGE,
  type HHAvatar,
  type HHAvatarId,
} from "../Definition";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";

const ASSETS = "/assets/2026/hello-hacks/confirm-details";

type AvatarPageProps = {
  avatars: readonly HHAvatar[];
  selectedAvatar?: HHAvatarId;
  onBack: () => void;
  onSelectAvatar: (avatar: HHAvatarId) => void;
  onContinue: () => void;
};

/**
 * The coloured circle every avatar is built from. `size` is any CSS length, so
 * the preview and the grid share one implementation at different scales.
 */
function AvatarBubble({
  color,
  size,
  large = false,
}: {
  color: string;
  size: string;
  large?: boolean;
}) {
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

export function AvatarPage({
  avatars,
  selectedAvatar,
  onBack,
  onSelectAvatar,
  onContinue,
}: AvatarPageProps) {
  // The preview always shows something; the disabled Continue is what
  // communicates that nothing has been chosen yet.
  const preview =
    avatars.find(({ id }) => id === selectedAvatar) ?? avatars[0];

  return (
    <section
      data-step="avatar"
      className="relative min-h-screen overflow-hidden bg-[#f7f6f1] px-6 py-12 text-[#181818] sm:px-10 md:px-16 md:py-16 lg:px-20"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center md:hidden"
        style={{ backgroundImage: `url('${ASSETS}/paper-texture.jpeg')` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-cover bg-center md:block"
        style={{ backgroundImage: `url('${ASSETS}/paper-desktop.png')` }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[760px] flex-col gap-8 md:gap-10">
        <header className="flex w-full flex-col items-start gap-3">
          <span
            aria-hidden="true"
            className="flex h-[37px] w-full items-center justify-between text-[16.774px] font-600 leading-[37px] text-[#20386a] md:hidden"
          >
            <span>9:26</span>
            <Image
              src={`${ASSETS}/mobile-status-icons.svg`}
              alt=""
              width={94}
              height={24}
            />
          </span>

          <BackButton
            onClick={onBack}
            className="h-6 w-6 bg-[url('/assets/2026/hello-hacks/confirm-details/arrow-narrow-left.svg')] bg-contain bg-center bg-no-repeat text-transparent"
          />

          <div className="flex w-full flex-col items-start gap-1">
            <h1 className="text-[32px] font-800 leading-[38px] text-[#181818] md:text-[36px] md:leading-[41.84px]">
              Pick an avatar
            </h1>
            <p className="text-sm leading-5 text-[#3c3c3c] md:text-base md:leading-6">
              Which BizBot are you?
            </p>
          </div>
        </header>

        <div className="flex w-full flex-col items-center gap-8 md:gap-10">
          <AvatarBubble
            color={preview.color}
            size="clamp(120px, 24vw, 160px)"
            large
          />

          <div
            role="group"
            aria-label="Choose your BizBot"
            className="grid grid-cols-3 gap-x-6 gap-y-5 md:gap-x-9 md:gap-y-6"
          >
            {avatars.map((avatar) => {
              const isSelected = avatar.id === selectedAvatar;

              return (
                <button
                  key={avatar.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectAvatar(avatar.id)}
                  className={`rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1094f7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f6f1] ${
                    isSelected
                      ? "ring-4 ring-[#1094f7] ring-offset-2 ring-offset-[#f7f6f1]"
                      : "hover:scale-105"
                  }`}
                >
                  <AvatarBubble
                    color={avatar.color}
                    size="clamp(72px, 15vw, 96px)"
                  />
                  <span className="sr-only">{avatar.label}</span>
                </button>
              );
            })}
          </div>

          <ActionButton
            disabled={!selectedAvatar}
            onClick={onContinue}
            className="h-[66px] w-full max-w-[292px] rounded-full border border-[#64b5ff] bg-[linear-gradient(180deg,#307bf2,#328bfc)] px-8 py-0 text-[22px] font-400 leading-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),inset_0_-1px_2px_rgba(113,206,255,0.45)] transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </ActionButton>
        </div>
      </div>
    </section>
  );
}
