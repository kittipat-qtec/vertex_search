export interface ConversationStarterContext {
  isAdmin: boolean;
}

const DEFAULT_SUGGESTION_LIMIT = 5;

const COMMON_CONVERSATION_STARTERS = [
  "นโยบายการลาพักร้อนเป็นอย่างไร",
  "วันหยุดประจำปี 2569 มีวันไหนบ้าง",
  "สถานพยาบาลคู่สัญญามีที่ไหนบ้าง",
  "ขั้นตอนการเบิกค่า OT ต้องทำอย่างไร",
  "สวัสดิการพนักงานมีอะไรบ้าง",
] as const;

const ADMIN_CONVERSATION_STARTERS = [
  "สรุปขั้นตอนอนุมัติเอกสารภายในให้หน่อย",
  "มีแนวทางเบิกค่าใช้จ่ายพนักงานอย่างไรบ้าง",
] as const;

const TEAM_MEMBER_CONVERSATION_STARTERS = [
  "ถ้าต้องลาฉุกเฉินควรดำเนินการอย่างไร",
  "สิทธิการลาในช่วงทดลองงานเป็นอย่างไร",
] as const;

const collectUniqueSuggestions = (
  groups: ReadonlyArray<ReadonlyArray<string>>,
) => {
  const seen = new Set<string>();
  const suggestions: string[] = [];

  for (const group of groups) {
    for (const item of group) {
      const suggestion = item.trim();

      if (!suggestion || seen.has(suggestion)) {
        continue;
      }

      seen.add(suggestion);
      suggestions.push(suggestion);
    }
  }

  return suggestions;
};

export const getConversationStarterSuggestions = (
  context: ConversationStarterContext,
  limit = DEFAULT_SUGGESTION_LIMIT,
) => {
  const roleSuggestions = context.isAdmin
    ? ADMIN_CONVERSATION_STARTERS
    : TEAM_MEMBER_CONVERSATION_STARTERS;

  return collectUniqueSuggestions([
    COMMON_CONVERSATION_STARTERS,
    roleSuggestions,
  ]).slice(0, limit);
};
