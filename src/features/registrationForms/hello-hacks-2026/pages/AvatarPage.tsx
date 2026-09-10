import type { HHAvatar, HHAvatarId } from "../Definition";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";

type AvatarPageProps = {
  avatars: readonly HHAvatar[];
  selectedAvatar?: HHAvatarId;
  onBack: () => void;
  onSelectAvatar: (avatar: HHAvatarId) => void;
  onContinue: () => void;
};

export function AvatarPage({
  avatars,
  selectedAvatar,
  onBack,
  onSelectAvatar,
  onContinue,
}: AvatarPageProps) {
  return (
    <section data-step="avatar">
      <BackButton onClick={onBack} />
      <h1>Pick an avatar</h1>
      <p>Which BizBot are you?</p>
      <div>
        {avatars.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            aria-pressed={selectedAvatar === avatar.id}
            onClick={() => onSelectAvatar(avatar.id)}
          >
            {avatar.label}
          </button>
        ))}
      </div>
      <ActionButton disabled={!selectedAvatar} onClick={onContinue}>
        Continue
      </ActionButton>
    </section>
  );
}
