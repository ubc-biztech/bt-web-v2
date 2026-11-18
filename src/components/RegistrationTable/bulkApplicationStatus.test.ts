import assert from "node:assert/strict";
import test from "node:test";
import { updateApplicationStatuses } from "./bulkApplicationStatus";

const updates = ["one", "two"].map((name) => ({
  email: name + "@example.com",
  fname: name,
  applicationStatus: "reviewing",
}));

test("sends both selected registrations to the bulk update route", async () => {
  const failed = await updateApplicationStatuses(
    async (options) => {
      assert.equal(options.endpoint, "/registrations/massUpdate");
      assert.equal(options.method, "PUT");
      assert.deepEqual(options.data, {
        eventID: "demo",
        eventYear: 2026,
        updates,
      });
      return {
        results: updates.map(({ email }) => ({ email, success: true })),
      };
    },
    "demo",
    2026,
    updates,
  );
  assert.deepEqual(failed, []);
});

test("reports the failed registration even when the batch returns HTTP 200", async () => {
  const failed = await updateApplicationStatuses(
    async () => ({
      results: [
        { email: updates[0].email, success: true },
        { email: updates[1].email, success: false },
      ],
    }),
    "demo",
    2026,
    updates,
  );
  assert.deepEqual(failed, [updates[1].email]);
});
