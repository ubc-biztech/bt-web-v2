// TODO: Configure travis to build a staging version
// export const AWS_CONFIG = process.env.REACT_APP_STAGE === 'production'
//     ? aws_config
//     : aws_exports

export const API_URL =
process.env.REACT_APP_STAGE === "production"
  ? "https://api.ubcbiztech.com"
  : process.env.REACT_APP_STAGE === "local"
    ? "http://localhost:4000"
    : "https://api-dev.ubcbiztech.com";

export const CLIENT_URL =
  process.env.REACT_APP_STAGE === "production"
    ? "https://v2.ubcbiztech.com/"
    : process.env.REACT_APP_STAGE === "local"
      ? "http://localhost:3000/"
      : "https://dev.v2.ubcbiztech.com/";