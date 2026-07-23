"use client";

import { useEffect, useMemo, useState } from "react";

import { NearbySpots } from "@/components/NearbySpots";
import { RouteMap } from "@/components/RouteMap";
import type { ValidatedRouteSearch } from "@/types/location";
import type { RouteOption, RouteSearchResult, TransportMode } from "@/types/route";
import { TRANSPORT_MODES } from "@/types/route";
import type { RecommendedSpot } from "@/types/spot";

type RoutesResponse =
  | ({ ok: true } & RouteSearchResult)
  | { ok: false; message: string };

type RouteResultsProps = {
  validatedRoute: ValidatedRouteSearch;
};

function RouteCard({
  route,
  rank,
  isSelected,
  onSelect,
}: {
  route: RouteOption;
  rank: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const modeInfo = TRANSPORT_MODES.find((item) => item.mode === route.mode);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      className={`rounded-xl border p-4 transition ${
        isSelected
          ? "border-sky-400 bg-sky-50/70 ring-2 ring-sky-200"
          : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200">
              {modeInfo?.emoji} {route.modeLabel}
            </span>
            {route.isAlternative && (
              <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700">
                代替ルート
              </span>
            )}
            {isSelected && (
              <span className="rounded-full bg-sky-600 px-2.5 py-1 text-xs font-medium text-white">
                地図表示中
              </span>
            )}
          </div>
          <h3 className="mt-2 font-semibold text-zinc-900">{route.summary}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white">
          #{rank}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-xs text-zinc-500">所要時間</dt>
          <dd className="mt-1 font-medium text-zinc-900">{route.durationText}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">距離</dt>
          <dd className="mt-1 font-medium text-zinc-900">{route.distanceText}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">概算料金</dt>
          <dd className="mt-1 font-medium text-zinc-900">
            {route.fareText ?? "—"}
          </dd>
        </div>
      </dl>

      {route.fareNote && (
        <p className="mt-2 text-xs text-zinc-500">{route.fareNote}</p>
      )}

      {route.steps.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-zinc-600">
          {route.steps.map((step, index) => (
            <li key={`${route.id}-step-${index}`} className="truncate">
              • {step}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function RouteResults({ validatedRoute }: RouteResultsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RouteSearchResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<TransportMode | "all">("all");
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [spots, setSpots] = useState<RecommendedSpot[]>([]);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  const filteredRoutes = useMemo(() => {
    if (!result) {
      return [];
    }

    if (selectedMode === "all") {
      return result.routes;
    }

    return result.routes.filter((route) => route.mode === selectedMode);
  }, [result, selectedMode]);

  const availableModes = useMemo(() => {
    if (!result) {
      return [];
    }

    return TRANSPORT_MODES.filter((modeInfo) =>
      result.routes.some((route) => route.mode === modeInfo.mode),
    );
  }, [result]);

  const selectedRoute = useMemo(() => {
    if (filteredRoutes.length === 0) {
      return null;
    }

    return (
      filteredRoutes.find((route) => route.id === selectedRouteId) ??
      filteredRoutes[0]
    );
  }, [filteredRoutes, selectedRouteId]);

  useEffect(() => {
    if (result?.routes[0]) {
      setSelectedRouteId(result.routes[0].id);
    }
  }, [result]);

  useEffect(() => {
    if (
      filteredRoutes.length > 0 &&
      !filteredRoutes.some((route) => route.id === selectedRouteId)
    ) {
      setSelectedRouteId(filteredRoutes[0].id);
    }
  }, [filteredRoutes, selectedRouteId]);

  useEffect(() => {
    setSpots([]);
    setSelectedSpotId(null);
  }, [selectedRouteId]);

  async function handleSearchRoutes() {
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedRouteId(null);
    setSpots([]);
    setSelectedSpotId(null);

    try {
      const response = await fetch("/api/maps/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedRoute),
      });

      const data = (await response.json()) as RoutesResponse;

      if (!data.ok) {
        setError(data.message);
        return;
      }

      setResult(data);
      setSelectedMode("all");
    } catch {
      setError("ルート検索に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-900">
          Step 3: ルート検索
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          公共交通・車・徒歩・自転車ごとに複数ルートを検索し、所要時間・距離・概算料金を表示します。
        </p>

        <button
          type="button"
          onClick={handleSearchRoutes}
          disabled={loading}
          className="mt-5 w-full rounded-lg bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {loading ? "ルートを検索中..." : "ルートを検索する"}
        </button>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-900">
              <p className="font-medium">
                {result.origin} → {result.destination}
              </p>
              <p className="mt-1">
                {result.routes.length} 件のルートが見つかりました
              </p>
              {result.unavailableModes.length > 0 && (
                <p className="mt-1 text-xs text-zinc-500">
                  {result.unavailableModes
                    .map(
                      (mode) =>
                        TRANSPORT_MODES.find((item) => item.mode === mode)
                          ?.label ?? mode,
                    )
                    .join("、")}
                  はこの区間ではルートが見つかりませんでした
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedMode("all")}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  selectedMode === "all"
                    ? "bg-sky-600 text-white"
                    : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                すべて
              </button>
              {availableModes.map((modeInfo) => (
                <button
                  key={modeInfo.mode}
                  type="button"
                  onClick={() => setSelectedMode(modeInfo.mode)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    selectedMode === modeInfo.mode
                      ? "bg-sky-600 text-white"
                      : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {modeInfo.emoji} {modeInfo.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredRoutes.map((route, index) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  rank={index + 1}
                  isSelected={selectedRoute?.id === route.id}
                  onSelect={() => setSelectedRouteId(route.id)}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {result && (
        <section className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm">
          <h2 className="text-xl font-semibold text-zinc-900">
            Step 4: 地図表示
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            選択したルートを地図上に表示します。ルートカードをクリックすると地図が切り替わります。
          </p>

          <div className="mt-5">
            <RouteMap
              origin={{
                lat: validatedRoute.origin.lat,
                lng: validatedRoute.origin.lng,
                label: validatedRoute.origin.input,
              }}
              destination={{
                lat: validatedRoute.destination.lat,
                lng: validatedRoute.destination.lng,
                label: validatedRoute.destination.input,
              }}
              selectedRoute={selectedRoute}
              spots={spots}
              selectedSpotId={selectedSpotId}
            />
          </div>
        </section>
      )}

      {result && (
        <NearbySpots
          selectedRoute={selectedRoute}
          selectedSpotId={selectedSpotId}
          onSpotsChange={setSpots}
          onSpotSelect={setSelectedSpotId}
        />
      )}
    </>
  );
}
