import { appConfig } from "@/lib/config";
import { hasVertexAiConfig } from "@/lib/config";
import { defaultMockAnswer, mockKnowledgeBase } from "@/lib/mock/mockData";
import type { AskResponse, Source } from "@/lib/types";

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const normalize = (value: string) => value.toLowerCase().trim();

const searchableKnowledgeBase = mockKnowledgeBase.map((item) => ({
  ...item,
  normalizedKeywords: item.keywords.map(normalize),
}));

const scoreEntry = (question: string, keywords: string[]) =>
  keywords.reduce((score, keyword) => {
    return score + (question.includes(keyword) ? 1 : 0);
  }, 0);

const findBestMatch = (question: string) => {
  const normalizedQuestion = normalize(question);
  let bestMatch:
    | {
        item: (typeof searchableKnowledgeBase)[number];
        score: number;
      }
    | null = null;

  for (const item of searchableKnowledgeBase) {
    const score = scoreEntry(normalizedQuestion, item.normalizedKeywords);

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { item, score };
    }
  }

  return bestMatch;
};

/** Call Gemini conversationally when no keyword matches (lazy import to avoid circular deps) */
const askGeminiConversational = async (
  question: string,
  requestId: string,
  startedAt: number,
): Promise<AskResponse | null> => {
  if (!hasVertexAiConfig()) return null;

  try {
    const { getGenAIClient } = await import("@/lib/genai");
    const prompt = `คุณเป็น Knowledge Brain ผู้ช่วย AI ของบริษัท QTEC Technology เชี่ยวชาญด้าน HR และสวัสดิการพนักงาน
ตอบคำถามนี้อย่างเป็นกันเองและเป็นมิตร ถ้าเป็นการทักทาย ตรวจสอบตัวตน หรือถามทั่วไป ตอบตามธรรมชาติ
ถ้าถามเรื่องที่ไม่ใช่ HR/สวัสดิการ อาจช่วยได้บ้าง แต่บอกว่าถนัดด้าน HR/สวัสดิการ QTEC เป็นพิเศษ

คำถาม: ${question}`;

    const res = await getGenAIClient().models.generateContent({
      model: appConfig.modelName,
      contents: prompt,
      config: { temperature: 0.7, maxOutputTokens: 512 },
    });

    const answer = res.text?.trim();
    if (!answer) return null;

    return {
      ok: true,
      answer,
      sources: [],
      grounded: false,
      model: appConfig.modelName,
      requestId,
      latencyMs: Date.now() - startedAt,
      mock: false,
    };
  } catch {
    return null;
  }
};

export const getMockAnswer = async (
  question: string,
  requestId: string,
): Promise<AskResponse> => {
  const startedAt = Date.now();
  const match = findBestMatch(question);
  const isMatched = match !== null && match.score > 0;

  // HR keyword match — return from knowledge base directly
  if (isMatched && match) {
    const latencyMs = 500 + Math.floor(Math.random() * 500);
    await delay(latencyMs);
    return {
      ok: true,
      answer: match.item.answer,
      sources: match.item.sources,
      grounded: true,
      model: `${appConfig.modelName}-mock`,
      requestId,
      latencyMs,
      mock: true,
    };
  }

  // No HR match — try Gemini for conversational response
  const geminiResponse = await askGeminiConversational(question, requestId, startedAt);
  if (geminiResponse) return geminiResponse;

  // Ultimate fallback if Gemini also fails
  return {
    ok: true,
    answer: defaultMockAnswer,
    sources: [],
    grounded: false,
    model: `${appConfig.modelName}-mock`,
    requestId,
    latencyMs: Date.now() - startedAt,
    mock: true,
  };
};

export const searchMockChunks = async (query: string): Promise<Source[]> => {
  await delay(200);

  const match = findBestMatch(query);
  if (!match || match.score === 0) {
    return [];
  }

  return match.item.sources;
};
