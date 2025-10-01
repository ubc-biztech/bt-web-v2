// TODO: Configure travis to build a staging version
// export const AWS_CONFIG = process.env.REACT_APP_STAGE === 'production'
//     ? aws_config
//     : aws_exports

export const API_URL =
  process.env.NEXT_PUBLIC_REACT_APP_STAGE === "production"
    ? "https://api.ubcbiztech.com"
    : process.env.NEXT_PUBLIC_REACT_APP_STAGE === "local"
      ? "http://localhost:4000"
      : "https://api-dev.ubcbiztech.com";

export const CLIENT_URL =
  process.env.NEXT_PUBLIC_REACT_APP_STAGE === "production"
    ? "https://app.ubcbiztech.com/"
    : process.env.NEXT_PUBLIC_REACT_APP_STAGE === "local"
      ? "http://localhost:3000/"
      : "https://dev.app.ubcbiztech.com/";

export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (process.env.NEXT_PUBLIC_REACT_APP_STAGE === "production"
    ? "wss://api.ubcbiztech.com"
    : process.env.NEXT_PUBLIC_REACT_APP_STAGE === "local"
      ? "ws://localhost:3002"
      : "wss://bwiujsprij.execute-api.us-west-2.amazonaws.com/dev");

export const INTERACTIONS_URL =
  process.env.NEXT_PUBLIC_REACT_APP_STAGE === "production"
    ? "https://api.ubcbiztech.com"
    : process.env.NEXT_PUBLIC_REACT_APP_STAGE === "local"
      ? "http://localhost:4010/dev"
      : "https://api-dev.ubcbiztech.com";

export const EVENT_ID = process.env.NEXT_PUBLIC_EVENT_ID || "DEFAULT";
