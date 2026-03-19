import { NextResponse } from "next/server";

import { getRequestUser } from "@/lib/auth";
import { getAssistantProfileResponse } from "@/lib/assistant-profile";
import { appConfig } from "@/lib/config";
import { askVertexGroundedQuestion } from "@/lib/genai";
import { logger } from "@/lib/logger";
import { getMockAnswer } from "@/lib/mock/mockService";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";
import { sanitizeQuestion } from "@/lib/sanitize";
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

  // Rate limiting
  const rateLimitId = getRateLimitIdentifier(request);
  const rateLimit = checkRateLimit(rateLimitId);

  if (!rateLimit.allowed) {
    logger.warn("Rate limit exceeded", {
      requestId,
      userId: user.username,
      retryAfterMs: rateLimit.retryAfterMs,
    });

    return NextResponse.json(
      {
        ok: false,
        error: `คุณส่งคำถามเร็วเกินไป กรุณารอ ${Math.ceil((rateLimit.retryAfterMs ?? 0) / 1000)} วินาที`,
        requestId,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rateLimit.retryAfterMs ?? 0) / 1000)),
        },
      },
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

  const rawQuestion = payload.question?.trim();
  if (!rawQuestion) {
    return NextResponse.json(
      {
        ok: false,
        error: "กรุณาระบุคำถามก่อนส่ง",
        requestId,
      },
      { status: 400 },
    );
  }

  const { clean: question, flagged, reason } = sanitizeQuestion(rawQuestion);

  if (flagged) {
    logger.warn("Flagged input detected", {
      requestId,
      userId: user.username,
      reason,
    });

    return NextResponse.json(
      {
        ok: false,
        error: reason,
        requestId,
      },
      { status: 400 },
    );
  }

  try {
    const assistantProfileResponse = getAssistantProfileResponse(
      question,
      user,
      requestId,
    );

    if (assistantProfileResponse) {
      return NextResponse.json(assistantProfileResponse);
    }

    // Sanitize history — keep last 10 turns max
    const history = (payload.history ?? [])
      .filter(
        (h) =>
          (h.role === "user" || h.role === "assistant") &&
          typeof h.text === "string" &&
          h.text.trim().length > 0,
      )
      .slice(-10);

    logger.info("Processing question", {
      requestId,
      userId: user.username,
      questionLength: question.length,
      historyTurns: history.length,
      mockMode: appConfig.mockMode,
    });

    if (appConfig.mockMode) {
      const mockResponse = await getMockAnswer(question, requestId);
      return NextResponse.json(mockResponse);
    }

    const response = await askVertexGroundedQuestion(
      question,
      user,
      requestId,
      payload.department,
      history,
    );

    logger.info("Question answered", {
      requestId,
      userId: user.username,
      latencyMs: response.latencyMs,
      grounded: response.grounded,
      sourcesCount: response.sources.length,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error("Failed to answer question", error, {
      requestId,
      userId: user.username,
      question: question.slice(0, 100),
    });

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
