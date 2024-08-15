import { API_URL } from './dbconfig';
import { AuthTokens, fetchAuthSession } from 'aws-amplify/auth';

interface FetchBackendOptions {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: Record<string, unknown>;
  authenticatedCall?: boolean;
}

async function currentSession(): Promise<AuthTokens | null> {
  try {
    const res = (await fetchAuthSession()).tokens;
    return res ? res : null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function fetchBackend({
  endpoint,
  method,
  data,
  authenticatedCall = true
}: FetchBackendOptions): Promise<any> {
  const headers: Record<string, string> = {};

  if (method === 'POST' || method === 'PUT') {
    headers['Accept'] = 'application/json';
    headers['Content-Type'] = 'application/json';
  }

  if (authenticatedCall) {
    const session = await currentSession();
    if (session) {
      headers['Authorization'] = `Bearer ${session.idToken}`;
    } else {
      throw new Error('Failed to retrieve authentication session.');
    }
  }

  const body = data ? JSON.stringify(data) : undefined;

  try {
    const response = await fetch(API_URL + endpoint, {
      method,
      headers,
      body
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: responseData,
      };
    }

    return responseData;
  } catch (error) {
    throw error;
  }
}
