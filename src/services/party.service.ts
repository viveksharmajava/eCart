import type { User } from '@/types/commerce';
import { httpClient } from './http.client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  username: string;
  partyId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles: string[];
  permissions: string[];
  authHeader: string;
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return httpClient('/party/auth/login', {
    method: 'POST',
    body: credentials,
  });
}

export function toUser(response: LoginResponse): User {
  return {
    username: response.username,
    partyId: response.partyId,
    email: response.email ?? response.username,
    firstName: response.firstName,
    lastName: response.lastName,
    roles: response.roles,
    permissions: response.permissions,
  };
}
