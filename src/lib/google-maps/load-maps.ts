import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

const PLACEHOLDER = "your_api_key_here";

let initialized = false;
let loadPromise: Promise<typeof google> | null = null;

export function loadGoogleMaps(): Promise<typeof google> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === PLACEHOLDER) {
    return Promise.reject(
      new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY が設定されていません"),
    );
  }

  if (!loadPromise) {
    loadPromise = (async () => {
      if (!initialized) {
        setOptions({
          key: apiKey,
          v: "weekly",
          language: "ja",
          region: "JP",
        });
        initialized = true;
      }

      await importLibrary("maps");
      await importLibrary("geometry");

      return google;
    })();
  }

  return loadPromise;
}

export function getRouteColor(mode: string): string {
  switch (mode) {
    case "driving":
      return "#2563eb";
    case "transit":
      return "#ea580c";
    case "walking":
      return "#16a34a";
    case "bicycling":
      return "#9333ea";
    default:
      return "#0284c7";
  }
}

export function getSpotMarkerColor(category: string, isSelected: boolean): string {
  if (isSelected) {
    return "#f59e0b";
  }

  switch (category) {
    case "service_area":
      return "#2563eb";
    case "roadside_station":
      return "#16a34a";
    case "tourist_attraction":
      return "#ea580c";
    default:
      return "#fb923c";
  }
}
