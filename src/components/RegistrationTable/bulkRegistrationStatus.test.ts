import assert from "node:assert/strict";
import test from "node:test";
import { updateRegistrationStatuses } from "../../lib/registrationQuery";
import { DBRegistrationStatus } from "../../types";

test("bulk edit returns the saved registration status and identifies unconfirmed rows", async () => {
  const updates = ["one", "two", "three", "four"].map((fname) => ({
    fname,
    email: fname + "@example.com",
    registrationStatus: DBRegistrationStatus.ACCEPTED,
  }));
  const batch = { eventID: "demo", eventYear: 2026, updates };
  const { confirmed, failed } = await updateRegistrationStatuses(
    async ({ endpoint, method, data }) => {
      assert.equal(endpoint, "/registrations/massUpdate");
      assert.equal(method, "PUT");
      assert.deepEqual(data, batch);
      return {
        results: [
          {
            email: updates[0].email,
            success: true,
            registrationStatus: DBRegistrationStatus.ACCEPTED_PENDING,
          },
          { email: updates[1].email, success: false },
          {
            email: updates[2].email,
            success: true,
            registrationStatus: "rejected",
          },
          {
            email: "other@example.com",
            success: true,
            registrationStatus: DBRegistrationStatus.ACCEPTED,
          },
        ],
      };
    },
    batch,
  );
  assert.deepEqual(confirmed, [
    {
      email: updates[0].email,
      registrationStatus: DBRegistrationStatus.ACCEPTED_PENDING,
    },
  ]);
  assert.deepEqual(
    failed,
    updates.slice(1).map(({ email }) => email),
  );
});
