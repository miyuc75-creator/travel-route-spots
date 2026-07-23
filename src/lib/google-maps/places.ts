import type {
  RecommendedSpot,
  SpotCategory,
  SpotsSearchResult,
} from "@/types/spot";
import { SPOT_CATEGORIES } from "@/types/spot";

import { getServerGoogleMapsApiKey } from "../env";
import { decodePolyline, samplePointsAlongPath } from "./polyline";

type NearbyPlace = {
  place_id: string;
  name: string;
  vicinity?: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  opening_hours?: {
    open_now?: boolean;
  };
};

type NearbySearchResponse = {
  status: string;
  results: NearbyPlace[];
  error_message?: string;
};

export class PlacesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlacesError";
  }
}

const SAMPLE_POINT_COUNT = 4;
const SEARCH_RADIUS_METERS = 1000;
const MAX_RESULTS = 12;

function getCategoryLabel(category: SpotCategory): string {
  return (
    SPOT_CATEGORIES.find((item) => item.id === category)?.label ?? category
  );
}

function toRecommendedSpot(
  place: NearbyPlace,
  category: SpotCategory,
): RecommendedSpot {
  return {
    id: place.place_id,
    name: place.name,
    address: place.vicinity ?? place.formatted_address ?? "",
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    rating: place.rating ?? null,
    userRatingsTotal: place.user_ratings_total ?? null,
    category,
    categoryLabel: getCategoryLabel(category),
    openNow: place.opening_hours?.open_now ?? null,
    googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
  };
}

async function searchNearbyAtPoint(
  point: { lat: number; lng: number },
  category: SpotCategory,
  apiKey: string,
): Promise<NearbyPlace[]> {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
  );
  url.searchParams.set("location", `${point.lat},${point.lng}`);
  url.searchParams.set("radius", SEARCH_RADIUS_METERS.toString());
  url.searchParams.set("type", category);
  url.searchParams.set("language", "ja");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), { cache: "no-store" });

  if (!response.ok) {
    return [];
  }

  const data = (await response.json()) as NearbySearchResponse;

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new PlacesError(
      data.error_message ?? `Places API エラー: ${data.status}`,
    );
  }

  return data.results ?? [];
}

export async function searchSpotsAlongRoute(
  polyline: string,
  category: SpotCategory,
): Promise<SpotsSearchResult> {
  const apiKey = getServerGoogleMapsApiKey();

  if (!apiKey) {
    throw new PlacesError("Google Maps API キーが設定されていません");
  }

  if (!polyline) {
    throw new PlacesError("ルート情報が不足しているためスポットを検索できません");
  }

  const pathPoints = decodePolyline(polyline);
  const samplePoints = samplePointsAlongPath(pathPoints, SAMPLE_POINT_COUNT);
  const spotMap = new Map<string, RecommendedSpot>();

  for (const point of samplePoints) {
    const places = await searchNearbyAtPoint(point, category, apiKey);

    for (const place of places) {
      if (!spotMap.has(place.place_id)) {
        spotMap.set(place.place_id, toRecommendedSpot(place, category));
      }
    }
  }

  const spots = Array.from(spotMap.values())
    .sort((a, b) => {
      const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
      if (ratingDiff !== 0) {
        return ratingDiff;
      }

      return (b.userRatingsTotal ?? 0) - (a.userRatingsTotal ?? 0);
    })
    .slice(0, MAX_RESULTS);

  if (spots.length === 0) {
    throw new PlacesError(
      `${getCategoryLabel(category)}がルート沿いに見つかりませんでした`,
    );
  }

  return {
    category,
    categoryLabel: getCategoryLabel(category),
    spots,
  };
}
