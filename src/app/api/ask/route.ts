import { NextResponse } from "next/server";

import { getRequestUser } from "@/lib/auth";
import { appConfig } from "@/lib/config";
import { askVertexGroundedQuestion } from "@/lib/genai";
import { getMockAnswer } from "@/lib/mock/mockService";
import type { AskRequest } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
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

  let payload: AskRequest;

  try {
    payload = (await request.json()) as AskRequest;
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

  const question = payload.question?.trim();
  if (!question) {
    return NextResponse.json(
      {
        ok: false,
        error: "กรุณาระบุคำถามก่อนส่ง",
        requestId,
      },
      { status: 400 },
    );
  }

  try {
    if (appConfig.mockMode) {
      const mockResponse = await getMockAnswer(question, requestId);
      return NextResponse.json(mockResponse);
    }

    const response = await askVertexGroundedQuestion(
      question,
      user,
      requestId,
      payload.department,
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error(`[api/ask][${requestId}]`, error);

    return NextResponse.json(
      {
        ok: false,
        error: "ระบบไม่สามารถตอบคำถามได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
        requestId,
        latencyMs: Date.now() - startedAt,
      },
      { status: 500 },
    );
  }
}
