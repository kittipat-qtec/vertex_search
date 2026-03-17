import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getConversationStarterSuggestions } from "@/lib/chat-suggestions";
import { appConfig } from "@/lib/config";
import { requireServerUser } from "@/lib/server-auth";

export default async function HomePage() {
  const user = await requireServerUser();

  const starterSuggestions = getConversationStarterSuggestions({
    isAdmin: Boolean(user.isAdmin),
  });

  return (
    <DashboardLayout
      mockMode={appConfig.mockMode}
      starterSuggestions={starterSuggestions}
    />
  );
}
