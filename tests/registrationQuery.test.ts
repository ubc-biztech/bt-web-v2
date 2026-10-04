import assert from "node:assert/strict";
import { test } from "node:test";
import { eventRegistrationsEndpoint } from "../src/lib/registrationQuery";

test("product+ retains its exact event ID after query decoding", () => {
  const url = new URL(
    eventRegistrationsEndpoint("product+", "2026"),
    "https://example.com",
  );

  assert.equal(url.pathname, "/registrations");
  assert.equal(url.searchParams.get("eventID"), "product+");
  assert.equal(url.searchParams.get("year"), "2026");
  assert.ok(url.search.includes("product%2B"));
});

test("query delimiters in an event ID do not introduce extra parameters", () => {
  const eventId = "product+ &year=2025#/?%";
  const url = new URL(
    eventRegistrationsEndpoint(eventId, "2026"),
    "https://example.com",
  );

  assert.equal(url.searchParams.get("eventID"), eventId);
  assert.equal(url.searchParams.get("year"), "2026");
  assert.equal(url.searchParams.size, 2);
  assert.equal(url.hash, "");
});

test("ordinary event IDs preserve the existing request", () => {
  assert.equal(
    eventRegistrationsEndpoint("hello-hacks", "2026"),
    "/registrations?eventID=hello-hacks&year=2026",
  );
});
