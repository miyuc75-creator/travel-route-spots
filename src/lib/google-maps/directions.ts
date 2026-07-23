import type { GeocodedLocation } from "@/types/location";
import type {
  RouteOption,
  RouteSearchResult,
  TransportMode,
} from "@/types/route";
import { TRANSPORT_MODES } from "@/types/route";

import { getServerGoogleMapsApiKey } from "../env";
import {
  estimateDrivingCostYen,
  formatDistance,
  formatDuration,
  formatYen,
} from "./format";

type DirectionsLeg = {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  duration_in_traffic?: { text: string; value: number };
  steps: Array<{
    travel_mode: string;
    html_instructions: string;
    transit_details?: {
      line: { name: string; vehicle: { type: string } };
    };
  }>;
};

type DirectionsRoute = {
  summary: string;
  legs: DirectionsLeg[];
  overview_polyline?: {
    points: string;
  };
  fare?: {
    currency: string;
    value: number;
    text: string;
  };
  warnings?: string[];
};

type DirectionsResponse = {
  status: string;
  routes: DirectionsRoute[];
  error_message?: string;
};

export class DirectionsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DirectionsError";
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function summarizeSteps(legs: DirectionsLeg[]): string[] {
  return legs
    .flatMap((leg) => leg.steps ?? [])
    .map((step) => {
      if (step.transit_details?.line?.name) {
        return step.transit_details.line.name;
      }

      if (step.html_instructions) {
        return stripHtml(step.html_instructions);
      }

      return "";
    })
    .filter(Boolean)
    .slice(0, 5);
}

function aggregateRouteLegs(route: DirectionsRoute): {
  distanceMeters: number;
  distanceText: string;
  durationSeconds: number;
  durationText: string;
} | null {
  if (route.legs.length === 0) {
    return null;
  }

  const distanceMeters = route.legs.reduce(
    (total, leg) => total + (leg.distance?.value ?? 0),
    0,
  );
  const durationSeconds = route.legs.reduce(
    (total, leg) => total + (leg.duration?.value ?? 0),
    0,
  );

  const lastLeg = route.legs[route.legs.length - 1];

  return {
    distanceMeters,
    distanceText: formatDistance(distanceMeters),
    durationSeconds,
    durationText: lastLeg.duration?.text || formatDuration(durationSeconds),
  };
}

function buildFareInfo(
  mode: TransportMode,
  route: DirectionsRoute,
  distanceMeters: number,
): {
  fareText: string | null;
  fareNote: string | null;
  fareYen: number | null;
} {
  if (mode === "walking" || mode === "bicycling") {
    return { fareText: "無料", fareNote: null, fareYen: 0 };
  }

  if (route.fare) {
    return {
      fareText: route.fare.text,
      fareNote: null,
      fareYen: route.fare.value,
    };
  }

  if (mode === "driving") {
    const estimate = estimateDrivingCostYen(distanceMeters);
    return {
      fareText: formatYen(estimate),
      fareNote: "燃料・高速道路の概算（参考値）",
      fareYen: estimate,
    };
  }

  if (mode === "transit") {
    return {
      fareText: null,
      fareNote: "運賃情報は取得できませんでした",
      fareYen: null,
    };
  }

  return { fareText: null, fareNote: null, fareYen: null };
}

function parseRoute(
  route: DirectionsRoute,
  mode: TransportMode,
  modeLabel: string,
  index: number,
): RouteOption | null {
  const aggregated = aggregateRouteLegs(route);

  if (!aggregated) {
    return null;
  }

  const { fareText, fareNote, fareYen } = buildFareInfo(
    mode,
    route,
    aggregated.distanceMeters,
  );

  return {
    id: `${mode}-${index}`,
    mode,
    modeLabel,
    summary: route.summary || modeLabel,
    distanceText: aggregated.distanceText,
    distanceMeters: aggregated.distanceMeters,
    durationText: aggregated.durationText,
    durationSeconds: aggregated.durationSeconds,
    fareText,
    fareNote,
    fareYen,
    isAlternative: index > 0,
    steps: summarizeSteps(route.legs),
    polyline: route.overview_polyline?.points ?? "",
  };
}

async function fetchDirectionsForMode(
  origin: GeocodedLocation,
  destination: GeocodedLocation,
  mode: TransportMode,
): Promise<RouteOption[]> {
  try {
    const apiKey = getServerGoogleMapsApiKey();

    if (!apiKey) {
      throw new DirectionsError("Google Maps API キーが設定されていません");
    }

    const modeInfo = TRANSPORT_MODES.find((item) => item.mode === mode);
    const modeLabel = modeInfo?.label ?? mode;

    const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
    url.searchParams.set(
      "origin",
      mode === "transit" ? origin.formattedAddress : origin.input,
    );
    url.searchParams.set(
      "destination",
      mode === "transit"
        ? destination.formattedAddress
        : destination.input,
    );
    url.searchParams.set("mode", mode);
    url.searchParams.set("language", "ja");
    url.searchParams.set("region", "jp");
    url.searchParams.set("key", apiKey);

    if (mode === "driving") {
      url.searchParams.set("alternatives", "true");
    }

    if (mode === "transit") {
      url.searchParams.set(
        "departure_time",
        Math.floor(Date.now() / 1000).toString(),
      );
    }

    const response = await fetch(url.toString(), { cache: "no-store" });

    if (!response.ok) {
      return [];
    }

    const data = (await response.json()) as DirectionsResponse;

    if (data.status !== "OK" || data.routes.length === 0) {
      return [];
    }

    return data.routes
      .map((route, index) => parseRoute(route, mode, modeLabel, index))
      .filter((route): route is RouteOption => route !== null);
  } catch {
    return [];
  }
}

export async function searchRoutes(
  origin: GeocodedLocation,
  destination: GeocodedLocation,
): Promise<RouteSearchResult> {
  const modes = TRANSPORT_MODES.map((item) => item.mode);
  const unavailableModes: TransportMode[] = [];
  const routes: RouteOption[] = [];

  for (const mode of modes) {
    const modeRoutes = await fetchDirectionsForMode(origin, destination, mode);

    if (modeRoutes.length === 0) {
      unavailableModes.push(mode);
    } else {
      routes.push(...modeRoutes);
    }
  }

  if (routes.length === 0) {
    throw new DirectionsError("利用可能なルートが見つかりませんでした");
  }

  routes.sort((a, b) => a.durationSeconds - b.durationSeconds);

  return {
    origin: origin.input,
    destination: destination.input,
    routes,
    unavailableModes,
  };
}
