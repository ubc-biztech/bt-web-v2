import type { HHEditableStep } from "../flow";
import { ActionButton } from "../components/ActionButton";
import { BackButton } from "../components/BackButton";

export type ReviewRow = {
  key: string;
  label: string;
  value: string;
  step: HHEditableStep;
};

type ReviewPageProps = {
  rows: readonly ReviewRow[];
  submitting: boolean;
  onBack: () => void;
  onEdit: (step: HHEditableStep) => void;
};

export function ReviewPage({
  rows,
  submitting,
  onBack,
  onEdit,
}: ReviewPageProps) {
  return (
    <section data-step="review">
      <BackButton onClick={onBack} />
      <h1>Review</h1>
      <p>Please take one last look before submitting.</p>
      <dl>
        {rows.map((row) => (
          <div key={row.key}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
            <button type="button" onClick={() => onEdit(row.step)}>
              Edit
            </button>
          </div>
        ))}
      </dl>
      <ActionButton type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Application"}
      </ActionButton>
    </section>
  );
}
