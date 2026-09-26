# Feedback Rating Grid

The feedback builder explicitly supports **Multiple-choice grid** for attendee and partner forms. Add, rename, remove and reorder rows with individual controls; configure shared columns one per line. A required grid needs one selection in every row; an optional grid can be skipped or partially answered. Labels must be unique and non-empty (up to 200 characters), with 1-20 rows and 1-10 columns. Grid columns are stored as an array, so labels can contain commas.

Desktop presents shared column headings. Below 640px each row displays its own labeled choices, without horizontal scrolling. Native radio buttons support keyboard navigation and one selection per row.

## API Contract and Rollout

Deploy backend PR #763 before this frontend: it adds `MULTIPLE_CHOICE_GRID` support. Each grid is stored once in the event's attendee or partner feedback questions:

```json
{
  "questionId": "event-quality",
  "type": "MULTIPLE_CHOICE_GRID",
  "label": "Rate the event",
  "required": true,
  "grid": {
    "rows": [{ "id": "organization", "label": "Organization" }],
    "columns": ["Poor", "Excellent", "Yes, definitely"]
  }
}
```

The API validates the definition when creating/updating the event. The builder reads and saves that same object; no cross-row metadata or reconstruction is needed.

Answers remain flat: `responses = { "organization": "Excellent" }`. Stable row IDs preserve answers when rows are renamed or reordered. Answer validation and response viewing enumerate the rows without changing the stored definition. Existing non-grid questions and submissions keep their format. No live forms or data are migrated by this PR.

The mandatory `overall-rating` 1-10 question remains unchanged for existing metrics. Its reserved ID cannot be reused as a grid row ID. Existing forms are not automatically consolidated.

## Verification

```sh
node --import tsx --test tests/feedbackGrid.test.ts
npx tsc --noEmit
```

## Screenshots

Screenshots of the actual components with synthetic fixture data are attached to the [PR description](https://github.com/ubc-biztech/bt-web-v2/pull/504).
