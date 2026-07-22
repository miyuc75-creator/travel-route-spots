"use client";

import { useState } from "react";

import type { EnvSetupStatus } from "@/lib/env";

type HealthResponse = {
  ok: boolean;
  message?: string;
  checks?: {
    geocoding: { ok: boolean; message: string };
    directions: { ok: boolean; message: string };
  };
};

type SetupGuideProps = {
  envStatus: EnvSetupStatus;
};

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
        ok
          ? "bg-emerald-100 text-emerald-800"
          : "bg-amber-100 text-amber-800"
      }`}
    >
      {label}: {ok ? "設定済み" : "未設定"}
    </span>
  );
}

export function SetupGuide({ envStatus }: SetupGuideProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HealthResponse | null>(null);

  async function handleTestConnection() {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/maps/health");
      const data = (await response.json()) as HealthResponse;
      setResult(data);
    } catch {
      setResult({
        ok: false,
        message: "接続テストに失敗しました。開発サーバーが起動しているか確認してください。",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 text-left shadow-sm">
      <h2 className="text-xl font-semibold text-zinc-900">
        Step 1: Google Maps Platform セットアップ
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        Google Cloud Console で API を有効化し、取得したキーを{" "}
        <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">.env.local</code>{" "}
        に設定してください。
      </p>

      <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm text-zinc-700">
        <li>
          <a
            className="text-sky-700 underline underline-offset-2"
            href="https://console.cloud.google.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Cloud Console
          </a>
          {" "}でプロジェクトを作成
        </li>
        <li>請求先アカウントをリンク（無料枠あり）</li>
        <li>
          以下の API を有効化:
          Maps JavaScript API / Directions API / Places API / Geocoding API
        </li>
        <li>認証情報 → API キーを 2 つ作成（サーバー用・ブラウザ用）</li>
        <li>
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">.env.local</code>{" "}
          にキーを貼り付け
        </li>
      </ol>

      <div className="mt-5 flex flex-wrap gap-2">
        <StatusBadge
          ok={envStatus.serverKeyConfigured}
          label="GOOGLE_MAPS_API_KEY"
        />
        <StatusBadge
          ok={envStatus.publicKeyConfigured}
          label="NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
        />
      </div>

      <button
        type="button"
        onClick={handleTestConnection}
        disabled={loading || !envStatus.ready}
        className="mt-5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        {loading ? "接続確認中..." : "API 接続を確認"}
      </button>

      {!envStatus.ready && (
        <p className="mt-3 text-sm text-amber-700">
          両方の環境変数を設定すると接続確認ができます。
        </p>
      )}

      {result && (
        <div
          className={`mt-4 rounded-lg border p-4 text-sm ${
            result.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <p className="font-medium">
            {result.ok ? "接続確認成功" : "接続確認失敗"}
          </p>
          {result.message && <p className="mt-1">{result.message}</p>}
          {result.checks && (
            <ul className="mt-2 space-y-1">
              <li>
                Geocoding API:{" "}
                {result.checks.geocoding.ok ? "OK" : result.checks.geocoding.message}
              </li>
              <li>
                Directions API:{" "}
                {result.checks.directions.ok ? "OK" : result.checks.directions.message}
              </li>
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
