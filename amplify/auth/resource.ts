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
      callbackUrls: ["http://localhost:3000/", "https://app.ubcbiztech.com/"],
      logoutUrls: [
        "http://localhost:3000/login",
        "https://app.ubcbiztech.com/login",
      ],
    },
  },
});
