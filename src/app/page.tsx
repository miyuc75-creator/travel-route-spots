import { AppFooter } from "@/components/AppFooter";
import { SetupGuide } from "@/components/SetupGuide";
import { TripPlanner } from "@/components/TripPlanner";
import { getEnvSetupStatus } from "@/lib/env";

export default function Home() {
  const envStatus = getEnvSetupStatus();

  return (
    <>
      <div className="flex flex-1 flex-col items-center bg-gradient-to-b from-sky-50 to-white px-4 py-12">
        <main className="flex w-full max-w-3xl flex-col items-center gap-8">
          <div className="text-center">
            <p className="text-sm font-medium tracking-wide text-sky-600 uppercase">
              Portfolio Project
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              旅行ルート・周辺スポット検索
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-zinc-600">
              出発地と目的地から、交通手段別のルート・所要時間・概算料金と、
              サービスエリア・道の駅・観光スポットをまとめて確認できます。
            </p>
          </div>

          <TripPlanner disabled={!envStatus.ready} />

          {!envStatus.ready && (
            <p className="text-sm text-amber-700">
              ルート検索を使うには Google Maps API キーの設定が必要です。
            </p>
          )}

          {!envStatus.ready && (
            <SetupGuide envStatus={envStatus} defaultOpen />
          )}
        </main>
      </div>
      <AppFooter />
    </>
  );
}
