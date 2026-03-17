const toBoolean = (value: string | undefined, fallback: boolean) => {
  if (value == null || value.trim() === "") {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
};

const getDomainFromIdentity = (identity: string) => {
  const separator = identity.includes("\\") ? "\\" : "/";
  const [domain] = identity.split(separator);
  return domain || "QTEC";
};

export const appConfig = {
  appName: process.env.NEXT_PUBLIC_APP_NAME?.trim() || "QTEC Knowledge Brain",
  mockMode: toBoolean(process.env.MOCK_MODE, true),
  googleCloudProject: process.env.GOOGLE_CLOUD_PROJECT?.trim() || "",
  googleCloudLocation: process.env.GOOGLE_CLOUD_LOCATION?.trim() || "us-central1",
  dataStoreId: process.env.DATA_STORE_ID?.trim() || "",
  dataStoreLocation: process.env.DATA_STORE_LOCATION?.trim() || "global",
  dataStoreCollection:
    process.env.DATA_STORE_COLLECTION?.trim() || "default_collection",
  modelName: process.env.MODEL_NAME?.trim() || "gemini-2.5-flash",
  adminUsers: (process.env.ADMIN_USERS || "")
    .split(",")
    .map((u) => u.trim().toLowerCase())
    .filter(Boolean),
  authHeaders: {
    user: process.env.AUTH_HEADER_USER?.trim() || "x-iis-auth-user",
    displayName:
      process.env.AUTH_HEADER_DISPLAYNAME?.trim() || "x-iis-auth-displayname",
    email: process.env.AUTH_HEADER_EMAIL?.trim() || "x-iis-auth-email",
    domain: process.env.AUTH_HEADER_DOMAIN?.trim() || "x-iis-auth-domain",
  },
  mockAuth: {
    fullIdentity: process.env.MOCK_AUTH_USER?.trim() || "QTEC\\dev.user",
    displayName: process.env.MOCK_AUTH_DISPLAYNAME?.trim() || "นักพัฒนาทดสอบ",
    email: process.env.MOCK_AUTH_EMAIL?.trim() || "dev.user@qtec.co.th",
  },
} as const;

export const hasVertexAiConfig = () =>
  Boolean(appConfig.googleCloudProject && appConfig.googleCloudLocation);

export const hasVertexSearchConfig = () =>
  Boolean(
    hasVertexAiConfig() &&
    appConfig.dataStoreId &&
    appConfig.dataStoreId !== "your-data-store-id"
  );

export const getMockDomain = () =>
  getDomainFromIdentity(appConfig.mockAuth.fullIdentity);

export const getDataStoreResourceName = () => {
  if (!hasVertexSearchConfig()) {
    return null;
  }

  return `projects/${appConfig.googleCloudProject}/locations/${appConfig.dataStoreLocation}/collections/${appConfig.dataStoreCollection}/dataStores/${appConfig.dataStoreId}`;
};
