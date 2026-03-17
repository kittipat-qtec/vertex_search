"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import { ChatInterface } from "@/components/chat/ChatInterface";
import { useChatHistory } from "@/hooks/useChatHistory";
import { TopBar } from "@/components/layout/TopBar";
import Sidebar from "@/components/layout/Sidebar";
import { Loading } from "@/components/ui/Loading";

export function DashboardLayout({
  mockMode,
  starterSuggestions,
}: {
  mockMode: boolean;
  starterSuggestions: readonly string[];
}) {
  const {
    sessions,
    isLoaded,
    createSession,
    updateSession,
    deleteSession,
    renameSession,
    togglePinSession,
  } = useChatHistory();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isChatBusy, setIsChatBusy] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const requestedSessionId = searchParams.get("session");
  const isChatBusyRef = useRef(false);
  const pendingSessionIdRef = useRef<string | null>(null);
  const searchParamsRef = useRef(searchParams);

  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  useEffect(() => {
    const pendingSessionId = pendingSessionIdRef.current;

    if (!pendingSessionId) {
      return;
    }

    if (requestedSessionId === pendingSessionId) {
      pendingSessionIdRef.current = null;
    }
  }, [requestedSessionId]);

  const syncSessionParam = useCallback((nextSessionId: string) => {
    const latestSearchParams = searchParamsRef.current;
    const params = new URLSearchParams(latestSearchParams.toString());
    params.set("session", nextSessionId);

    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

    router.replace(nextUrl, { scroll: false });
  }, [pathname, router]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const pendingSessionId = pendingSessionIdRef.current;

    if (pendingSessionId) {
      if (activeSessionId !== pendingSessionId) {
        setActiveSessionId(pendingSessionId);
      }
      return;
    }

    if (activeSessionId && requestedSessionId === activeSessionId) {
      return;
    }

    if (
      requestedSessionId &&
      sessions.some((session) => session.id === requestedSessionId)
    ) {
      if (activeSessionId !== requestedSessionId) {
        setActiveSessionId(requestedSessionId);
      }
      return;
    }

    if (activeSessionId && sessions.some((session) => session.id === activeSessionId)) {
      return;
    }

    if (sessions.length > 0) {
      pendingSessionIdRef.current = sessions[0].id;
      setActiveSessionId(sessions[0].id);
      return;
    }

    const newSession = createSession();
    pendingSessionIdRef.current = newSession.id;
    setActiveSessionId(newSession.id);
  }, [activeSessionId, createSession, isLoaded, requestedSessionId, sessions]);

  useEffect(() => {
    if (!isLoaded || !activeSessionId || requestedSessionId === activeSessionId) {
      return;
    }

    syncSessionParam(activeSessionId);
  }, [activeSessionId, isLoaded, requestedSessionId, syncSessionParam]);

  const handleNewChat = useCallback(() => {
    if (isChatBusyRef.current) {
      return;
    }

    const newSession = createSession();
    pendingSessionIdRef.current = newSession.id;
    setActiveSessionId(newSession.id);
    setIsSidebarOpen(false);
  }, [createSession]);

  const handleSelectSession = useCallback((sessionId: string) => {
    if (isChatBusyRef.current) {
      return;
    }

    pendingSessionIdRef.current = sessionId;
    setActiveSessionId(sessionId);
    setIsSidebarOpen(false);
  }, []);

  const handleDeleteSession = useCallback(
    (sessionId: string) => {
      if (isChatBusyRef.current) {
        return;
      }

      deleteSession(sessionId);

      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
      }
    },
    [activeSessionId, deleteSession],
  );

  const handleSubmittingChange = useCallback((nextBusy: boolean) => {
    isChatBusyRef.current = nextBusy;
    setIsChatBusy(nextBusy);
  }, []);

  const handleMessagesChange = useCallback(
    (nextMessages: Parameters<typeof updateSession>[1]) => {
      if (!activeSessionId) {
        return;
      }

      updateSession(activeSessionId, nextMessages);
    },
    [activeSessionId, updateSession],
  );

  const activeSession = useMemo(
    () => {
      if (!activeSessionId) {
        return null;
      }

      return (
        sessions.find((session) => session.id === activeSessionId) ?? {
          id: activeSessionId,
          messages: [],
        }
      );
    },
    [activeSessionId, sessions],
  );

  if (!isLoaded) {
    return (
      <div className="chat-page">
        <TopBar mockMode={mockMode} />
        <div className="route-loading">
          <Loading label="กำลังโหลดประวัติการแชท…" />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeSessionId={activeSessionId}
        isBusy={isChatBusy}
        isOpen={isSidebarOpen}
        onDeleteSession={handleDeleteSession}
        onNewChat={handleNewChat}
        onRenameSession={renameSession}
        onSelectSession={handleSelectSession}
        onTogglePinSession={togglePinSession}
        sessions={sessions}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="dashboard-main" id="main-content">
        <TopBar
          mockMode={mockMode}
          onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
        />

        {activeSession ? (
          <ChatInterface
            initialMessages={activeSession.messages}
            key={activeSession.id}
            mockMode={mockMode}
            onSubmittingChange={handleSubmittingChange}
            onMessagesChange={handleMessagesChange}
            sessionId={activeSession.id}
            starterSuggestions={starterSuggestions}
          />
        ) : (
          <div className="route-loading">
            <Loading label="กำลังเตรียมห้องสนทนา…" />
          </div>
        )}
      </main>
    </div>
  );
}
