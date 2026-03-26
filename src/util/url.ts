export const generateStageURL = (): string => {
  const stage = process.env.NEXT_PUBLIC_REACT_APP_STAGE;

  if (stage === "production") {
    return `https://app.ubcbiztech.com`;
  } else if (stage === "local") {
    return `http://localhost:3000`;
  } else {
    return `https://dev.app.ubcbiztech.com`;
  }
};

export const getQueryString = (
  value: string | string[] | undefined,
): string | undefined => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
};
