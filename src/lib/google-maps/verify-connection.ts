import { getServerGoogleMapsApiKey } from "@/lib/env";

type GoogleApiStatus = "OK" | "ZERO_RESULTS" | string;

type GeocodingResponse = {
  status: GoogleApiStatus;
  error_message?: string;
};

type DirectionsResponse = {
  status: GoogleApiStatus;
  error_message?: string;
};

export type ApiCheckResult = {
  ok: boolean;
  message: string;
};

async function callGoogleApi<T extends { status: GoogleApiStatus; error_message?: string }>(
  url: URL,
): Promise<ApiCheckResult> {
  const response = await fetch(url.toString(), { cache: "no-store" });

  if (!response.ok) {
    return {
      ok: false,
      message: `Google API への接続に失敗しました（HTTP ${response.status}）`,
    };
  }

  const data = (await response.json()) as T;

  if (data.status === "OK" || data.status === "ZERO_RESULTS") {
    return { ok: true, message: "接続成功" };
  }

  return {
    ok: false,
    message: data.error_message ?? `API エラー: ${data.status}`,
  };
}

export async function verifyGeocodingApi(): Promise<ApiCheckResult> {
  const apiKey = getServerGoogleMapsApiKey();

  if (!apiKey) {
    return {
      ok: false,
      message: "GOOGLE_MAPS_API_KEY が未設定です",
    };
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", "東京駅");
  url.searchParams.set("key", apiKey);

  return callGoogleApi<GeocodingResponse>(url);
}

export async function verifyDirectionsApi(): Promise<ApiCheckResult> {
  const apiKey = getServerGoogleMapsApiKey();

  if (!apiKey) {
    return {
      ok: false,
      message: "GOOGLE_MAPS_API_KEY が未設定です",
    };
  }

  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set("origin", "東京駅");
  url.searchParams.set("destination", "渋谷駅");
  url.searchParams.set("mode", "transit");
  url.searchParams.set("language", "ja");
  url.searchParams.set("key", apiKey);

  return callGoogleApi<DirectionsResponse>(url);
}

export type ConnectionCheckSummary = {
  envReady: boolean;
  geocoding: ApiCheckResult;
  directions: ApiCheckResult;
  allOk: boolean;
};

export async function verifyGoogleMapsConnection(): Promise<ConnectionCheckSummary> {
  const geocoding = await verifyGeocodingApi();
  const directions = geocoding.ok ? await verifyDirectionsApi() : geocoding;

  return {
    envReady: true,
    geocoding,
    directions,
    allOk: geocoding.ok && directions.ok,
  };
}
