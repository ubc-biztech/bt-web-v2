import type { HHRole, HHRoleId } from "../Definition";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";

type RolePageProps = {
  roles: readonly HHRole[];
  selectedRole?: HHRoleId;
  onBack: () => void;
  onSelectRole: (role: HHRoleId) => void;
  onContinue: () => void;
};

export function RolePage({
  roles,
  selectedRole,
  onBack,
  onSelectRole,
  onContinue,
}: RolePageProps) {
  return (
    <section data-step="role">
      <BackButton onClick={onBack} />
      <h1>What&apos;s your role?</h1>
      <p>We&apos;ll use this to help build balanced teams.</p>
      <div>
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            aria-pressed={selectedRole === role.id}
            onClick={() => onSelectRole(role.id)}
          >
            <span>{role.label}</span>
            <span>{role.description}</span>
          </button>
        ))}
      </div>
      <ActionButton disabled={!selectedRole} onClick={onContinue}>
        Continue
      </ActionButton>
    </section>
  );
}
