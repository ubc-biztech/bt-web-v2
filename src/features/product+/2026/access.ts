export const PRODUCT_PLUS_COMPANION_PATH = "/companion/product+/2026";
export const PRODUCT_PLUS_EVENT_PATH = "/event/product+/2026";
export const PRODUCT_PLUS_REGISTRATION_KEY = "product+;2026";

export type ProductPlusPage =
  | "portal"
  | "myteam"
  | "submission"
  | "productarena"
  | "admin";

interface ProductPlusRegistration {
  "eventID;year"?: unknown;
  registrationStatus?: unknown;
}

interface ProductPlusUser {
  email?: string;
  email_verified?: string | boolean;
}

export function isProductPlusPage(value: unknown): value is ProductPlusPage {
  return (
    value === "portal" ||
    value === "myteam" ||
    value === "submission" ||
    value === "productarena" ||
    value === "admin"
  );
}

export function requiresProductPlusRegistration(
  page: ProductPlusPage,
): boolean {
  return page === "myteam" || page === "submission";
}

export function hasProductPlusRegistration(
  registrations: readonly ProductPlusRegistration[] | undefined,
): boolean {
  return (
    registrations?.some(
      (registration) =>
        registration["eventID;year"] === PRODUCT_PLUS_REGISTRATION_KEY &&
        (registration.registrationStatus === "acceptedComplete" ||
          registration.registrationStatus === "checkedIn"),
    ) ?? false
  );
}

export function isProductPlusAdmin(
  user: ProductPlusUser | null | undefined,
): boolean {
  return (
    String(user?.email_verified) === "true" &&
    /^[^@\s]+@ubcbiztech\.com$/i.test(user?.email ?? "")
  );
}

export function productPlusLoginPath(destination: string): string {
  return `/login?redirect=${encodeURIComponent(destination)}`;
}
