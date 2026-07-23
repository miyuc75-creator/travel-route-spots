export type TransportMode = "transit" | "driving" | "walking" | "bicycling";

export type TransportModeInfo = {
  mode: TransportMode;
  label: string;
  emoji: string;
};

export const TRANSPORT_MODES: TransportModeInfo[] = [
  { mode: "transit", label: "公共交通", emoji: "🚃" },
  { mode: "driving", label: "車", emoji: "🚗" },
  { mode: "walking", label: "徒歩", emoji: "🚶" },
  { mode: "bicycling", label: "自転車", emoji: "🚲" },
];

export type RouteOption = {
  id: string;
  mode: TransportMode;
  modeLabel: string;
  summary: string;
  distanceText: string;
  distanceMeters: number;
  durationText: string;
  durationSeconds: number;
  fareText: string | null;
  fareNote: string | null;
  fareYen: number | null;
  isAlternative: boolean;
  steps: string[];
  polyline: string;
};

export type RouteSearchResult = {
  origin: string;
  destination: string;
  routes: RouteOption[];
  unavailableModes: TransportMode[];
};

export type RouteSearchRequest = {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  originLabel?: string;
  destinationLabel?: string;
};
