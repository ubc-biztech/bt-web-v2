import Image from "next/image";
import type { UseFormRegisterReturn } from "react-hook-form";
import {
  HH_CODING_CONFIDENCE_IDS,
  HH_TEAMMATE_CHAR_LIMIT,
  HH_WORKSHOP_CHOICES,
  type HHCodingConfidenceId,
  type HHWorkshopChoice,
} from "../Definition";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";
import { CharacterCountField } from "../components/CharacterCountField";
import { ConfirmDetailsInput } from "../components/ConfirmDetailsInput";
import styles from "./ApplicationPage.module.css";

const TEAMMATES_LABEL_ID = "hh-teammates-label";

type ApplicationPageProps = {
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
  codingConfidence?: HHCodingConfidenceId;
  onSelectCodingConfidence: (value: HHCodingConfidenceId) => void;
  codingConfidenceError?: string;
  hackathonsAttended: string;
  hackathonsField: UseFormRegisterReturn;
  hackathonsError?: string;
  workshop?: HHWorkshopChoice;
  onSelectWorkshop: (value: HHWorkshopChoice) => void;
  workshopError?: string;
  tenKPlan: string;
  tenKField: UseFormRegisterReturn;
  tenKError?: string;
  beigeFlag: string;
  beigeFlagField: UseFormRegisterReturn;
  beigeFlagError?: string;
  teammate1Field: UseFormRegisterReturn;
  teammate2Field: UseFormRegisterReturn;
  teammate3Field: UseFormRegisterReturn;
};

export function ApplicationPage({
  canContinue,
  onBack,
  onContinue,
  codingConfidence,
  onSelectCodingConfidence,
  codingConfidenceError,
  hackathonsAttended,
  hackathonsField,
  hackathonsError,
  workshop,
  onSelectWorkshop,
  workshopError,
  tenKPlan,
  tenKField,
  tenKError,
  beigeFlag,
  beigeFlagField,
  beigeFlagError,
  teammate1Field,
  teammate2Field,
  teammate3Field,
}: ApplicationPageProps) {
  return (
    <section data-step="application" className={styles.page}>
      <div className={styles.paper}>
        <div className={styles.content}>
          <header className={styles.header}>
            <span className={styles.statusStrip} aria-hidden="true">
              <span>9:26</span>
              <Image
                src="/assets/2026/hello-hacks/confirm-details/mobile-status-icons.svg"
                alt=""
                width={94}
                height={24}
              />
            </span>

            <BackButton onClick={onBack} className={styles.back} />

            <div className={styles.titleBlock}>
              <h1 className={styles.title}>Your application</h1>
              <p className={styles.subtitle}>Help us get to know you better.</p>
            </div>
          </header>

          <div className={styles.card}>
            <div className={styles.sections}>
              <div className={styles.confidenceSection}>
                <span className={styles.questionText}>
                  How confident are you in your coding abilities?
                </span>
                <div
                  className={styles.ratingGroup}
                  role="radiogroup"
                  aria-label="How confident are you in your coding abilities?"
                >
                  <div className={styles.ratingRow}>
                    <span className={styles.ratingLabel}>Not confident</span>
                    <div className={styles.ratingOptions}>
                      {HH_CODING_CONFIDENCE_IDS.map((rating) => (
                        <label key={rating} className={styles.ratingOption}>
                          <input
                            type="radio"
                            name="codingConfidence"
                            value={rating}
                            checked={codingConfidence === rating}
                            onChange={() => onSelectCodingConfidence(rating)}
                            className={styles.ratingInput}
                          />
                          <span
                            className={styles.ratingCircle}
                            aria-hidden="true"
                          />
                          <span className={styles.ratingNumber}>{rating}</span>
                        </label>
                      ))}
                    </div>
                    <div className={styles.ratingEnd}>
                      <span className={styles.ratingLabel}>Very confident</span>
                      <span className={styles.ratingHint}>Select a rating</span>
                    </div>
                  </div>
                </div>
                {codingConfidenceError ? (
                  <span role="alert" className={styles.fieldError}>
                    {codingConfidenceError}
                  </span>
                ) : null}
              </div>

              <CharacterCountField
                label="How many hackathons have you attended?"
                limit={50}
                value={hackathonsAttended}
                error={hackathonsError}
                field={hackathonsField}
                as="input"
                countMode="chars"
              />

              <div className={styles.fieldGroup}>
                <span className={styles.questionText}>
                  Will you be attending the pre-hackathon workshop? (September
                  24 from 6:30pm - 9:00pm)
                </span>
                <div
                  className={styles.radioGroup}
                  role="radiogroup"
                  aria-label="Will you be attending the pre-hackathon workshop?"
                >
                  {HH_WORKSHOP_CHOICES.map((choice) => (
                    <label key={choice} className={styles.radioOption}>
                      <input
                        type="radio"
                        name="workshop"
                        value={choice}
                        checked={workshop === choice}
                        onChange={() => onSelectWorkshop(choice)}
                        className={styles.radioInput}
                      />
                      <span>{choice}</span>
                    </label>
                  ))}
                </div>
                {workshopError ? (
                  <span role="alert" className={styles.fieldError}>
                    {workshopError}
                  </span>
                ) : null}
              </div>

              <CharacterCountField
                label="If you had 10k right now, what would you do with it and why?"
                limit={150}
                value={tenKPlan}
                error={tenKError}
                field={tenKField}
                countMode="words"
              />

              <CharacterCountField
                label="What's your beige flag?"
                helperText='A beige flag is a harmless, slightly odd or oddly specific trait about yourself - not a red flag or a green flag, just something that makes people go "...?"'
                limit={75}
                value={beigeFlag}
                error={beigeFlagError}
                field={beigeFlagField}
                countMode="words"
              />

              <div className={styles.fieldGroup}>
                <div className={styles.fieldLabel}>
                  <span id={TEAMMATES_LABEL_ID} className={styles.questionText}>
                    List up to 3 other people you&apos;d like to team up with.
                  </span>
                </div>
                <div
                  className={styles.teammateFields}
                  role="group"
                  aria-labelledby={TEAMMATES_LABEL_ID}
                >
                  <ConfirmDetailsInput
                    {...teammate1Field}
                    placeholder="Teammate 1"
                    aria-label="Teammate 1"
                    maxLength={HH_TEAMMATE_CHAR_LIMIT}
                  />
                  <ConfirmDetailsInput
                    {...teammate2Field}
                    placeholder="Teammate 2"
                    aria-label="Teammate 2"
                    maxLength={HH_TEAMMATE_CHAR_LIMIT}
                  />
                  <ConfirmDetailsInput
                    {...teammate3Field}
                    placeholder="Teammate 3"
                    aria-label="Teammate 3"
                    maxLength={HH_TEAMMATE_CHAR_LIMIT}
                  />
                </div>
              </div>
            </div>
          </div>

          <ActionButton
            disabled={!canContinue}
            onClick={onContinue}
            className={styles.continue}
          >
            Continue
          </ActionButton>
        </div>
      </div>
    </section>
  );
}
