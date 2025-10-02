import { defineAuth, secret } from "@aws-amplify/backend";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      google: {
        clientId: secret(process.env.GOOGLE_CLIENT_ID as string),
        clientSecret: secret(process.env.GOOGLE_CLIENT_SECRET as string),
        scopes: ["email"],
        attributeMapping: {
          email: "email",
        },
      },
      callbackUrls: [
        "http://localhost:3000/login",
        "https://app.ubcbiztech.com/login",
        "https://dev.app.ubcbiztech.com/login",
        "https://dev.v2.ubcbiztech.com/login",
        "https://v2.ubcbiztech.com/login",
      ],
      logoutUrls: [
        "http://localhost:3000/login",
        "https://app.ubcbiztech.com/login",
        "https://dev.app.ubcbiztech.com/login",
        "https://dev.v2.ubcbiztech.com/login",
        "https://v2.ubcbiztech.com/login",
        "http://localhost:3000/",
        "https://app.ubcbiztech.com/",
        "https://dev.app.ubcbiztech.com/",
        "https://dev.v2.ubcbiztech.com/",
        "https://v2.ubcbiztech.com/",
      ],
    },
  },
});
