import { signOut } from "@aws-amplify/auth";
import { generateStageURL } from "@/util/url";

export async function logout() {
  const redirectUrl = `${generateStageURL()}/login`;

  try {
    await signOut({
      global: false,
      oauth: { redirectUrl },
    });
  } catch (error) {
    console.error("Error signing out:", error);
    window.location.assign(redirectUrl);
  }
}
