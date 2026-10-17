import assert from "node:assert/strict";
import test from "node:test";
import {
  isProductArenaDestination,
  isProductPlusLoginDestination,
  productPlusLoginPath,
} from "./access";

const destinations = [
  "/companion/product+/2026/submission",
  "/companion/product+/2026/myteam",
  "/companion/product+/2026/productarena",
  "/productplus/audience",
];

test("Product+ login returns recognize encoded paths, queries, hashes and trailing slashes", () => {
  for (const path of destinations) {
    for (const destination of [
      path,
      `${path}/`,
      `${path}?team=one&filter=product%2B#details`,
      path.replace("+", "%2B"),
      `${path.replace("+", "%2b")}/?team=one#details`,
    ]) {
      assert.equal(
        isProductPlusLoginDestination(destination),
        true,
        destination,
      );
      const login = new URL(
        productPlusLoginPath(destination),
        "https://app.test",
      );
      assert.equal(login.searchParams.get("redirect"), destination);
    }
  }
});

test("onboarding bypass stays limited to the requested Product+ pages", () => {
  for (const destination of [
    "/",
    "/profile",
    "/companion/product+/2026",
    "/companion/product+/2026/admin",
    "/companion/product+/2025/submission",
    "/companion/product+/2026/submission-other",
    "/companion/product+/2026/submission/extra",
    "/companion/other/2026/myteam",
    "/productplus/audience-other",
    "https://example.com/companion/product+/2026/submission",
    "//example.com/companion/product+/2026/submission",
    "/\\example.com/companion/product+/2026/submission",
    "/companion/product%ZZ/2026/submission",
  ]) {
    assert.equal(
      isProductPlusLoginDestination(destination),
      false,
      destination,
    );
  }
});

test("arena signup return paths remain separate from team and submission login returns", () => {
  assert.equal(isProductArenaDestination(destinations[0]), false);
  assert.equal(isProductArenaDestination(destinations[1]), false);
  assert.equal(
    isProductArenaDestination(
      "/companion/product%2B/2026/productarena/?team=one",
    ),
    true,
  );
  assert.equal(
    isProductArenaDestination("/productplus/audience?team=one"),
    true,
  );
});
