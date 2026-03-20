import { getRequestUser } from "@/lib/auth";
import { appConfig } from "@/lib/config";
import { logger } from "@/lib/logger";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";
import { sanitizeQuestion } from "@/lib/sanitize";
import {
  streamMockAnswer,
  streamVertexGroundedQuestion,
} from "@/lib/genai-stream";
import type { AskRequest } from "@/lib/types";
import { generateId } from "@/lib/generateId";

export const runtime = "nodejs";

// SSE helper — sends a JSON event
const sseEvent = (
  controller: ReadableStreamDefaultController,
  event: string,
  data: unknown,
) => {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  controller.enqueue(new TextEncoder().encode(msg));
};

export async function POST(request: Request) {
  const requestId = generateId();
  const startedAt = Date.now();
  const user = getRequestUser(request.headers);

  // ── Auth ──────────────────────────────────────────
  if (!user) {
    return new Response(
      JSON.stringify({ ok: false, error: "ไม่พบข้อมูลผู้ใช้จากระบบยืนยันตัวตน", requestId }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  // ── Rate limit ────────────────────────────────────
  const rateLimitId = getRateLimitIdentifier(request);
  const rateLimit = checkRateLimit(rateLimitId);

  if (!rateLimit.allowed) {
    const waitSec = Math.ceil((rateLimit.retryAfterMs ?? 0) / 1000);
    return new Response(
      JSON.stringify({
        ok: false,
        error: `คุณส่งคำถามเร็วเกินไป กรุณารอ ${waitSec} วินาที`,
        requestId,
      }),
      { status: 429, headers: { "Content-Type": "application/json" } },
    );
  }

  // ── Parse body ────────────────────────────────────
  let payload: AskRequest;
  try {
    payload = (await request.json()) as AskRequest;
  } catch {
    return new Response(
      JSON.stringify({ ok: false, error: "รูปแบบคำขอไม่ถูกต้อง", requestId }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const rawQuestion = payload.question?.trim();
  if (!rawQuestion) {
    return new Response(
      JSON.stringify({ ok: false, error: "กรุณาระบุคำถามก่อนส่ง", requestId }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { clean: question, flagged, reason } = sanitizeQuestion(rawQuestion);
  if (flagged) {
    return new Response(
      JSON.stringify({ ok: false, error: reason, requestId }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const history = (payload.history ?? [])
    .filter(
      (h) =>
        (h.role === "user" || h.role === "assistant") &&
        typeof h.text === "string" &&
        h.text.trim().length > 0,
    )
    .slice(-10);

  logger.info("Streaming question", {
    requestId,
    userId: user.username,
    questionLength: question.length,
    historyTurns: history.length,
    mockMode: appConfig.mockMode,
  });

  // ── SSE Stream ────────────────────────────────────
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (appConfig.mockMode) {
          await streamMockAnswer(question, requestId, user, (event, data) =>
            sseEvent(controller, event, data),
          );
        } else {
          await streamVertexGroundedQuestion(
            question,
            user,
            requestId,
            payload.department,
            history,
            (event, data) => sseEvent(controller, event, data),
          );
        }

        logger.info("Stream complete", {
          requestId,
          userId: user.username,
          latencyMs: Date.now() - startedAt,
        });
      } catch (error) {
        logger.error("Streaming failed", error, {
          requestId,
          userId: user.username,
        });
        sseEvent(controller, "error", {
          message: "ระบบไม่สามารถตอบคำถามได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
