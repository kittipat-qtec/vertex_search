import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
  type Content,
  type GenerateContentResponse,
  type GenerationConfig,
  type GroundingChunk,
} from "@google/genai";

import {
  appConfig,
  getDataStoreResourceName,
  hasVertexAiConfig,
  hasVertexSearchConfig,
} from "@/lib/config";
import { getMockAnswer } from "@/lib/mock/mockService";
import { mockKnowledgeBase } from "@/lib/mock/mockData";
import { buildQuestionPrompt, RAG_SYSTEM_INSTRUCTION } from "@/lib/prompts";
import type { AskResponse, AuthUser, Source } from "@/lib/types";

type HistoryTurn = { role: "user" | "assistant"; text: string };

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT,        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,       threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const BASE_CONFIG: Partial<GenerationConfig> = {
  temperature: 0.2,
  maxOutputTokens: 2048,
};

let client: GoogleGenAI | null = null;

const MOCK_CONTEXT = mockKnowledgeBase
  .map(
    (item) =>
      `- ${item.answer} (อ้างอิง: ${item.sources.map((source) => source.title).join(", ")})`,
  )
  .join("\n\n");

const dedupeSources = (sources: Source[]) => {
  const seen = new Set<string>();

  return sources.filter((source) => {
    const key = `${source.documentName ?? ""}|${source.uri ?? ""}|${source.title}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const chunkToSource = (chunk: GroundingChunk): Source | null => {
  if (chunk.retrievedContext) {
    return {
      title: chunk.retrievedContext.title || "เอกสารภายใน",
      uri: chunk.retrievedContext.uri,
      snippet:
        chunk.retrievedContext.text?.trim() ||
        "ระบบส่งคืนแหล่งอ้างอิง แต่ไม่มีข้อความตัวอย่างจากเอกสาร",
      documentName: chunk.retrievedContext.documentName,
    };
  }

  if (chunk.web) {
    return {
      title: chunk.web.title || "Web source",
      uri: chunk.web.uri,
      snippet: "แหล่งอ้างอิงจากการค้นหาเว็บ",
    };
  }

  return null;
};

const extractSources = (response: GenerateContentResponse) => {
  const chunks =
    response.candidates?.flatMap(
      (candidate) => candidate.groundingMetadata?.groundingChunks || [],
    ) || [];

  return dedupeSources(
    chunks
      .map(chunkToSource)
      .filter((source): source is Source => source !== null),
  );
};

const extractMockSources = (question: string) => {
  const normalizedQuestion = question.toLowerCase();
  const matchedSources: Source[] = [];

  for (const item of mockKnowledgeBase) {
    if (
      item.keywords.some((keyword) =>
        normalizedQuestion.includes(keyword.toLowerCase()),
      )
    ) {
      for (const source of item.sources) {
        if (
          !matchedSources.some(
            (existingSource) => existingSource.title === source.title,
          )
        ) {
          matchedSources.push(source);
        }
      }
    }
  }

  return matchedSources;
};

export const getGenAIClient = () => {
  if (client) {
    return client;
  }

  client = new GoogleGenAI({
    location: appConfig.googleCloudLocation,
    project: appConfig.googleCloudProject,
    vertexai: true,
  });

  return client;
};

const buildMultiTurnContents = (
  history: HistoryTurn[],
  currentPrompt: string,
): Content[] => {
  const contents: Content[] = history.map((turn) => ({
    role: turn.role === "assistant" ? "model" : "user",
    parts: [{ text: turn.text }],
  }));

  contents.push({
    role: "user",
    parts: [{ text: currentPrompt }],
  });

  return contents;
};

export const askVertexGroundedQuestion = async (
  question: string,
  user: AuthUser,
  requestId: string,
  department?: string,
  history: HistoryTurn[] = [],
): Promise<AskResponse> => {
  if (!hasVertexSearchConfig()) {
    if (!hasVertexAiConfig()) {
      return getMockAnswer(question, requestId);
    }

    return askGeminiWithMockContext(question, user, requestId, department, history);
  }

  const datastore = getDataStoreResourceName();
  const startedAt = Date.now();
  const prompt = buildQuestionPrompt(question, user, department);
  const contents = history.length > 0
    ? buildMultiTurnContents(history, prompt)
    : prompt;

  const response = await getGenAIClient().models.generateContent({
    model: appConfig.modelName,
    contents,
    config: {
      systemInstruction: RAG_SYSTEM_INSTRUCTION,
      temperature: 0.2,
      maxOutputTokens: 1024,
      safetySettings: SAFETY_SETTINGS,
      tools: [
        {
          retrieval: {
            vertexAiSearch: {
              datastore: datastore as string,
              maxResults: 6,
            },
          },
        },
      ],
    },
  });

  const answer = response.text?.trim();

  if (!answer) {
    throw new Error("The model returned an empty answer.");
  }

  return {
    answer,
    grounded: true,
    latencyMs: Date.now() - startedAt,
    model: response.modelVersion || appConfig.modelName,
    ok: true,
    requestId,
    sources: extractSources(response),
    suggestedQuestions: await generateSuggestedQuestions(question, answer),
  };
};

const askGeminiWithMockContext = async (
  question: string,
  user: AuthUser,
  requestId: string,
  department?: string,
  history: HistoryTurn[] = [],
): Promise<AskResponse> => {
  const startedAt = Date.now();
  const promptWithContext = `คุณเป็นผู้ช่วย AI ขององค์กร QTEC ชื่อ "Knowledge Brain" ทำหน้าที่ช่วยเหลือพนักงาน
พนักงานที่คุยด้วยชื่อ ${user.displayName}${department?.trim() ? ` (แผนก: ${department.trim()})` : ""}

**หลักการตอบ:**
1. ถ้าคำถามเกี่ยวกับ HR, สวัสดิการ, นโยบาย, วันหยุด, การลา, OT — ตอบโดยอ้างอิงจากข้อมูลด้านล่างเท่านั้น
2. ถ้าเป็นการสนทนาทั่วไป (ทักทาย, ถามสุขภาพ, คุยเล่น) — ตอบตามธรรมชาติอย่างเป็นมิตร
3. ถ้าถามเรื่องอื่นนอกขอบเขต HR — บอกสั้นๆ ว่าเชี่ยวชาญด้าน HR/สวัสดิการเป็นหลัก แต่พยายามช่วยเท่าที่ทำได้
4. ไม่ต้องอ้างแหล่งที่มาในข้อความ ระบบจะแสดง UI แยกต่างหาก

**ฐานความรู้ HR ของ QTEC:**
${MOCK_CONTEXT}

**คำถาม:** ${question}`;

  const contents = history.length > 0
    ? buildMultiTurnContents(history, promptWithContext)
    : promptWithContext;

  const response = await getGenAIClient().models.generateContent({
    model: appConfig.modelName,
    contents,
    config: { ...BASE_CONFIG, safetySettings: SAFETY_SETTINGS },
  });

  const answer = response.text?.trim();

  if (!answer) {
    throw new Error("The model returned an empty answer.");
  }

  return {
    answer,
    grounded: true,
    latencyMs: Date.now() - startedAt,
    model: response.modelVersion || appConfig.modelName,
    ok: true,
    requestId,
    sources: extractMockSources(question),
    suggestedQuestions: await generateSuggestedQuestions(question, answer),
  };
};

/** Generate 3 short follow-up questions the user might ask next. */
const generateSuggestedQuestions = async (
  question: string,
  answer: string,
): Promise<string[]> => {
  try {
    const prompt = `คำถามเดิม: "${question}"
คำตอบที่ได้: "${answer.slice(0, 400)}"

ช่วยเขียน 3 คำถามสั้นๆ (ภาษาไทย, ไม่เกินประโยคละ 15 คำ) ที่ผู้ใช้น่าจะถามต่อจากนี้
ส่งผลลัพธ์เป็น JSON array เช่น ["คำถาม 1", "คำถาม 2", "คำถาม 3"]
ส่งแค่ JSON เท่านั้น ไม่มีข้อความอื่น`;

    const res = await getGenAIClient().models.generateContent({
      model: appConfig.modelName,
      contents: prompt,
      config: { temperature: 0.7, maxOutputTokens: 200 },
    });

    const raw = res.text?.trim() ?? "";
    const json = raw.match(/\[.*\]/s)?.[0];
    if (!json) return [];
    const parsed = JSON.parse(json) as unknown[];
    return parsed.filter((q): q is string => typeof q === "string").slice(0, 3);
  } catch {
    return [];
  }
};
