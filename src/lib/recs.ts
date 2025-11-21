import { fetchBackend } from "./db";

export type Suggested = {
  profileID: string;
  fname: string;
  lname: string;
  major?: string;
  faculty?: string;
  year?: string;
  score: number;
  reason: string;
  email: string;
};

export async function fetchSelfRecommendations(): Promise<Suggested[]> {
  const res = await fetchBackend({
    endpoint: "/profiles/recommendations/self",
    method: "GET",
    authenticatedCall: true,
  });
  return res?.results || [];
}
