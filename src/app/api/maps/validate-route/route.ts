import { NextResponse } from "next/server";

import {
  GeocodingError,
  validateRouteSearch,
} from "@/lib/google-maps/geocode";
import type { RouteSearchInput } from "@/types/location";

export async function POST(request: Request) {
  let body: RouteSearchInput;

  try {
    body = (await request.json()) as RouteSearchInput;
  } catch {
    return NextResponse.json(
      { ok: false, message: "リクエスト形式が正しくありません" },
      { status: 400 },
    );
  }

  try {
    const result = await validateRouteSearch(body.origin, body.destination);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    const message =
      error instanceof GeocodingError
        ? error.message
        : "位置情報の確認に失敗しました";

    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}
