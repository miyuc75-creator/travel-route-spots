import type { RouteFilterInfo, RouteFilterOption } from "@/types/spot";
import type { RouteOption } from "@/types/route";

export function getRouteFilterInfo(routes: RouteOption[]): RouteFilterInfo {
  if (routes.length === 0) {
    return { fastestRouteIds: [], cheapestRouteIds: [] };
  }

  const minDuration = Math.min(...routes.map((route) => route.durationSeconds));
  const routesWithFare = routes.filter((route) => route.fareYen !== null);

  const fastestRouteIds = routes
    .filter((route) => route.durationSeconds === minDuration)
    .map((route) => route.id);

  const cheapestRouteIds =
    routesWithFare.length > 0
      ? routesWithFare
          .filter(
            (route) =>
              route.fareYen ===
              Math.min(...routesWithFare.map((item) => item.fareYen as number)),
          )
          .map((route) => route.id)
      : [];

  return { fastestRouteIds, cheapestRouteIds };
}

export function applyRouteFilter(
  routes: RouteOption[],
  filter: RouteFilterOption,
): RouteOption[] {
  if (filter === "all") {
    return routes;
  }

  const { fastestRouteIds, cheapestRouteIds } = getRouteFilterInfo(routes);

  if (filter === "fastest") {
    return routes.filter((route) => fastestRouteIds.includes(route.id));
  }

  return routes.filter((route) => cheapestRouteIds.includes(route.id));
}

export function sortRoutesForDisplay(
  routes: RouteOption[],
  filter: RouteFilterOption,
): RouteOption[] {
  const sorted = [...routes];

  if (filter === "cheapest") {
    return sorted.sort((a, b) => {
      const fareA = a.fareYen ?? Number.MAX_SAFE_INTEGER;
      const fareB = b.fareYen ?? Number.MAX_SAFE_INTEGER;

      if (fareA !== fareB) {
        return fareA - fareB;
      }

      return a.durationSeconds - b.durationSeconds;
    });
  }

  return sorted.sort((a, b) => {
    if (a.durationSeconds !== b.durationSeconds) {
      return a.durationSeconds - b.durationSeconds;
    }

    const fareA = a.fareYen ?? Number.MAX_SAFE_INTEGER;
    const fareB = b.fareYen ?? Number.MAX_SAFE_INTEGER;
    return fareA - fareB;
  });
}
