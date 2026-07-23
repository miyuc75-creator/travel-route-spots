"use client";

import { useState } from "react";

import type { RouteOption } from "@/types/route";
import type {
  RecommendedSpot,
  SpotCategory,
  SpotsSearchResult,
} from "@/types/spot";
import { SPOT_CATEGORIES } from "@/types/spot";

type SpotsResponse =
  | ({ ok: true } & SpotsSearchResult)
  | { ok: false; message: string };

type NearbySpotsProps = {
  selectedRoute: RouteOption | null;
  destination?: { lat: number; lng: number; label: string };
  selectedSpotId: string | null;
  onSpotsChange: (spots: RecommendedSpot[]) => void;
  onSpotSelect: (spotId: string | null) => void;
};

function SpotCard({
  spot,
  rank,
  isSelected,
  onSelect,
}: {
  spot: RecommendedSpot;
  rank: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
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
          ? "border-amber-400 bg-amber-50/70 ring-2 ring-amber-200"
          : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200">
              {spot.categoryLabel}
            </span>
            {spot.openNow !== null && (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  spot.openNow
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-zinc-200 text-zinc-700"
                }`}
              >
                {spot.openNow ? "営業中" : "営業時間外"}
              </span>
            )}
          </div>
          <h3 className="mt-2 font-semibold text-zinc-900">{spot.name}</h3>
          <p className="mt-1 text-sm text-zinc-600">{spot.address}</p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white">
          #{rank}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        {spot.rating !== null && (
          <span className="font-medium text-zinc-900">
            ★ {spot.rating.toFixed(1)}
          </span>
        )}
        {spot.userRatingsTotal !== null && (
          <span className="text-zinc-500">
            ({spot.userRatingsTotal.toLocaleString("ja-JP")} 件)
          </span>
        )}
        <a
          href={spot.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="text-sky-700 underline underline-offset-2"
        >
          Google Maps で開く
        </a>
      </div>
    </article>
  );
}

export function NearbySpots({
  selectedRoute,
  destination,
  selectedSpotId,
  onSpotsChange,
  onSpotSelect,
}: NearbySpotsProps) {
  const [category, setCategory] = useState<SpotCategory>("all_route_spots");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SpotsSearchResult | null>(null);

  async function handleSearchSpots() {
    if (!selectedRoute?.polyline) {
      setError("ルートを選択してからスポットを検索してください");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    onSpotsChange([]);
    onSpotSelect(null);

    try {
      const response = await fetch("/api/maps/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          polyline: selectedRoute.polyline,
          category,
          destination: destination
            ? { lat: destination.lat, lng: destination.lng }
            : undefined,
        }),
      });

      const data = (await response.json()) as SpotsResponse;

      if (!data.ok) {
        setError(data.message);
        return;
      }

      setResult(data);
      onSpotsChange(data.spots);
    } catch {
      setError("周辺スポットの検索に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  const selectedCategory = SPOT_CATEGORIES.find((item) => item.id === category);

  return (
    <section className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-900">
        Step 5: ルート沿いのおすすめスポット
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        目的地までのルート沿いから、サービスエリア・道の駅・観光スポットなどを検索します。
      </p>

      <div className="mt-5">
        <p className="mb-2 text-xs font-medium text-zinc-500">カテゴリ</p>
        <div className="flex flex-wrap gap-2">
          {SPOT_CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              disabled={loading}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                category === item.id
                  ? "bg-amber-500 text-white"
                  : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {item.emoji} {item.label}
            </button>
          ))}
        </div>
        {selectedCategory?.description && (
          <p className="mt-2 text-xs text-zinc-500">{selectedCategory.description}</p>
        )}
      </div>

      <button
        type="button"
        onClick={handleSearchSpots}
        disabled={loading || !selectedRoute}
        className="mt-5 w-full rounded-lg bg-amber-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {loading ? "スポットを検索中..." : "おすすめスポットを検索"}
      </button>

      {!selectedRoute && (
        <p className="mt-3 text-sm text-amber-700">
          ルートを選択してから検索してください。
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-amber-900">
            {result.categoryLabel} — {result.spots.length} 件見つかりました
          </p>
          {result.spots.map((spot, index) => (
            <SpotCard
              key={spot.id}
              spot={spot}
              rank={index + 1}
              isSelected={selectedSpotId === spot.id}
              onSelect={() =>
                onSpotSelect(selectedSpotId === spot.id ? null : spot.id)
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
