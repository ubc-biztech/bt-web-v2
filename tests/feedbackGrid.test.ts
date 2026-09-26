import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getFeedbackAnswerFields,
  validateGridConfig,
} from "../src/lib/feedbackGrid";
import type { FeedbackQuestion } from "../src/types";

const grid: FeedbackQuestion = {
  questionId: "quality",
  type: "MULTIPLE_CHOICE_GRID",
  label: "Rate the event",
  required: true,
  grid: {
    rows: [
      { id: "organization", label: "Organization" },
      { id: "inclusivity", label: "Inclusivity, accessibility" },
    ],
    columns: ["Poor", "Excellent", "Yes, definitely"],
  },
};

test("answer keys survive row rename, reorder and removal without changing the saved definition", () => {
  const before = JSON.stringify(grid);
  const fields = getFeedbackAnswerFields([grid]);
  assert.deepEqual(
    fields.map((field) => field.questionId),
    ["organization", "inclusivity"],
  );
  assert.equal(JSON.stringify(grid), before);
  const edited = {
    ...grid,
    grid: {
      ...grid.grid!,
      rows: [{ id: "inclusivity", label: "Accessibility" }],
    },
  };
  const [field] = getFeedbackAnswerFields([edited]);
  assert.equal(field.questionId, "inclusivity");
  assert.equal(field.label, "Rate the event: Accessibility");
});

test("ordinary questions retain their definition and answer keys", () => {
  const ordinary: FeedbackQuestion = {
    questionId: "food",
    type: "MULTIPLE_CHOICE",
    label: "Food",
    required: false,
    choices: "Good,Bad",
  };
  assert.deepEqual(getFeedbackAnswerFields([ordinary]), [ordinary]);
});

test("grid validation allows commas but rejects blank, duplicate and oversized labels", () => {
  assert.equal(validateGridConfig(grid.grid), null);
  for (const columns of [
    [],
    [" "],
    ["A", " A "],
    ["x".repeat(201)],
    Array.from({ length: 11 }, (_, i) => String(i)),
  ]) {
    assert.ok(validateGridConfig({ ...grid.grid!, columns }));
  }
  assert.ok(validateGridConfig({ ...grid.grid!, rows: [] }));
  assert.ok(
    validateGridConfig({
      ...grid.grid!,
      rows: [
        { id: "a", label: "A" },
        { id: "b", label: " A " },
      ],
    }),
  );
});
