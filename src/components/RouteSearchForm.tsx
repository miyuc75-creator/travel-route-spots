"use client";

import { useState } from "react";

import type { ValidatedRouteSearch } from "@/types/location";

type ValidateRouteResponse =
  | ({ ok: true } & ValidatedRouteSearch)
  | { ok: false; message: string };

type RouteSearchFormProps = {
  disabled?: boolean;
  onValidated?: (route: ValidatedRouteSearch | null) => void;
};

const EXAMPLE_ROUTES = [
  { origin: "東京駅", destination: "浅草寺" },
  { origin: "新宿駅", destination: "横浜駅" },
  { origin: "京都駅", destination: "金閣寺" },
] as const;

function LocationField({
  id,
  label,
  value,
  placeholder,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-zinc-700">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-zinc-100"
      />
    </div>
  );
}

function ValidatedLocationCard({
  label,
  location,
}: {
  label: string;
  location: ValidatedRouteSearch["origin"];
}) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
        {label}
      </p>
      <p className="mt-1 font-medium text-zinc-900">{location.input}</p>
      <p className="mt-1 text-sm text-zinc-600">{location.formattedAddress}</p>
    </div>
  );
}

export function RouteSearchForm({
  disabled = false,
  onValidated,
}: RouteSearchFormProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatedRoute, setValidatedRoute] = useState<ValidatedRouteSearch | null>(
    null,
  );

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
    setValidatedRoute(null);
    setError(null);
    onValidated?.(null);
  }

  function applyExample(example: (typeof EXAMPLE_ROUTES)[number]) {
    setOrigin(example.origin);
    setDestination(example.destination);
    setValidatedRoute(null);
    setError(null);
    onValidated?.(null);
  }

  function updateOrigin(value: string) {
    setOrigin(value);
    setValidatedRoute(null);
    onValidated?.(null);
  }

  function updateDestination(value: string) {
    setDestination(value);
    setValidatedRoute(null);
    onValidated?.(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setValidatedRoute(null);
    onValidated?.(null);

    try {
      const response = await fetch("/api/maps/validate-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination }),
      });

      const data = (await response.json()) as ValidateRouteResponse;

      if (!data.ok) {
        setError(data.message);
        return;
      }

      setValidatedRoute({
        origin: data.origin,
        destination: data.destination,
      });
      onValidated?.({
        origin: data.origin,
        destination: data.destination,
      });
    } catch {
      setError("ルートの確認に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-900">
        Step 2: 出発地・目的地を入力
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        住所・駅名・観光スポット名などを入力してください。Geocoding API で位置を確認します。
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <LocationField
          id="origin"
          label="出発地"
          value={origin}
          placeholder="例: 東京駅、渋谷スクランブル交差点"
          onChange={updateOrigin}
          disabled={disabled || loading}
        />

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSwap}
            disabled={disabled || loading || (!origin && !destination)}
            className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="出発地と目的地を入れ替え"
          >
            ⇅ 入れ替え
          </button>
        </div>

        <LocationField
          id="destination"
          label="目的地"
          value={destination}
          placeholder="例: 浅草寺、大阪城"
          onChange={updateDestination}
          disabled={disabled || loading}
        />

        <div>
          <p className="mb-2 text-xs font-medium text-zinc-500">入力例</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_ROUTES.map((example) => (
              <button
                key={`${example.origin}-${example.destination}`}
                type="button"
                onClick={() => applyExample(example)}
                disabled={disabled || loading}
                className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {example.origin} → {example.destination}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || loading || !origin.trim() || !destination.trim()}
          className="w-full rounded-lg bg-sky-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {loading ? "位置を確認中..." : "位置を確認する"}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {error}
        </div>
      )}

      {validatedRoute && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium text-emerald-800">
            位置の確認が完了しました。下の Step 3 でルートを検索できます。
          </p>
          <ValidatedLocationCard label="出発地" location={validatedRoute.origin} />
          <ValidatedLocationCard
            label="目的地"
            location={validatedRoute.destination}
          />
        </div>
      )}
    </section>
  );
}
