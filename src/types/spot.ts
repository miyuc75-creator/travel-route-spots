export type SpotCategory =
  | "tourist_attraction"
  | "restaurant"
  | "cafe"
  | "museum"
  | "park";

export type SpotCategoryInfo = {
  id: SpotCategory;
  label: string;
  emoji: string;
};

export const SPOT_CATEGORIES: SpotCategoryInfo[] = [
  { id: "tourist_attraction", label: "観光スポット", emoji: "🏛️" },
  { id: "restaurant", label: "グルメ", emoji: "🍽️" },
  { id: "cafe", label: "カフェ", emoji: "☕" },
  { id: "museum", label: "美術館・博物館", emoji: "🎨" },
  { id: "park", label: "公園", emoji: "🌳" },
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
  category: SpotCategory;
};

export type SpotsSearchResult = {
  category: SpotCategory;
  categoryLabel: string;
  spots: RecommendedSpot[];
};
