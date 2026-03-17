# QTEC Knowledge Brain — System Architecture

## Overview

Enterprise Managed RAG PoC ที่ใช้ Gemini on Vertex AI + Grounding with Vertex AI Search เป็นแกนกลาง

## Architecture Layers

```
[พนักงาน QTEC]
      │
      ▼
[IIS — Windows Authentication]
      │  Auth headers (x-iis-auth-*)
      ▼
[Next.js 15 — App Router]
      │
      ├── GET  /api/auth/whoami     → ข้อมูล identity ผู้ใช้
      ├── POST /api/ask              → ถามคำถาม RAG
      ├── GET  /api/health           → สถานะระบบ
      └── POST /api/search/debug     → Debug retrieval
      │
      ▼
[Google Gen AI SDK — @google/genai]
      │  vertexai: true
      ▼
[Gemini 2.5 Flash on Vertex AI]
      │  Grounding tool
      ▼
[Vertex AI Search Data Store]
      ▲
      │  Sync / indexing
[GCS Knowledge Bucket]
      ▲
      │
[Ingestion Worker]
      ▲              ▲
      │              │
[Google Drive]  [File Server]
```

## Key Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend + Backend | Next.js API Route (ไม่แยก Express) | ลดความซับซ้อนสำหรับ PoC |
| GenAI SDK | `@google/genai` (ไม่ใช่ aiplatform) | SDK ใหม่ที่ Google แนะนำ |
| Auth | IIS Windows Auth → header parsing | ใช้ infra เดิมของ QTEC |
| Deployment | Google Cloud Run (standalone) | Stateless, auto-scale |
| Mock Mode | env-based switch (`MOCK_MODE`) | Dev ได้โดยไม่ต้องรอ Discovery Engine |

## Data Flow — Query

1. ผู้ใช้พิมพ์คำถามใน Chat UI
2. Frontend `POST /api/ask` พร้อม `{ question }`
3. API middleware ตรวจ IIS auth headers
4. ถ้า `MOCK_MODE=true` → คืนคำตอบจำลอง
5. ถ้า `MOCK_MODE=false` → เรียก Gemini + Vertex AI Search grounding
6. Gemini ดึง relevant chunks จาก Data Store
7. สังเคราะห์คำตอบภาษาไทย + sources
8. Frontend แสดงคำตอบพร้อมแหล่งอ้างอิง

## Data Flow — Ingestion

1. Worker ตรวจจับไฟล์ใหม่/เปลี่ยนแปลง
2. ดึงจาก Google Drive หรือ File Server
3. Normalize ชื่อ + เติม metadata
4. อัปโหลดเข้า GCS bucket กลาง
5. Vertex AI Search data store sync จาก GCS
