export interface AuthUser {
  username: string;
  domain: string;
  displayName: string;
  email: string;
  fullIdentity: string;
  isAdmin?: boolean;
}

export interface AskRequest {
  question: string;
  department?: string;
  history?: Array<{ role: "user" | "assistant"; text: string }>;
}

export interface DebugSearchRequest {
  query: string;
}

export interface Source {
  title: string;
  uri?: string;
  snippet: string;
  documentName?: string;
}

export interface AskResponse {
  ok: boolean;
  answer: string;
  sources: Source[];
  grounded: boolean;
  model: string;
  requestId: string;
  latencyMs: number;
  mock?: boolean;
  suggestedQuestions?: string[];
}

export interface DebugSearchResponse {
  ok: boolean;
  chunks: Source[];
  requestId: string;
  mock: boolean;
  query: string;
}

export interface HealthResponse {
  ok: boolean;
  project: string;
  location: string;
  model: string;
  mock: boolean;
  timestamp: string;
  vertexAiConfigured: boolean;
  dataStoreConfigured: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: Source[];
  pending?: boolean;
  error?: boolean;
  latencyMs?: number;
  suggestedQuestions?: string[];
}
