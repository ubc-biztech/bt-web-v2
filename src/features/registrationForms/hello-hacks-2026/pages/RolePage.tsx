import type { HHRole, HHRoleId } from "../Definition";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";
import Image from "next/image";
import styles from "./RolePage.module.css";

const ROLE_EMOJI: Record<HHRoleId, string> = {
  developer: "👨‍💻",
  designer: "🎨",
  "product-manager": "📈",
  undecided: "🤷",
};

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
    <section data-step="role" className={styles.page}>
      <div className={styles.content}>
        <header className={styles.header}>
          <span aria-hidden="true" className={styles.status}>
            <span>9:26</span>
            <Image
              src="/assets/2026/hello-hacks/confirm-details/mobile-status-icons.svg"
              alt=""
              width={94}
              height={24}
              className={styles.statusIcons}
            />
          </span>

          <BackButton onClick={onBack} className={styles.backButton} />
          <h1 id="role-heading" className={styles.heading}>
            What’s your role?
          </h1>
          <p className={styles.subtitle}>
            We&apos;ll use this to help build balanced teams.
          </p>
        </header>
        <div
          className={styles.options}
          role="group"
          aria-labelledby="role-heading"
        >
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              aria-pressed={selectedRole === role.id}
              onClick={() => onSelectRole(role.id)}
              className={`${styles.option} ${
                selectedRole === role.id
                  ? styles.optionSelected
                  : styles.optionUnselected
              }`}
            >
              <span aria-hidden="true" className={styles.emoji}>
                {ROLE_EMOJI[role.id]}
              </span>
              <span className={styles.optionText}>
                <span className={styles.optionLabel}>{role.label}</span>
                <span className={styles.optionDescription}>
                  {role.description}
                </span>
              </span>
            </button>
          ))}
        </div>
        <ActionButton
          disabled={!selectedRole}
          onClick={onContinue}
          className={styles.continue}
        >
          Continue
        </ActionButton>
      </div>
    </section>
  );
}
