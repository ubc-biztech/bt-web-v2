import assert from "node:assert/strict";
import test from "node:test";
import { getLoginRedirect } from "./url";

const destination = "/companion/product%2B/2026/submission/?tab=video#preview";
const oauthState = (path: string) =>
  `nonce-${Buffer.from(path).toString("hex")}`;

test("login preserves the original return path including query and hash", () => {
  assert.equal(getLoginRedirect(destination, undefined), destination);
  assert.equal(
    getLoginRedirect([destination, "/profile"], undefined),
    destination,
  );
  assert.equal(getLoginRedirect(undefined, undefined), "/");
});

test("Google OAuth custom state takes priority over the redirect parameter", () => {
  assert.equal(
    getLoginRedirect("/profile", oauthState(destination)),
    destination,
  );
  assert.equal(
    getLoginRedirect("/profile", [oauthState(destination), "ignored"]),
    destination,
  );
});

test("missing or malformed OAuth custom state falls back to the return parameter", () => {
  for (const state of [
    "nonce",
    "nonce-",
    "nonce-abc",
    "nonce-not-hex",
    "nonce-zz",
  ]) {
    assert.equal(getLoginRedirect(destination, state), destination, state);
  }
});

test("login rejects unsafe destinations from query parameters and OAuth state", () => {
  for (const unsafe of [
    "https://example.com",
    "//example.com",
    "/\\example.com",
    "/profile\nLocation: https://example.com",
    "profile",
  ]) {
    assert.equal(getLoginRedirect(unsafe, undefined), "/");
    assert.equal(getLoginRedirect(destination, oauthState(unsafe)), "/");
  }
});
