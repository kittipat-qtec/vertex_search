import { appConfig, getMockDomain } from "@/lib/config";
import type { AuthUser } from "@/lib/types";

const splitIdentity = (identity: string) => {
  const normalized = identity.trim();

  if (normalized.includes("\\")) {
    const [domain, username] = normalized.split("\\", 2);
    return { domain, username };
  }

  if (normalized.includes("/")) {
    const [domain, username] = normalized.split("/", 2);
    return { domain, username };
  }

  return { domain: "", username: normalized };
};

const fallbackEmail = (username: string) =>
  username.includes("@") ? username : `${username}@qtec.co.th`;

const verifyAdmin = (u: Partial<AuthUser>) => {
  if (appConfig.adminUsers.includes("*")) return true;
  return appConfig.adminUsers.some(
    (a) =>
      a === u.username?.toLowerCase() ||
      a === u.email?.toLowerCase() ||
      a === u.fullIdentity?.toLowerCase(),
  );
};

export const createMockUser = (): AuthUser => {
  const { domain, username } = splitIdentity(appConfig.mockAuth.fullIdentity);
  const resolvedDomain = domain || getMockDomain();
  const resolvedUsername = username || "dev.user";

  const baseUser = {
    username: resolvedUsername,
    domain: resolvedDomain,
    displayName: appConfig.mockAuth.displayName || resolvedUsername,
    email: appConfig.mockAuth.email || fallbackEmail(resolvedUsername),
    fullIdentity: `${resolvedDomain}\\${resolvedUsername}`,
  };
  return { ...baseUser, isAdmin: verifyAdmin(baseUser) };
};

export const parseAuthHeaders = (headers: Headers): AuthUser | null => {
  const fullIdentity = headers.get(appConfig.authHeaders.user)?.trim() || "";
  const displayName =
    headers.get(appConfig.authHeaders.displayName)?.trim() || "";
  const email = headers.get(appConfig.authHeaders.email)?.trim() || "";
  const headerDomain = headers.get(appConfig.authHeaders.domain)?.trim() || "";

  if (!fullIdentity && !email) {
    return null;
  }

  const parsedIdentity = splitIdentity(fullIdentity || email.split("@")[0] || "");
  const username = parsedIdentity.username || email.split("@")[0] || "unknown";
  const domain = headerDomain || parsedIdentity.domain || "QTEC";

  const baseUser = {
    username,
    domain,
    displayName: displayName || username,
    email: email || fallbackEmail(username),
    fullIdentity: fullIdentity || `${domain}\\${username}`,
  };
  return { ...baseUser, isAdmin: verifyAdmin(baseUser) };
};

export const getRequestUser = (headers: Headers) => {
  if (appConfig.mockMode) {
    return createMockUser();
  }
  
  const user = parseAuthHeaders(headers);
  
  // Fallback to mock user in local development if IIS headers are missing
  if (!user && process.env.NODE_ENV === "development") {
    console.warn("[Auth] Missing IIS headers in development. Falling back to mock user.");
    return createMockUser();
  }
  
  return user;
};
