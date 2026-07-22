import { SetupGuide } from "@/components/SetupGuide";
import { TripPlanner } from "@/components/TripPlanner";
import { getEnvSetupStatus } from "@/lib/env";

export default function Home() {
  const envStatus = getEnvSetupStatus();

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-sky-50 to-white px-4 py-12">
      <main className="flex w-full max-w-3xl flex-col items-center gap-8">
        <div className="text-center">
          <p className="text-sm font-medium tracking-wide text-sky-600 uppercase">
            Portfolio Project
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            旅行ルート・周辺スポット検索
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600">
            出発地と目的地を入力すると、交通手段ごとのルート・所要時間・距離・概算料金と、
            ルート沿いのおすすめスポットをまとめて確認できます。
          </p>
        </div>

        <TripPlanner disabled={!envStatus.ready} />

        {!envStatus.ready && (
          <p className="text-sm text-amber-700">
            ルート検索フォームを使うには、先に Google Maps API キーを設定してください。
          </p>
        )}

        <SetupGuide
          envStatus={envStatus}
          defaultOpen={!envStatus.ready}
        />
      </main>
    </div>
  );
}
