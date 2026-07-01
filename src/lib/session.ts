import type { User } from '@/types/commerce';

export const SESSION_COOKIE = 'playpro-session';

export interface SessionPayload {
  username: string;
  partyId: string;
  authHeader: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles: string[];
}

export function getServiceAuthHeader(): string {
  return (
    process.env.ORDERS_SERVICE_AUTH_HEADER ??
    process.env.CATALOG_SERVICE_AUTH_HEADER ??
    process.env.PARTY_SERVICE_AUTH_HEADER ??
    'admin:ADMIN,FULLADMIN'
  );
}

export function getPartyServiceAuthHeader(): string {
  return process.env.PARTY_SERVICE_AUTH_HEADER ?? getServiceAuthHeader();
}

export function sessionFromLogin(login: {
  username: string;
  partyId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  roles?: string[];
  authHeader: string;
}): SessionPayload {
  return {
    username: login.username,
    partyId: login.partyId ?? '',
    authHeader: login.authHeader,
    firstName: login.firstName,
    lastName: login.lastName,
    email: login.email ?? login.username,
    roles: login.roles ?? ['CUSTOMER'],
  };
}

export function sessionToUser(session: SessionPayload): User {
  return {
    username: session.username,
    partyId: session.partyId,
    email: session.email,
    firstName: session.firstName,
    lastName: session.lastName,
    roles: session.roles,
    permissions: [],
  };
}

export function parseSessionCookie(value: string | undefined): SessionPayload | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as SessionPayload;
    if (!parsed.username || !parsed.authHeader) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function serializeSessionCookie(session: SessionPayload): string {
  return encodeURIComponent(JSON.stringify(session));
}
