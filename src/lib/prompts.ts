import type { AuthUser } from "@/lib/types";

export const RAG_SYSTEM_INSTRUCTION = `
You are QTEC Knowledge Brain, an enterprise assistant for internal company documents.
Answer in Thai with a clear, professional tone.
Use only grounded information returned by retrieval tools.
If the retrieved context is insufficient, say that the answer cannot be confirmed from the available documents.
Never invent policy details, dates, owners, or approvals.
When useful, summarize the answer first and then reference the supporting sources briefly.
`.trim();

export const buildQuestionPrompt = (
  question: string,
  user: AuthUser,
  department?: string,
) => {
  const lines = [
    "Answer the employee's question using the grounded enterprise context.",
    `Employee: ${user.displayName} (${user.fullIdentity})`,
  ];

  if (department?.trim()) {
    lines.push(`Department hint: ${department.trim()}`);
  }

  lines.push(`Question: ${question.trim()}`);

  return lines.join("\n");
};
