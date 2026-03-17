import { NextResponse } from "next/server";

import { appConfig, hasVertexAiConfig, hasVertexSearchConfig } from "@/lib/config";
import type { HealthResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const response: HealthResponse = {
    ok: true,
    project: appConfig.googleCloudProject || "not-configured",
    location: appConfig.googleCloudLocation,
    model: appConfig.modelName,
    mock: appConfig.mockMode,
    timestamp: new Date().toISOString(),
    vertexAiConfigured: hasVertexAiConfig(),
    dataStoreConfigured: hasVertexSearchConfig(),
  };

  return NextResponse.json(response);
}
