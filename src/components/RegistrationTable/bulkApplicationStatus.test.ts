import assert from "node:assert/strict";
import test from "node:test";
import { updateApplicationStatuses } from "../../lib/registrationQuery";

test("bulk edit sends both rows and returns only the failed email", async () => {
  const updates = ["one", "two"].map((fname) => ({
    fname,
    email: fname + "@example.com",
    applicationStatus: "reviewing",
  }));
  const batch = { eventID: "demo", eventYear: 2026, updates };
  const failed = await updateApplicationStatuses(
    async ({ endpoint, method, data }) => {
      assert.equal(endpoint, "/registrations/massUpdate");
      assert.equal(method, "PUT");
      assert.deepEqual(data, batch);
      return {
        results: updates.map(({ email }, index) => ({
          email,
          success: index === 0,
        })),
      };
    },
    batch,
  );
  assert.deepEqual(failed, [updates[1].email]);
});
