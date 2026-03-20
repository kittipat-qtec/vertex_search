/**
 * genai-stream.ts — Streaming variants of the Gemini/Mock answer functions.
 *
 * Events emitted via the `emit` callback:
 *   token     { text: string }               — incremental answer text
 *   source    Source                          — each grounding source
 *   suggested { questions: string[] }         — follow-up suggestions (at end)
 *   done      { latencyMs, requestId, model } — final metadata
 *   error     { message: string }             — fatal errors
 */

import {
  HarmBlockThreshold,
  HarmCategory,
  type Content,
  type GenerateContentConfig,
} from "@google/genai";

import {
  appConfig,
  getDataStoreResourceName,
  hasVertexAiConfig,
  hasVertexSearchConfig,
} from "@/lib/config";
import { mockKnowledgeBase, defaultMockAnswer } from "@/lib/mock/mockData";
import { buildQuestionPrompt, RAG_SYSTEM_INSTRUCTION } from "@/lib/prompts";
import { getGenAIClient } from "@/lib/genai";
import type { AuthUser, Source } from "@/lib/types";

type Emit = (event: string, data: unknown) => void;
type HistoryTurn = { role: "user" | "assistant"; text: string };

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const BASE_STREAM_CONFIG: Partial<GenerateContentConfig> = {
  temperature: 0.2,
  maxOutputTokens: 2048,
  safetySettings: SAFETY_SETTINGS,
};

const MOCK_CONTEXT = mockKnowledgeBase
  .map(
    (item) =>
      `- ${item.answer} (อ้างอิง: ${item.sources.map((s) => s.title).join(", ")})`,
  )
  .join("\n\n");

const buildMultiTurnContents = (
  history: HistoryTurn[],
  currentPrompt: string,
): Content[] => {
  const contents: Content[] = history.map((turn) => ({
    role: turn.role === "assistant" ? "model" : "user",
    parts: [{ text: turn.text }],
  }));
  contents.push({ role: "user", parts: [{ text: currentPrompt }] });
  return contents;
};

const extractMockSources = (question: string): Source[] => {
  const normalized = question.toLowerCase();
  const matched: Source[] = [];
  for (const item of mockKnowledgeBase) {
    if (item.keywords.some((k) => normalized.includes(k.toLowerCase()))) {
      for (const src of item.sources) {
        if (!matched.some((s) => s.title === src.title)) matched.push(src);
      }
    }
  }
  return matched;
};

const generateSuggested = async (
  question: string,
  answer: string,
): Promise<string[]> => {
  try {
    const prompt = `คำถามเดิม: "${question}"\nคำตอบที่ได้: "${answer.slice(0, 400)}"\n\nช่วยเขียน 3 คำถามสั้นๆ (ภาษาไทย, ไม่เกินประโยคละ 15 คำ) ที่ผู้ใช้น่าจะถามต่อจากนี้\nส่งผลลัพธ์เป็น JSON array เช่น ["คำถาม 1", "คำถาม 2", "คำถาม 3"]\nส่งแค่ JSON เท่านั้น ไม่มีข้อความอื่น`;
    const res = await getGenAIClient().models.generateContent({
      model: appConfig.modelName,
      contents: prompt,
      config: { temperature: 0.7, maxOutputTokens: 200 },
    });
    const raw = res.text?.trim() ?? "";
    const json = raw.match(/\[.*\]/s)?.[0];
    if (!json) return [];
    return (JSON.parse(json) as unknown[])
      .filter((q): q is string => typeof q === "string")
      .slice(0, 3);
  } catch {
    return [];
  }
};

// ────────────────────────────────────────────────────────────
// Mock streaming (simulates word-by-word output)
// ────────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const findMockAnswer = (question: string) => {
  const normalized = question.toLowerCase();
  let best: { item: (typeof mockKnowledgeBase)[number]; score: number } | null = null;
  for (const item of mockKnowledgeBase) {
    const score = item.keywords.filter((k) =>
      normalized.includes(k.toLowerCase()),
    ).length;
    if (!best || score > best.score) best = { item, score };
  }
  return best && best.score > 0 ? best.item : null;
};

export const streamMockAnswer = async (
  question: string,
  requestId: string,
  user: AuthUser,
  emit: Emit,
): Promise<void> => {
  const startedAt = Date.now();

  // HR keyword match — stream from mockData word by word
  const match = findMockAnswer(question);
  if (match) {
    for (const src of match.sources) emit("source", src);
    const words = match.answer.split(/(?<= )/);
    for (const word of words) {
      emit("token", { text: word });
      await delay(18 + Math.random() * 22);
    }
    const suggested = await generateSuggested(question, match.answer);
    if (suggested.length) emit("suggested", { questions: suggested });
    emit("done", { requestId, latencyMs: Date.now() - startedAt, model: appConfig.modelName });
    return;
  }

  // No HR match — stream Gemini conversational response if available
  if (hasVertexAiConfig()) {
    try {
      const prompt = `คุณเป็น Knowledge Brain ผู้ช่วย AI ของบริษัท QTEC Technology เชี่ยวชาญด้าน HR และสวัสดิการพนักงาน
ตอบคำถามนี้อย่างเป็นกันเองและเป็นมิตร ถ้าเป็นการทักทาย ตรวจสอบตัวตน หรือถามทั่วไป ตอบตามธรรมชาติ
ถ้าถามเรื่องที่ไม่ใช่ HR/สวัสดิการ อาจช่วยได้บ้าง แต่บอกว่าถนัดด้าน HR/สวัสดิการ QTEC เป็นพิเศษ

คำถาม: ${question}`;

      const streamResult = getGenAIClient().models.generateContentStream({
        model: appConfig.modelName,
        contents: prompt,
        config: { temperature: 0.7, maxOutputTokens: 512 },
      });

      let fullAnswer = "";
      for await (const chunk of await streamResult) {
        const text = chunk.text;
        if (text) {
          fullAnswer += text;
          emit("token", { text });
        }
      }

      const suggested = await generateSuggested(question, fullAnswer);
      if (suggested.length) emit("suggested", { questions: suggested });
      emit("done", { requestId, latencyMs: Date.now() - startedAt, model: appConfig.modelName });
      return;
    } catch {
      // Fall through to default
    }
  }

  // Ultimate fallback
  const words = defaultMockAnswer.split(/(?<= )/);
  for (const word of words) {
    emit("token", { text: word });
    await delay(20);
  }
  emit("done", { requestId, latencyMs: Date.now() - startedAt, model: appConfig.modelName });
};

// ────────────────────────────────────────────────────────────
// Gemini streaming (real API)
// ────────────────────────────────────────────────────────────
export const streamVertexGroundedQuestion = async (
  question: string,
  user: AuthUser,
  requestId: string,
  department: string | undefined,
  history: HistoryTurn[],
  emit: Emit,
): Promise<void> => {
  if (!hasVertexAiConfig()) {
    // Fall back to mock streaming if no GCP config
    await streamMockAnswer(question, requestId, user, emit);
    return;
  }

  const startedAt = Date.now();
  const useVertexSearch = hasVertexSearchConfig();
  const datastore = useVertexSearch ? getDataStoreResourceName() : null;

  const prompt = useVertexSearch
    ? buildQuestionPrompt(question, user, department)
    : `คุณเป็นผู้ช่วย AI ขององค์กร QTEC ตอบคำถามให้กับพนักงานชื่อ ${user.displayName}\n${department?.trim() ? `แผนกที่เกี่ยวข้อง: ${department.trim()}` : ""}\n\nข้อมูลอ้างอิง:\n${MOCK_CONTEXT}\n\nคำถาม: ${question}\n\nตอบโดยอ้างอิงข้อมูลด้านบนเท่านั้น`;

  const contents =
    history.length > 0 ? buildMultiTurnContents(history, prompt) : prompt;

  const config: GenerateContentConfig = {
    ...BASE_STREAM_CONFIG,
    systemInstruction: RAG_SYSTEM_INSTRUCTION,
    maxOutputTokens: 1024,
    ...(datastore
      ? {
          tools: [
            {
              retrieval: {
                vertexAiSearch: { datastore },
              },
            },
          ],
        }
      : {}),
  };

  const streamResult = getGenAIClient().models.generateContentStream({
    model: appConfig.modelName,
    contents,
    config,
  });

  let fullAnswer = "";
  const emittedSources = new Set<string>();

  for await (const chunk of await streamResult) {
    const text = chunk.text;
    if (text) {
      fullAnswer += text;
      emit("token", { text });
    }

    // Emit sources as they arrive
    const chunks =
      chunk.candidates?.flatMap(
        (c) => c.groundingMetadata?.groundingChunks ?? [],
      ) ?? [];

    for (const gc of chunks) {
      const src: Source | null =
        gc.retrievedContext
          ? {
              title: gc.retrievedContext.title || "เอกสารภายใน",
              uri: gc.retrievedContext.uri,
              snippet:
                gc.retrievedContext.text?.trim() || "อ้างอิงจากเอกสาร",
              documentName: gc.retrievedContext.documentName,
            }
          : gc.web
          ? { title: gc.web.title || "Web", uri: gc.web.uri, snippet: "แหล่งเว็บ" }
          : null;

      if (src) {
        const key = `${src.documentName ?? ""}|${src.uri ?? ""}|${src.title}`;
        if (!emittedSources.has(key)) {
          emittedSources.add(key);
          emit("source", src);
        }
      }
    }
  }

  if (!useVertexSearch) {
    // Emit mock sources when using context mode
    for (const src of extractMockSources(question)) emit("source", src);
  }

  const suggested = await generateSuggested(question, fullAnswer);
  if (suggested.length) emit("suggested", { questions: suggested });

  emit("done", {
    requestId,
    latencyMs: Date.now() - startedAt,
    model: appConfig.modelName,
  });
};
