import { appConfig } from "@/lib/config";
import type { AskResponse, AuthUser } from "@/lib/types";

type AssistantIntent =
  | "identity"
  | "capabilities"
  | "usage"
  | "limitations";

const INTENT_PATTERNS: Record<AssistantIntent, string[]> = {
  identity: [
    "คุณคือใคร",
    "คือใคร",
    "เป็นใคร",
    "ชื่ออะไร",
    "คุณชื่ออะไร",
    "ชื่อของคุณ",
    "แนะนำตัว",
    "who are you",
    "what are you",
    "what is your name",
    "tell me about yourself",
  ],
  capabilities: [
    "คุณทำอะไรได้บ้าง",
    "ทำอะไรได้บ้าง",
    "ความสามารถของคุณ",
    "ช่วยอะไรได้บ้าง",
    "คุณช่วยอะไรได้",
    "ถนัดเรื่องอะไร",
    "รองรับเรื่องอะไร",
    "what can you do",
    "how can you help",
    "your capabilities",
  ],
  usage: [
    "ใช้งานยังไง",
    "ใช้อย่างไร",
    "วิธีใช้งาน",
    "ถามอะไรได้บ้าง",
    "ควรถามยังไง",
    "เริ่มต้นยังไง",
    "how to use",
    "how do i use",
    "what can i ask",
  ],
  limitations: [
    "ข้อจำกัด",
    "ทำอะไรไม่ได้",
    "ข้อจำกัดของคุณ",
    "มีข้อจำกัดอะไรบ้าง",
    "limitations",
    "what can't you do",
    "what can you not do",
  ],
};

const normalizeQuestion = (question: string) =>
  question
    .toLowerCase()
    .replace(/[!?.,/\\()[\]{}"'`~:;<>@#$%^&*_+=|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const matchesIntent = (normalizedQuestion: string, patterns: string[]) =>
  patterns.some((pattern) => normalizedQuestion.includes(pattern));

const detectAssistantIntent = (question: string): AssistantIntent | null => {
  const normalizedQuestion = normalizeQuestion(question);

  if (!normalizedQuestion) {
    return null;
  }

  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS) as Array<
    [AssistantIntent, string[]]
  >) {
    if (matchesIntent(normalizedQuestion, patterns)) {
      return intent;
    }
  }

  return null;
};

const buildIdentityAnswer = (user: AuthUser) => `
สวัสดีคุณ ${user.displayName}

ฉันชื่อ QTEC Knowledge Brain เป็นผู้ช่วย AI ภายในองค์กรของ QTEC

บทบาทของฉันคือช่วยค้นหา สรุป และอธิบายข้อมูลจากเอกสารภายในบริษัทให้เข้าใจง่ายและตอบได้รวดเร็วขึ้น โดยเฉพาะเรื่องที่พนักงานถามบ่อย เช่น นโยบายการลา วันหยุด OT สวัสดิการ และข้อมูลอ้างอิงจากเอกสารองค์กร

ถ้าต้องการ ฉันอธิบายต่อได้ว่าช่วยอะไรได้บ้าง หรือควรถามแบบไหนถึงจะได้คำตอบที่ตรงที่สุด
`.trim();

const buildCapabilitiesAnswer = (user: AuthUser) => `
สวัสดีคุณ ${user.displayName}

ฉันช่วยได้หลัก ๆ แบบนี้:

- ค้นหาและสรุปข้อมูลจากเอกสารภายในของ QTEC
- ตอบคำถามเกี่ยวกับนโยบายการลา วันหยุดประจำปี ค่าล่วงเวลา และสวัสดิการพนักงาน
- อธิบายขั้นตอนการดำเนินการ เช่น การลา การเบิก OT หรือเงื่อนไขที่เกี่ยวข้อง
- ช่วยย่อยข้อมูลที่ยาวหรือซับซ้อนให้เข้าใจง่ายขึ้น
- ตอบคำถามเกี่ยวกับข้อมูลองค์กรที่มีอยู่ในเอกสารอ้างอิงของระบบ

ตัวอย่างคำถามที่เหมาะ:
- "วันหยุดประจำปี 2569 มีวันไหนบ้าง"
- "สิทธิ์การลาพักร้อนเป็นอย่างไร"
- "ขั้นตอนการเบิกค่า OT ต้องทำอย่างไร"
- "สวัสดิการพนักงานมีอะไรบ้าง"
- "สถานพยาบาลประกันสังคมมีที่ไหนบ้าง"
`.trim();

const buildUsageAnswer = () => `
วิธีถามให้ได้คำตอบที่ดี:

- ถามเป็นเรื่องเดียวต่อหนึ่งคำถาม
- ระบุหัวข้อให้ชัด เช่น วันหยุด การลา OT หรือสวัสดิการ
- ถ้ามีปี ชื่อเอกสาร หรือบริบทเฉพาะ ให้ใส่เพิ่ม
- ถ้าคำตอบยังกว้าง ให้ถามต่อแบบเจาะจงขึ้น

ตัวอย่างคำถามเริ่มต้น:
- "วันหยุดประจำปี 2569 มีวันไหนบ้าง"
- "พนักงานใหม่มีสิทธิ์ลาป่วยอย่างไร"
- "ขอขั้นตอนการเบิก OT แบบสรุป"
- "ถ้าต้องเปลี่ยนสถานพยาบาลประกันสังคมต้องทำอย่างไร"

ถ้าคุณไม่แน่ใจว่าจะเริ่มยังไง แค่พิมพ์หัวข้อที่อยากรู้มาก่อน ฉันช่วยแตกคำถามให้ต่อได้
`.trim();

const buildLimitationsAnswer = () => `
ข้อจำกัดของฉันตอนนี้:

- ฉันตอบได้ดีที่สุดเมื่อคำถามอ้างอิงจากเอกสารที่มีอยู่ในระบบ
- ฉันไม่ควรเดานโยบาย วันที่ ผู้อนุมัติ หรือรายละเอียดที่ไม่มีในข้อมูลอ้างอิง
- ฉันไม่สามารถอนุมัติคำขอ แก้ข้อมูลในระบบ หรือทำธุรกรรมแทนผู้ใช้ได้
- ถ้าเอกสารต้นทางยังไม่มีหรือข้อมูลไม่พอ ฉันอาจตอบได้เพียงว่ายังยืนยันคำตอบจากระบบไม่ได้

ถ้าอยากได้ผลลัพธ์ที่แม่นขึ้น ให้ถามด้วยหัวข้อที่ชัดและใส่บริบทเพิ่มเท่าที่มี
`.trim();

const buildAnswerByIntent = (intent: AssistantIntent, user: AuthUser) => {
  switch (intent) {
    case "identity":
      return buildIdentityAnswer(user);
    case "capabilities":
      return buildCapabilitiesAnswer(user);
    case "usage":
      return buildUsageAnswer();
    case "limitations":
      return buildLimitationsAnswer();
  }
};

export const getAssistantProfileResponse = (
  question: string,
  user: AuthUser,
  requestId: string,
): AskResponse | null => {
  const intent = detectAssistantIntent(question);

  if (!intent) {
    return null;
  }

  const startedAt = Date.now();

  return {
    ok: true,
    answer: buildAnswerByIntent(intent, user),
    sources: [],
    grounded: true,
    latencyMs: Date.now() - startedAt,
    model: `${appConfig.modelName}-assistant-profile`,
    mock: appConfig.mockMode,
    requestId,
  };
};
