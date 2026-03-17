import {
  GoogleGenAI,
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
        "ระบบส่งคืนแหล่งอ้างอิงแต่ไม่มีข้อความตัวอย่าง",
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

const parseSuggestedFollowUps = (rawSuggestions: string) =>
  rawSuggestions
    .split("\n")
    .map((suggestion) => suggestion.replace(/^[-•*\d.]+\s*/, "").trim())
    .filter((suggestion) => suggestion.length > 5)
    .slice(0, 3);

const generateSuggestedFollowUps = async (question: string) => {
  try {
    const response = await getGenAIClient().models.generateContent({
      model: appConfig.modelName,
      contents: `จากคำถาม: "${question}" กรุณาแนะนำ 3 คำถามต่อเนื่องที่เกี่ยวข้องกันแบบสั้น กระชับ และใช้งานได้จริง ตอบเป็นคนละบรรทัดโดยไม่ต้องใส่หมายเลข`,
      config: {
        temperature: 0.4,
        maxOutputTokens: 256,
      },
    });

    return parseSuggestedFollowUps(response.text?.trim() ?? "");
  } catch {
    return [];
  }
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

export const askVertexGroundedQuestion = async (
  question: string,
  user: AuthUser,
  requestId: string,
  department?: string,
): Promise<AskResponse> => {
  if (!hasVertexSearchConfig()) {
    if (!hasVertexAiConfig()) {
      return getMockAnswer(question, requestId);
    }

    return askGeminiWithMockContext(question, user, requestId, department);
  }

  const datastore = getDataStoreResourceName();
  const startedAt = Date.now();
  const answerPromise = getGenAIClient().models.generateContent({
    model: appConfig.modelName,
    contents: buildQuestionPrompt(question, user, department),
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
  const followUpPromise = generateSuggestedFollowUps(question);

  const [response, suggestedFollowUps] = await Promise.all([
    answerPromise,
    followUpPromise,
  ]);

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
    suggestedFollowUps,
  };
};

const askGeminiWithMockContext = async (
  question: string,
  user: AuthUser,
  requestId: string,
  department?: string,
): Promise<AskResponse> => {
  const startedAt = Date.now();
  const followUpPromise = generateSuggestedFollowUps(question);
  const promptWithContext = `
คุณเป็นผู้ช่วย AI ขององค์กร QTEC ตอบคำถามให้กับพนักงานชื่อ ${user.displayName}
${department?.trim() ? `แผนกที่เกี่ยวข้อง: ${department.trim()}` : ""}

ข้อมูลอ้างอิงสำหรับตอบคำถาม:
${MOCK_CONTEXT}

คำถามจากพนักงาน: ${question}

กรุณาตอบคำถามโดยอ้างอิงจาก "ข้อมูลอ้างอิง" ด้านบนเท่านั้น หากไม่มีข้อมูลให้ตอบว่า "ไม่พบข้อมูลที่ตรงกับคำถามนี้ในฐานความรู้ปัจจุบัน"
ไม่จำเป็นต้องใส่ <source> tags หรือบอกแหล่งที่มาในข้อความ เพราะระบบจะแสดง UI แยกต่างหาก
`;

  const answerPromise = getGenAIClient().models.generateContent({
    model: appConfig.modelName,
    contents: promptWithContext,
    config: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  });

  const [response, suggestedFollowUps] = await Promise.all([
    answerPromise,
    followUpPromise,
  ]);
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
    suggestedFollowUps,
  };
};
