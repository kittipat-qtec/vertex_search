import { NextResponse } from "next/server";

import { getRequestUser } from "@/lib/auth";
import { appConfig, hasVertexSearchConfig } from "@/lib/config";
import { askVertexGroundedQuestion } from "@/lib/genai";
import { searchMockChunks } from "@/lib/mock/mockService";
import type { DebugSearchRequest, DebugSearchResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const user = getRequestUser(request.headers);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error: "ไม่พบข้อมูลผู้ใช้จากระบบยืนยันตัวตน",
        requestId,
      },
      { status: 401 },
    );
  }

  let payload: DebugSearchRequest;

  try {
    payload = (await request.json()) as DebugSearchRequest;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "รูปแบบคำขอไม่ถูกต้อง",
        requestId,
      },
      { status: 400 },
    );
  }

  const query = payload.query?.trim();
  if (!query) {
    return NextResponse.json(
      {
        ok: false,
        error: "กรุณาระบุคำค้นก่อนส่ง",
        requestId,
      },
      { status: 400 },
    );
  }

  try {
    if (appConfig.mockMode) {
      const chunks = await searchMockChunks(query);
      const response: DebugSearchResponse = {
        ok: true,
        chunks,
        requestId,
        mock: true,
        query,
      };

      return NextResponse.json(response);
    }

    if (!hasVertexSearchConfig()) {
      return NextResponse.json(
        {
          ok: false,
          error: "ยังไม่ได้ตั้งค่า Vertex AI Search datastore สำหรับโหมดจริง",
          requestId,
        },
        { status: 503 },
      );
    }

    const answer = await askVertexGroundedQuestion(query, user, requestId);
    const response: DebugSearchResponse = {
      ok: true,
      chunks: answer.sources,
      requestId,
      mock: false,
      query,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`[api/search/debug][${requestId}]`, error);

    return NextResponse.json(
      {
        ok: false,
        error: "ระบบไม่สามารถดึง retrieval chunks ได้ในขณะนี้",
        requestId,
      },
      { status: 500 },
    );
  }
}
