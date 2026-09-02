export interface AuthenticatedUser {
  name: string;
  email: string;
  pictureUrl: string | null;
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const response = await fetch('/api/auth/me', {
    credentials: 'include',
  });

  if (response.status === 401) return null;
  if (!response.ok) throw new Error('Could not check login status');

  return response.json();
}
