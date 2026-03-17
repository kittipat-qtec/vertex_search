import { useCallback, useEffect, useState } from "react";

import type { ChatMessage } from "@/lib/types";

export interface ChatSession {
  id: string;
  isPinned?: boolean;
  messages: ChatMessage[];
  title: string;
  updatedAt: number;
}

interface PersistedChatHistory {
  sessions: ChatSession[];
  version: number;
}

const DEFAULT_SESSION_TITLE = "การสนทนาใหม่";
const MAX_TITLE_LENGTH = 40;
const STORAGE_KEY = "qtec_chat_history";
const STORAGE_VERSION = 1;

const createDraftSession = (): ChatSession => ({
  id: crypto.randomUUID(),
  messages: [],
  title: DEFAULT_SESSION_TITLE,
  updatedAt: Date.now(),
});

const hasPersistedMessages = (session: ChatSession) => session.messages.length > 0;

const sortSessions = (sessions: ChatSession[]) =>
  [...sessions].sort((left, right) => {
    if (left.isPinned && !right.isPinned) {
      return -1;
    }

    if (!left.isPinned && right.isPinned) {
      return 1;
    }

    return right.updatedAt - left.updatedAt;
  });

const normalizeTitle = (title: string) => {
  const trimmedTitle = title.trim();

  if (trimmedTitle.length <= MAX_TITLE_LENGTH) {
    return trimmedTitle;
  }

  return `${trimmedTitle.slice(0, MAX_TITLE_LENGTH)}…`;
};

const deriveSessionTitle = (
  fallbackTitle: string,
  messages: ChatMessage[],
) => {
  const firstUserMessage = messages.find((message) => message.role === "user")?.text;

  if (!firstUserMessage?.trim()) {
    return fallbackTitle;
  }

  return normalizeTitle(firstUserMessage);
};

const isChatMessage = (value: unknown): value is ChatMessage => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ChatMessage>;

  return (
    typeof candidate.id === "string" &&
    (candidate.role === "assistant" || candidate.role === "user") &&
    typeof candidate.text === "string"
  );
};

const isChatSession = (value: unknown): value is ChatSession => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ChatSession>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.updatedAt === "number" &&
    Array.isArray(candidate.messages) &&
    candidate.messages.every(isChatMessage)
  );
};

const parseStoredSessions = (rawValue: string | null) => {
  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue) as PersistedChatHistory | ChatSession[];

    if (Array.isArray(parsedValue)) {
      return sortSessions(
        parsedValue.filter(
          (session): session is ChatSession =>
            isChatSession(session) && hasPersistedMessages(session),
        ),
      );
    }

    if (
      parsedValue.version === STORAGE_VERSION &&
      Array.isArray(parsedValue.sessions)
    ) {
      return sortSessions(
        parsedValue.sessions.filter(
          (session): session is ChatSession =>
            isChatSession(session) && hasPersistedMessages(session),
        ),
      );
    }
  } catch (error) {
    console.error("Failed to parse chat history from localStorage.", error);
  }

  return [];
};

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSessions(parseStoredSessions(localStorage.getItem(STORAGE_KEY)));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const payload: PersistedChatHistory = {
        sessions,
        version: STORAGE_VERSION,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLoaded, sessions]);

  const createSession = useCallback(() => createDraftSession(), []);

  const updateSession = useCallback((sessionId: string, messages: ChatMessage[]) => {
    setSessions((currentSessions) => {
      const matchingSession = currentSessions.find(
        (session) => session.id === sessionId,
      );
      const sessionTitle = deriveSessionTitle(
        matchingSession?.title && matchingSession.title !== DEFAULT_SESSION_TITLE
          ? matchingSession.title
          : DEFAULT_SESSION_TITLE,
        messages,
      );

      const nextSession: ChatSession = matchingSession
        ? {
            ...matchingSession,
            messages,
            title: sessionTitle,
            updatedAt: Date.now(),
          }
        : {
            id: sessionId,
            messages,
            title: sessionTitle,
            updatedAt: Date.now(),
          };

      return sortSessions([
        nextSession,
        ...currentSessions.filter((session) => session.id !== sessionId),
      ]);
    });
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((currentSessions) =>
      currentSessions.filter((session) => session.id !== sessionId),
    );
  }, []);

  const renameSession = useCallback((sessionId: string, newTitle: string) => {
    const nextTitle = newTitle.trim();

    if (!nextTitle) {
      return;
    }

    setSessions((currentSessions) =>
      currentSessions.map((session) =>
        session.id === sessionId
          ? {
              ...session,
              title: normalizeTitle(nextTitle),
            }
          : session,
      ),
    );
  }, []);

  const togglePinSession = useCallback((sessionId: string) => {
    setSessions((currentSessions) =>
      sortSessions(
        currentSessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                isPinned: !session.isPinned,
              }
            : session,
        ),
      ),
    );
  }, []);

  return {
    createSession,
    deleteSession,
    isLoaded,
    renameSession,
    sessions,
    togglePinSession,
    updateSession,
  };
}
