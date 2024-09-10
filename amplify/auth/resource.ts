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
        clientId: secret(
          "505989219189-4thc1dtkilvom87p1pbf3imb44vbdr2h.apps.googleusercontent.com"
        ),
        clientSecret: secret("ToK8IH7biYuG6gpTmsNFw2ND"),
        scopes: ["email"],
        attributeMapping: {
          email: "email"
        }
      },
      callbackUrls: [
        "http://localhost:3000/login",
        "https://app.ubcbiztech.com/login"
      ],
      logoutUrls: ["http://localhost:3000/", "https://app.ubcbiztech.com/"]
    }
  }
});
