export type SpotCategory =
  | "all_route_spots"
  | "tourist_attraction"
  | "service_area"
  | "roadside_station"
  | "restaurant"
  | "cafe"
  | "museum"
  | "park";

export type SpotCategoryInfo = {
  id: SpotCategory;
  label: string;
  emoji: string;
  description?: string;
};

export const SPOT_CATEGORIES: SpotCategoryInfo[] = [
  {
    id: "all_route_spots",
    label: "ルート沿いすべて",
    emoji: "🗺️",
    description: "観光・サービスエリア・道の駅など",
  },
  { id: "service_area", label: "サービスエリア", emoji: "⛽" },
  { id: "roadside_station", label: "道の駅", emoji: "🚏" },
  { id: "tourist_attraction", label: "観光スポット", emoji: "🏛️" },
  { id: "restaurant", label: "グルメ", emoji: "🍽️" },
  { id: "cafe", label: "カフェ", emoji: "☕" },
  { id: "museum", label: "美術館・博物館", emoji: "🎨" },
  { id: "park", label: "公園", emoji: "🌳" },
];

export const ALL_ROUTE_SPOT_CATEGORIES: Exclude<
  SpotCategory,
  "all_route_spots"
>[] = [
  "tourist_attraction",
  "service_area",
  "roadside_station",
  "restaurant",
  "park",
];

export type RecommendedSpot = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  userRatingsTotal: number | null;
  category: SpotCategory;
  categoryLabel: string;
  openNow: boolean | null;
  googleMapsUrl: string;
};

export type SpotsSearchRequest = {
  polyline: string;
  category?: SpotCategory;
  destination?: { lat: number; lng: number };
};

export type SpotsSearchResult = {
  category: SpotCategory;
  categoryLabel: string;
  spots: RecommendedSpot[];
};

export type RouteFilterOption = "all" | "fastest" | "cheapest";

export type RouteFilterInfo = {
  fastestRouteIds: string[];
  cheapestRouteIds: string[];
};
