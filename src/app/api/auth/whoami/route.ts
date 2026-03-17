import { NextResponse } from "next/server";

import { getRequestUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = getRequestUser(request.headers);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error: "ไม่สามารถระบุตัวตนผู้ใช้งานจาก IIS headers ได้",
      },
      { status: 401 },
    );
  }

  return NextResponse.json({
    ok: true,
    user,
  });
}
