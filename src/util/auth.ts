import { signOut } from "@aws-amplify/auth";
import { generateStageURL } from "@/util/url";

export async function logout() {
  try {
    await signOut({
      global: false,
      oauth: { redirectUrl: `${generateStageURL()}/login?clearAuth=1` },
    });
  } catch {
    // const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
    const logoutUri = `${generateStageURL()}/login?clearAuth=1`;
    const u = new URL(`https://${generateStageURL()}/logout`);
    u.searchParams.set("client_id", clientId);
    u.searchParams.set("logout_uri", logoutUri);
    window.location.assign(u.toString());
  }
}
