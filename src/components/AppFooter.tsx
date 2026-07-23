export function AppFooter() {
  return (
    <footer className="mt-auto w-full border-t border-zinc-200 bg-white/80 py-6">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 px-4 text-center text-sm text-zinc-500">
        <p>旅行ルート・周辺スポット検索 — Portfolio Project</p>
        <a
          href="https://github.com/miyuc75-creator/travel-route-spots"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-700 underline underline-offset-2 hover:text-sky-800"
        >
          GitHub リポジトリ
        </a>
      </div>
    </footer>
  );
}
