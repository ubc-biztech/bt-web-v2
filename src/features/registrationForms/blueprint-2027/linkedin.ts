export const PARTNER_LINKEDIN_PREFIX = "https://www.linkedin.com/in/";

export function normalizePartnerLinkedin(value: string): string {
  const trimmed = value.trim();
  const profilePrefix = /^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\//i;
  if (profilePrefix.test(trimmed)) {
    let profile = trimmed;
    while (profilePrefix.test(profile))
      profile = profile.replace(profilePrefix, "");
    return `${PARTNER_LINKEDIN_PREFIX}${profile}`;
  }
  return /^[a-zA-Z0-9_%\-]+\/?$/.test(trimmed)
    ? `${PARTNER_LINKEDIN_PREFIX}${trimmed}`
    : trimmed;
}
