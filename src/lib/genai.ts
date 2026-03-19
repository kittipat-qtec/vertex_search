import {
  GoogleGenAI,
  type Content,
  type GenerateContentResponse,
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
  const promptWithContext = `
คุณเป็นผู้ช่วย AI ขององค์กร QTEC ตอบคำถามให้กับพนักงานชื่อ ${user.displayName}
${department?.trim() ? `แผนกที่เกี่ยวข้อง: ${department.trim()}` : ""}

ข้อมูลอ้างอิงสำหรับตอบคำถาม:
${MOCK_CONTEXT}

คำถามจากพนักงาน: ${question}

กรุณาตอบคำถามโดยอ้างอิงจาก "ข้อมูลอ้างอิง" ด้านบนเท่านั้น หากไม่มีข้อมูลให้ตอบว่า "ไม่พบข้อมูลที่ตรงกับคำถามนี้ในฐานความรู้ปัจจุบัน"
ไม่จำเป็นต้องใส่ <source> tags หรือบอกแหล่งที่มาในข้อความ เพราะระบบจะแสดง UI แยกต่างหาก
`;

  const contents = history.length > 0
    ? buildMultiTurnContents(history, promptWithContext)
    : promptWithContext;

  const response = await getGenAIClient().models.generateContent({
    model: appConfig.modelName,
    contents,
    config: {
      temperature: 0.2,
      maxOutputTokens: 2048,
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
    sources: extractMockSources(question),
  };
};
