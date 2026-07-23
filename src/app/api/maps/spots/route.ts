import { NextResponse } from "next/server";

import { searchSpotsAlongRoute, PlacesError } from "@/lib/google-maps/places";
import type { SpotsSearchRequest } from "@/types/spot";

export async function POST(request: Request) {
  let body: SpotsSearchRequest;

  try {
    body = (await request.json()) as SpotsSearchRequest;
  } catch {
    return NextResponse.json(
      { ok: false, message: "リクエスト形式が正しくありません" },
      { status: 400 },
    );
  }

  if (!body.polyline || !body.category) {
    return NextResponse.json(
      { ok: false, message: "ルートとカテゴリが必要です" },
      { status: 400 },
    );
  }

  try {
    const result = await searchSpotsAlongRoute(
      body.polyline,
      body.category,
      body.destination,
    );

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof PlacesError
        ? error.message
        : "周辺スポットの検索に失敗しました";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
