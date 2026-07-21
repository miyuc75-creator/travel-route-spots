export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white px-4">
      <main className="flex max-w-2xl flex-col items-center gap-6 text-center">
        <p className="text-sm font-medium tracking-wide text-sky-600 uppercase">
          Portfolio Project
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
          旅行ルート・周辺スポット検索
        </h1>
        <p className="text-lg leading-relaxed text-zinc-600">
          出発地と目的地を入力すると、交通手段ごとのルート・所要時間・距離・概算料金と、
          ルート沿いのおすすめスポットをまとめて確認できます。
        </p>
        <p className="rounded-full bg-zinc-100 px-4 py-2 text-sm text-zinc-500">
          開発中 — 機能は順次追加予定
        </p>
      </main>
    </div>
  );
}
