import type { GeocodedLocation } from "@/types/location";

import { getServerGoogleMapsApiKey } from "../env";

type GeocodingResult = {
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
};

type GeocodingResponse = {
  status: string;
  results: GeocodingResult[];
  error_message?: string;
};

export class GeocodingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeocodingError";
  }
}

export async function geocodeAddress(input: string): Promise<GeocodedLocation> {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new GeocodingError("住所またはスポット名を入力してください");
  }

  const apiKey = getServerGoogleMapsApiKey();

  if (!apiKey) {
    throw new GeocodingError("Google Maps API キーが設定されていません");
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", trimmed);
  url.searchParams.set("language", "ja");
  url.searchParams.set("region", "jp");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new GeocodingError("位置情報の取得に失敗しました");
  }

  const data = (await response.json()) as GeocodingResponse;

  if (data.status !== "OK" || data.results.length === 0) {
    throw new GeocodingError(
      data.error_message ??
        `「${trimmed}」が見つかりませんでした。別の名称で試してください`,
    );
  }

  const result = data.results[0];

  return {
    input: trimmed,
    formattedAddress: result.formatted_address,
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    placeId: result.place_id,
  };
}

export async function validateRouteSearch(
  origin: string,
  destination: string,
): Promise<{ origin: GeocodedLocation; destination: GeocodedLocation }> {
  const trimmedOrigin = origin.trim();
  const trimmedDestination = destination.trim();

  if (!trimmedOrigin || !trimmedDestination) {
    throw new GeocodingError("出発地と目的地の両方を入力してください");
  }

  if (trimmedOrigin === trimmedDestination) {
    throw new GeocodingError("出発地と目的地は異なる場所を指定してください");
  }

  const [geocodedOrigin, geocodedDestination] = await Promise.all([
    geocodeAddress(trimmedOrigin),
    geocodeAddress(trimmedDestination),
  ]);

  return {
    origin: geocodedOrigin,
    destination: geocodedDestination,
  };
}
