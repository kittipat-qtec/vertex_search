import { appConfig } from "@/lib/config";
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

export const getMockAnswer = async (
  question: string,
  requestId: string,
): Promise<AskResponse> => {
  const latencyMs = 500 + Math.floor(Math.random() * 700);
  await delay(latencyMs);

  const match = findBestMatch(question);
  const answer = match && match.score > 0 ? match.item.answer : defaultMockAnswer;
  const sources =
    match && match.score > 0
      ? match.item.sources
      : [
          {
            title: "Mock Knowledge Index",
            uri: "mock://index",
            snippet:
              "ระบบจำลองรองรับหัวข้อการลา OT ความปลอดภัย และการเบิกพัสดุในเวอร์ชันทดลองนี้",
          },
        ];

  return {
    ok: true,
    answer,
    sources,
    grounded: true,
    model: `${appConfig.modelName}-mock`,
    requestId,
    latencyMs,
    mock: true,
  };
};

export const searchMockChunks = async (query: string): Promise<Source[]> => {
  await delay(200);

  const match = findBestMatch(query);
  if (!match || match.score === 0) {
    return [
      {
        title: "Mock Search Index",
        uri: "mock://index",
        snippet:
          "ไม่พบ chunk ที่ตรงมากพอในชุดข้อมูลจำลอง กรุณาระบุคำค้นให้ใกล้กับหัวข้อเอกสารมากขึ้น",
      },
    ];
  }

  return match.item.sources;
};
