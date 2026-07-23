import type {
  RecommendedSpot,
  SpotCategory,
  SpotsSearchResult,
} from "@/types/spot";
import {
  ALL_ROUTE_SPOT_CATEGORIES,
  SPOT_CATEGORIES,
} from "@/types/spot";

import { getServerGoogleMapsApiKey } from "../env";
import { decodePolyline, samplePointsAlongPath, type LatLng } from "./polyline";

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

type CategorySearchConfig = {
  keyword?: string;
  type?: string;
  radius: number;
  namePattern?: RegExp;
};

export class PlacesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlacesError";
  }
}

const MAX_RESULTS = 15;

const CATEGORY_SEARCH_CONFIG: Record<
  Exclude<SpotCategory, "all_route_spots">,
  CategorySearchConfig
> = {
  tourist_attraction: { type: "tourist_attraction", radius: 1500 },
  service_area: {
    keyword: "サービスエリア",
    radius: 5000,
    namePattern: /サービスエリア|パーキングエリア|SA|PA/i,
  },
  roadside_station: {
    keyword: "道の駅",
    radius: 5000,
    namePattern: /道の駅/,
  },
  restaurant: { type: "restaurant", radius: 1200 },
  cafe: { type: "cafe", radius: 1200 },
  museum: { type: "museum", radius: 1500 },
  park: { type: "park", radius: 1500 },
};

function getCategoryLabel(category: SpotCategory): string {
  return (
    SPOT_CATEGORIES.find((item) => item.id === category)?.label ?? category
  );
}

function resolveCategories(category: SpotCategory): Exclude<
  SpotCategory,
  "all_route_spots"
>[] {
  if (category === "all_route_spots") {
    return ALL_ROUTE_SPOT_CATEGORIES;
  }

  return [category];
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

function matchesCategory(place: NearbyPlace, config: CategorySearchConfig): boolean {
  if (!config.namePattern) {
    return true;
  }

  return config.namePattern.test(place.name);
}

async function searchNearbyAtPoint(
  point: LatLng,
  category: Exclude<SpotCategory, "all_route_spots">,
  apiKey: string,
): Promise<NearbyPlace[]> {
  const config = CATEGORY_SEARCH_CONFIG[category];
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
  );

  url.searchParams.set("location", `${point.lat},${point.lng}`);
  url.searchParams.set("radius", config.radius.toString());
  url.searchParams.set("language", "ja");
  url.searchParams.set("key", apiKey);

  if (config.type) {
    url.searchParams.set("type", config.type);
  }

  if (config.keyword) {
    url.searchParams.set("keyword", config.keyword);
  }

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

  return (data.results ?? []).filter((place) => matchesCategory(place, config));
}

function buildSamplePoints(
  polyline: string,
  destination?: LatLng,
): LatLng[] {
  const pathPoints = decodePolyline(polyline);
  const sampleCount = Math.min(
    8,
    Math.max(4, Math.ceil(pathPoints.length / 40)),
  );
  const samples = samplePointsAlongPath(pathPoints, sampleCount);

  if (destination) {
    samples.push(destination);
  }

  return samples;
}

async function searchCategoryAlongRoute(
  polyline: string,
  category: Exclude<SpotCategory, "all_route_spots">,
  samplePoints: LatLng[],
  apiKey: string,
): Promise<RecommendedSpot[]> {
  const spotMap = new Map<string, RecommendedSpot>();

  for (const point of samplePoints) {
    const places = await searchNearbyAtPoint(point, category, apiKey);

    for (const place of places) {
      if (!spotMap.has(place.place_id)) {
        spotMap.set(place.place_id, toRecommendedSpot(place, category));
      }
    }
  }

  return Array.from(spotMap.values())
    .sort((a, b) => {
      const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
      if (ratingDiff !== 0) {
        return ratingDiff;
      }

      return (b.userRatingsTotal ?? 0) - (a.userRatingsTotal ?? 0);
    })
    .slice(0, MAX_RESULTS);
}

export async function searchSpotsAlongRoute(
  polyline: string,
  category: SpotCategory,
  destination?: LatLng,
): Promise<SpotsSearchResult> {
  const apiKey = getServerGoogleMapsApiKey();

  if (!apiKey) {
    throw new PlacesError("Google Maps API キーが設定されていません");
  }

  if (!polyline) {
    throw new PlacesError("ルート情報が不足しているためスポットを検索できません");
  }

  const categories = resolveCategories(category);
  const samplePoints = buildSamplePoints(polyline, destination);
  const spotMap = new Map<string, RecommendedSpot>();

  for (const searchCategory of categories) {
    const spots = await searchCategoryAlongRoute(
      polyline,
      searchCategory,
      samplePoints,
      apiKey,
    );

    for (const spot of spots) {
      if (!spotMap.has(spot.id)) {
        spotMap.set(spot.id, spot);
      }
    }
  }

  const spots = Array.from(spotMap.values())
    .sort((a, b) => {
      const categoryOrder = categories.indexOf(
        a.category as Exclude<SpotCategory, "all_route_spots">,
      );
      const categoryOrderB = categories.indexOf(
        b.category as Exclude<SpotCategory, "all_route_spots">,
      );

      if (categoryOrder !== categoryOrderB) {
        return categoryOrder - categoryOrderB;
      }

      const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
      if (ratingDiff !== 0) {
        return ratingDiff;
      }

      return (b.userRatingsTotal ?? 0) - (a.userRatingsTotal ?? 0);
    })
    .slice(0, category === "all_route_spots" ? 20 : MAX_RESULTS);

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
