const PLACEHOLDER = "your_api_key_here";

function isConfigured(value: string | undefined): value is string {
  return Boolean(value && value !== PLACEHOLDER);
}

export function getServerGoogleMapsApiKey(): string | null {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  return isConfigured(key) ? key : null;
}

export function getPublicGoogleMapsApiKey(): string | null {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  return isConfigured(key) ? key : null;
}

export type EnvSetupStatus = {
  serverKeyConfigured: boolean;
  publicKeyConfigured: boolean;
  ready: boolean;
};

export function getEnvSetupStatus(): EnvSetupStatus {
  const serverKeyConfigured = Boolean(getServerGoogleMapsApiKey());
  const publicKeyConfigured = Boolean(getPublicGoogleMapsApiKey());

  return {
    serverKeyConfigured,
    publicKeyConfigured,
    ready: serverKeyConfigured && publicKeyConfigured,
  };
}
