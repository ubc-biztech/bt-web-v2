import assert from "node:assert/strict";
import test from "node:test";
import {
  RUBRIC_CRITERIA,
  RUBRIC_MAX,
  rankByRubric,
  rubricDraft,
  rubricTotal,
  validRubricScores,
} from "./rubric";

test("the five criteria keep the API score order and use a 10-point scale", () => {
  assert.deepEqual(
    RUBRIC_CRITERIA.map(({ name }) => name),
    [
      "Problem Definition",
      "Problem-Solution Fit",
      "Business Viability",
      "Research & Supporting Evidence",
      "Video Pitch & Creativity",
    ],
  );
  assert.ok(RUBRIC_CRITERIA.every(({ max }) => max === 10));
  assert.equal(RUBRIC_MAX, 100);
});

test("weighted totals apply the correct contribution for each criterion", () => {
  for (const [scores, expected] of [
    [[10, 10, 10, 10, 10], 100],
    [[0, 0, 0, 0, 0], 0],
    [[10, 0, 0, 0, 0], 25],
    [[0, 10, 0, 0, 0], 25],
    [[0, 0, 10, 0, 0], 25],
    [[0, 0, 0, 10, 0], 15],
    [[0, 0, 0, 0, 10], 10],
    [[10, 8, 6, 4, 2], 68],
    [[8.5, 7.25, 9.75, 6.5, 8.25], 81.75],
  ] satisfies [number[], number][]) {
    assert.ok(Math.abs(rubricTotal(scores) - expected) < 1e-10);
  }
});

test("all five scores must be finite and between zero and ten", () => {
  assert.equal(validRubricScores(["0", "0", "0", "0", "0"]), true);
  assert.equal(validRubricScores(["10", "10", "10", "10", "10"]), true);
  assert.equal(validRubricScores(["8.5", "7.25", "9.75", "6.5", "8.25"]), true);
  for (let index = 0; index < 5; index++) {
    for (const invalid of ["", " ", "-0.1", "10.1", "NaN", "Infinity"]) {
      const scores = ["5", "5", "5", "5", "5"];
      scores[index] = invalid;
      assert.equal(validRubricScores(scores), false);
    }
  }
  assert.equal(validRubricScores(["5", "5", "5", "5"]), false);
  assert.equal(validRubricScores(["5", "5", "5", "5", "5", "5"]), false);
});

test("saved drafts retain five raw scores and their matching comments", () => {
  const rubric = {
    judge_user_id: "judge@example.com",
    scores: [10, 8, 6, 4, 2],
    comments: ["Problem", "Fit", "Business", "Evidence", "Pitch"],
  };
  assert.deepEqual(rubricDraft(rubric), {
    scores: ["10", "8", "6", "4", "2"],
    comments: rubric.comments,
  });
  assert.deepEqual(rubric.scores, [10, 8, 6, 4, 2]);
  assert.deepEqual(rubricDraft(), {
    scores: ["", "", "", "", ""],
    comments: ["", "", "", "", ""],
  });
});

test("ranking uses weighted averages and includes a scored zero", () => {
  const base = {
    team_name: "Team",
    rubric_count: 1,
    upvotes: 0,
    downvotes: 0,
    audience_score: 0,
  };
  const rows = [
    { ...base, team_code: "000001", rubric_average: 0 },
    { ...base, team_code: "000002", rubric_average: null, rubric_count: 0 },
    { ...base, team_code: "000003", rubric_average: 68 },
    { ...base, team_code: "000004", rubric_average: 81.75 },
  ];
  assert.deepEqual(
    rankByRubric(rows).map(({ team_code }) => team_code),
    ["000004", "000003", "000001"],
  );
  assert.equal(rows[0].team_code, "000001");
});
