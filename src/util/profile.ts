export const normalizeViewableMap = (
  viewableMap?: Record<string, boolean> | null,
): Record<string, boolean> => ({
  ...viewableMap,
  resumeURL: viewableMap?.resumeURL ?? false,
});

export const getProfileIdFromSource = (
  source?:
    | string
    | {
        profileID?: string | null;
        compositeID?: string | null;
      }
    | null,
): string => {
  if (!source) return "";

  if (typeof source === "string") {
    return source.includes("#") ? source.split("#")[1] || "" : source;
  }

  return source.profileID || getProfileIdFromSource(source.compositeID);
};

export const ensureAbsoluteUrl = (url: string): string =>
  url.startsWith("http") ? url : `https://${url}`;
