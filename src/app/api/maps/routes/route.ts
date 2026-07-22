import { NextResponse } from "next/server";

import { searchRoutes, DirectionsError } from "@/lib/google-maps/directions";
import type { ValidatedRouteSearch } from "@/types/location";

export async function POST(request: Request) {
  let body: ValidatedRouteSearch;

  try {
    body = (await request.json()) as ValidatedRouteSearch;
  } catch {
    return NextResponse.json(
      { ok: false, message: "リクエスト形式が正しくありません" },
      { status: 400 },
    );
  }

  if (!body.origin?.lat || !body.destination?.lat) {
    return NextResponse.json(
      { ok: false, message: "出発地と目的地の位置情報が必要です" },
      { status: 400 },
    );
  }

  try {
    const result = await searchRoutes(body.origin, body.destination);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof DirectionsError
        ? error.message
        : "ルート検索に失敗しました";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
