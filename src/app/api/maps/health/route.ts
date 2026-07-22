import { NextResponse } from "next/server";

import { getEnvSetupStatus } from "@/lib/env";
import { verifyGoogleMapsConnection } from "@/lib/google-maps/verify-connection";

export async function GET() {
  const envStatus = getEnvSetupStatus();

  if (!envStatus.ready) {
    return NextResponse.json(
      {
        ok: false,
        env: envStatus,
        message: "環境変数が未設定です。.env.local を確認してください。",
      },
      { status: 400 },
    );
  }

  const result = await verifyGoogleMapsConnection();

  return NextResponse.json(
    {
      ok: result.allOk,
      env: envStatus,
      checks: {
        geocoding: result.geocoding,
        directions: result.directions,
      },
    },
    { status: result.allOk ? 200 : 502 },
  );
}
