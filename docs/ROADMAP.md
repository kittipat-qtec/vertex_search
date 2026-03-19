# 🚀 QTEC Knowledge Brain — แผนพัฒนาสู่ระบบ AI ระดับชั้นนำของประเทศไทย

> เอกสารนี้ออกแบบให้ **AI ตัวถัดไปอ่านแล้วดำเนินการได้ทันที** ทุกเฟสมีรายละเอียดไฟล์ คำสั่ง และ acceptance criteria ครบถ้วน

---

## 📍 สถานะปัจจุบัน (ณ วันที่ 19 มี.ค. 2568)

### สิ่งที่ทำเสร็จแล้ว
- ✅ Chat UI + Markdown rendering + Source citations
- ✅ Chat History (localStorage, pin/rename/delete, 50-session limit, search)
- ✅ IIS Header Auth + Mock fallback + Admin detection
- ✅ Admin Dashboard (health, metrics)
- ✅ Gemini 2.5 Flash integration (mock context mode)
- ✅ Mock System (16 topics keyword matching)
- ✅ Auto-scroll (ChatGPT-style, scroll-up pause)
- ✅ Rate limiting (10 req/min/user, in-memory)
- ✅ Structured JSON logging (Cloud Logging compatible)
- ✅ Multi-turn conversation (10 turns history)
- ✅ Dark/Light theme toggle
- ✅ 👍👎 Feedback buttons
- ✅ Sidebar chat search
- ✅ Export conversation (.txt)
- ✅ Automated tests (19 tests — vitest)
- ✅ New chat on first visit (ChatGPT-style)
- ✅ Dockerfile multi-stage (Cloud Run ready)

### Tech Stack ปัจจุบัน
- **Frontend:** Next.js 15.5, React 19, Vanilla CSS, react-markdown
- **Backend:** Next.js API Routes (Node.js runtime)
- **AI:** `@google/genai` SDK → Gemini 2.5 Flash
- **Auth:** IIS Reverse Proxy headers
- **Test:** Vitest
- **Deploy:** Dockerfile → Cloud Run (ยังไม่ deploy)

### ไฟล์สำคัญ
| ไฟล์ | หน้าที่ |
|------|--------|
| `src/lib/genai.ts` | AI core — Vertex Search grounding + Gemini fallback + multi-turn |
| `src/lib/config.ts` | App config จาก env vars |
| `src/lib/auth.ts` | Parse IIS auth headers + mock user |
| `src/lib/rate-limit.ts` | Sliding window rate limiter |
| `src/lib/logger.ts` | Structured JSON logger |
| `src/lib/prompts.ts` | System prompt + RAG instruction |
| `src/lib/mock/mockData.ts` | 16 knowledge topics |
| `src/lib/mock/mockService.ts` | Keyword matching mock responder |
| `src/app/api/ask/route.ts` | Main Q&A endpoint |
| `src/hooks/useChat.ts` | Chat state + API call + history send |
| `src/hooks/useChatHistory.ts` | localStorage session management |
| `src/components/chat/ChatInterface.tsx` | Chat shell + auto-scroll + export |
| `src/components/chat/MessageBubble.tsx` | Message display + feedback buttons |
| `src/components/layout/Sidebar.tsx` | Session list + search + kebab menu |
| `src/components/layout/TopBar.tsx` | Brand + theme toggle + user badge |

---

## เฟส 1: เปิด Discovery Engine API + สร้าง Data Store

### เป้าหมาย
ระบบตอบคำถามจาก **เอกสารจริงขององค์กร** แทน Mock Data

### ขั้นตอน

#### 1.1 เปิด API ใน Google Cloud Console
```
gcloud services enable discoveryengine.googleapis.com --project=PROJECT_ID
```

#### 1.2 สร้าง Data Store
```
gcloud discovery-engine data-stores create qtec-knowledge-store \
  --location=global \
  --display-name="QTEC Knowledge Base" \
  --industry-vertical=GENERIC \
  --content-config=CONTENT_REQUIRED \
  --project=PROJECT_ID
```

#### 1.3 สร้าง Search Engine (App)
```
gcloud discovery-engine engines create qtec-search-engine \
  --location=global \
  --display-name="QTEC Search" \
  --data-store-ids=qtec-knowledge-store \
  --search-tier=SEARCH_TIER_ENTERPRISE \
  --project=PROJECT_ID
```

#### 1.4 อัปโหลดเอกสาร
เอกสารอยู่ใน `docs/` folder:
- `employee-handbook.pdf` — คู่มือพนักงาน
- `public-holidays-2568.pdf` — วันหยุดราชการ
- `hospital-list.pdf` — รายชื่อสถานพยาบาล

```
gsutil cp docs/*.pdf gs://PROJECT_ID-knowledge-docs/

gcloud discovery-engine documents import \
  --data-store=qtec-knowledge-store \
  --location=global \
  --source=gs://PROJECT_ID-knowledge-docs/ \
  --project=PROJECT_ID
```

#### 1.5 ตั้งค่า Environment Variables
```env
# .env.local
MOCK_MODE=false
GOOGLE_CLOUD_PROJECT=your-project-id
DATA_STORE_ID=qtec-knowledge-store
DATA_STORE_LOCATION=global
MODEL_NAME=gemini-2.5-flash
```

#### 1.6 Acceptance Criteria
- [ ] ถามคำถามจากเอกสารจริงแล้วได้คำตอบที่ถูกต้อง
- [ ] `sources[]` แสดง citation จาก PDF จริง
- [ ] Mock mode ยังใช้ได้ถ้าตั้ง `MOCK_MODE=true`

---

## เฟส 2: Streaming Response (SSE)

### เป้าหมาย
คำตอบแสดงทีละคำเหมือน ChatGPT/Claude (ไม่ต้องรอจนครบ)

### ขั้นตอน

#### 2.1 สร้าง Streaming API Route
#### [NEW] `src/app/api/ask-stream/route.ts`
```typescript
// ใช้ generateContentStream แทน generateContent
// Return ReadableStream ผ่าน Response constructor
// แต่ละ chunk ส่งเป็น text/event-stream format:
//   data: {"type":"text","content":"..."}\n\n
//   data: {"type":"sources","sources":[...]}\n\n
//   data: {"type":"done","latencyMs":123}\n\n
```

#### 2.2 แก้ `src/lib/genai.ts`
- เพิ่ม function `askVertexGroundedQuestionStream()` ที่ return `AsyncGenerator<string>`
- ใช้ `client.models.generateContentStream()` แทน `generateContent()`

#### 2.3 แก้ `src/hooks/useChat.ts`
- เพิ่ม option `streaming: true`
- ใช้ `fetch` + `ReadableStream` reader
- อัปเดต message text ทีละ chunk แบบ real-time
- ยังคง fallback เป็น non-streaming ถ้า SSE ไม่รองรับ

#### 2.4 แก้ `src/components/chat/MessageBubble.tsx`
- เพิ่ม CSS animation ให้ cursor กะพริบที่ท้ายข้อความขณะ streaming
- Class: `.message-bubble--streaming` พร้อม blinking cursor

#### 2.5 Acceptance Criteria
- [ ] คำตอบแสดงทีละคำ ไม่ต้องรอจนครบ
- [ ] Cursor กะพริบขณะ AI กำลังตอบ
- [ ] Sources แสดงหลังจากคำตอบเสร็จ
- [ ] Auto-scroll ยังทำงานขณะ streaming
- [ ] Rate limit ยังทำงานกับ streaming endpoint

---

## เฟส 3: Ingestion Pipeline (นำเข้าเอกสารอัตโนมัติ)

### เป้าหมาย
เอกสารใหม่ถูกนำเข้าสู่ Data Store อัตโนมัติ ไม่ต้อง manual upload

### Architecture
```
Google Drive / SharePoint / File Server
        ↓ (Cloud Scheduler ทุก 6 ชม.)
  Cloud Function (ingest-worker)
        ↓
  Google Cloud Storage (staging bucket)
        ↓
  Discovery Engine Import API
        ↓
  Data Store (index ใหม่)
```

### ขั้นตอน

#### 3.1 สร้าง Cloud Function
#### [NEW] `functions/ingest-worker/index.ts`
```typescript
// 1. List files จาก source (GCS/Drive)
// 2. Filter เฉพาะไฟล์ใหม่/แก้ไข (compare lastModified)
// 3. Copy ไป staging bucket
// 4. เรียก Discovery Engine import API
// 5. Log ผลลัพธ์ด้วย structured logging
```

#### 3.2 สร้าง Admin UI สำหรับ Manual Trigger
#### [MODIFY] `src/app/dashboard/page.tsx`
- เพิ่มปุ่ม "นำเข้าเอกสาร" ใน Admin Dashboard
- แสดงสถานะ last ingestion time
- แสดงจำนวนเอกสารใน Data Store

#### 3.3 สร้าง API สำหรับ Ingestion Status
#### [NEW] `src/app/api/admin/ingestion/route.ts`

#### 3.4 Acceptance Criteria
- [ ] เอกสารใหม่ใน source ถูก index ภายใน 6 ชม.
- [ ] Admin สามารถ trigger manual import ได้
- [ ] Dashboard แสดงสถานะ ingestion ล่าสุด

---

## เฟส 4: Persistent Chat History (Server-side)

### เป้าหมาย
ประวัติแชทเก็บบน server — ใช้ได้ข้ามเครื่อง/เบราว์เซอร์

### ทางเลือก (เลือก 1)
| Option | ข้อดี | ข้อเสีย |
|--------|-------|--------|
| **Firestore** | Serverless, real-time sync, free tier | ต้องเปิด Firebase |
| **Cloud SQL (PostgreSQL)** | Full SQL, familiar | ต้อง manage connection pool |
| **AlloyDB** | Best perf, AI-optimized | ราคาสูง |

### แนะนำ: **Firestore** (เหมาะกับ chat data structure)

#### 4.1 Schema Design
```
Collection: users/{userId}/sessions/{sessionId}
  - title: string
  - isPinned: boolean
  - createdAt: Timestamp
  - updatedAt: Timestamp

Sub-collection: users/{userId}/sessions/{sessionId}/messages/{messageId}
  - role: "user" | "assistant"
  - text: string
  - sources: Source[]
  - latencyMs: number
  - feedback: "up" | "down" | null
  - createdAt: Timestamp
```

#### 4.2 สร้าง API Routes
#### [NEW] `src/app/api/sessions/route.ts` — GET (list), POST (create)
#### [NEW] `src/app/api/sessions/[id]/route.ts` — GET, PATCH, DELETE
#### [NEW] `src/app/api/sessions/[id]/messages/route.ts` — GET, POST

#### 4.3 แก้ `src/hooks/useChatHistory.ts`
- สลับจาก localStorage เป็น fetch API
- เก็บ localStorage เป็น offline cache (optimistic UI)
- Sync กลับเมื่อ online

#### 4.4 Acceptance Criteria
- [ ] Login จากเครื่องอื่นแล้วเห็นประวัติแชทเดิม
- [ ] Feedback (👍👎) ถูกบันทึกลง Firestore
- [ ] ทำงานได้แม้ offline (ใช้ localStorage cache)

---

## เฟส 5: Advanced UX Features

### 5.1 Suggested Follow-up Questions
#### [MODIFY] `src/lib/genai.ts`
- หลังตอบคำถาม ให้ AI สร้าง 3 คำถามที่เกี่ยวข้อง
- เพิ่ม `suggestedQuestions: string[]` ใน `AskResponse`

#### [MODIFY] `src/components/chat/MessageBubble.tsx`
- แสดง suggestion chips ใต้คำตอบ (คลิกแล้วถามอัตโนมัติ)

### 5.2 File Upload + Q&A
#### [NEW] `src/app/api/upload/route.ts`
- รับไฟล์ PDF/DOCX/TXT (max 10MB)
- ส่งให้ Gemini อ่านแล้วตอบคำถามเกี่ยวกับเนื้อหา

#### [MODIFY] `src/components/chat/QuestionInput.tsx`
- เพิ่มปุ่ม 📎 แนบไฟล์
- แสดง preview ชื่อไฟล์ก่อนส่ง

### 5.3 Copy to Clipboard
#### [MODIFY] `src/components/chat/MessageBubble.tsx`
- เพิ่มปุ่ม 📋 copy คำตอบไปยัง clipboard
- แสดง "คัดลอกแล้ว" tooltip ชั่วครู่

### 5.4 Regenerate Response
#### [MODIFY] `src/components/chat/MessageBubble.tsx`
- เพิ่มปุ่ม 🔄 regenerate เฉพาะคำตอบล่าสุด
- ลบคำตอบเก่าแล้วส่งคำถามเดิมใหม่

### 5.5 Message Editing
#### [MODIFY] `src/components/chat/MessageBubble.tsx`
- ผู้ใช้ดับเบิลคลิกข้อความตัวเองเพื่อแก้ไข
- ส่งคำถามใหม่พร้อมลบคำตอบเก่า

### 5.6 Voice Input (Speech-to-Text)
#### [MODIFY] `src/components/chat/QuestionInput.tsx`
- เพิ่มปุ่ม 🎤 ใช้ Web Speech API
- รองรับภาษาไทย (`th-TH`)

### 5.7 Acceptance Criteria
- [ ] Suggested questions แสดงหลังทุกคำตอบ
- [ ] สามารถอัปโหลด PDF แล้วถามเกี่ยวกับเนื้อหาได้
- [ ] Copy/Regenerate/Edit ทำงานถูกต้อง
- [ ] Voice input แปลงเสียงไทยเป็นข้อความได้

---

## เฟส 6: Security & Production Hardening

### 6.1 Input Sanitization
#### [MODIFY] `src/app/api/ask/route.ts`
- Limit question length (max 2000 chars)
- Strip HTML/script tags
- Detect prompt injection patterns

#### [NEW] `src/lib/sanitize.ts`
```typescript
export const sanitizeQuestion = (input: string): string => {
  // 1. Trim + length cap
  // 2. Remove HTML tags
  // 3. Detect and flag prompt injection attempts
  //    (e.g., "ignore previous instructions", "system prompt")
  // 4. Return cleaned string
};
```

### 6.2 Content Safety Filter
#### [MODIFY] `src/lib/genai.ts`
- ใช้ Gemini safety settings: `HARM_BLOCK_THRESHOLD: BLOCK_MEDIUM_AND_ABOVE`
- ตั้ง categories: `HARASSMENT`, `HATE_SPEECH`, `SEXUALLY_EXPLICIT`, `DANGEROUS_CONTENT`

### 6.3 Audit Trail
#### [NEW] `src/lib/audit.ts`
- Log ทุก request: userId, question, responseId, timestamp, latency, feedback
- เก็บใน BigQuery หรือ Firestore collection `audit_logs`

### 6.4 CORS / CSP Headers
#### [MODIFY] `next.config.ts`
```typescript
headers: [
  {
    source: '/api/:path*',
    headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Content-Security-Policy', value: "default-src 'self'" },
    ],
  },
],
```

### 6.5 Secret Management
- ใช้ Google Secret Manager แทน `.env` files สำหรับ production
- ไม่ hardcode API keys ใน code

### 6.6 Acceptance Criteria
- [ ] คำถามยาวเกิน 2000 ตัวอักษรถูกปฏิเสธ
- [ ] HTML/script ใน input ถูก strip ออก
- [ ] AI ไม่ตอบเนื้อหาที่ไม่เหมาะสม
- [ ] ทุก request ถูกบันทึกใน audit log
- [ ] Security headers ครบถ้วน

---

## เฟส 7: Analytics & Monitoring Dashboard

### 7.1 Usage Analytics
#### [NEW] `src/app/dashboard/analytics/page.tsx`
- กราฟจำนวนคำถามต่อวัน/สัปดาห์/เดือน
- Top 10 คำถามที่ถามบ่อยที่สุด
- Average response time
- Feedback ratio (👍 vs 👎)
- Active users per day

### 7.2 Alert System
#### [NEW] `src/lib/alerts.ts`
- แจ้งเตือนผ่าน Google Chat webhook เมื่อ:
  - Error rate > 5% ใน 5 นาที
  - Response latency > 10 วินาที
  - Rate limit triggered > 50 ครั้ง/ชม.

### 7.3 Health Check Enhancement
#### [MODIFY] `src/app/api/health/route.ts`
- เช็ค Gemini API connectivity
- เช็ค Data Store availability
- เช็ค Firestore connectivity
- Return detailed component health

### 7.4 Acceptance Criteria
- [ ] Admin เห็น usage analytics ใน dashboard
- [ ] ระบบแจ้งเตือนอัตโนมัติเมื่อมีปัญหา
- [ ] Health endpoint ตรวจสอบทุก component

---

## เฟส 8: Production Deployment & CI/CD

### 8.1 Cloud Run Deployment
```bash
# Build
docker build -t gcr.io/PROJECT_ID/qtec-brain:latest .

# Push
docker push gcr.io/PROJECT_ID/qtec-brain:latest

# Deploy
gcloud run deploy qtec-brain \
  --image=gcr.io/PROJECT_ID/qtec-brain:latest \
  --region=asia-southeast1 \
  --platform=managed \
  --allow-unauthenticated \
  --set-env-vars="MOCK_MODE=false,GOOGLE_CLOUD_PROJECT=PROJECT_ID,DATA_STORE_ID=qtec-knowledge-store" \
  --memory=1Gi \
  --cpu=2 \
  --max-instances=10 \
  --min-instances=1
```

### 8.2 CI/CD Pipeline
#### [NEW] `.github/workflows/deploy.yml`
```yaml
# Trigger on push to main
# Steps:
#   1. npm ci
#   2. npm run lint
#   3. npm test
#   4. docker build
#   5. docker push to GCR
#   6. gcloud run deploy
```

### 8.3 Staging Environment
- สร้าง Cloud Run service แยก: `qtec-brain-staging`
- Deploy อัตโนมัติจาก `develop` branch
- ใช้ Data Store แยกสำหรับ staging

### 8.4 Custom Domain
- ตั้ง domain: `brain.qtec.co.th`
- ใช้ Cloud Run domain mapping หรือ Load Balancer

### 8.5 Acceptance Criteria
- [ ] Push to `main` → auto-deploy to production
- [ ] Push to `develop` → auto-deploy to staging
- [ ] Tests ต้องผ่านก่อน deploy
- [ ] Custom domain `brain.qtec.co.th` ใช้งานได้
- [ ] SSL certificate ถูกต้อง

---

## 🎯 Priority Matrix

```
เฟส 1 (Discovery Engine) ←── ต้องทำก่อน ทุกอย่างขึ้นอยู่กับนี้
   ↓
เฟส 2 (Streaming) ←── UX impact สูงมาก
   ↓
เฟส 6 (Security) ←── ต้องทำก่อน production
   ↓
เฟส 8 (Deploy) ←── ขึ้น production
   ↓
เฟส 3 (Ingestion) ←── ทำให้ data fresh
   ↓
เฟส 4 (Persistent History) ←── ทำให้ user experience สมบูรณ์
   ↓
เฟส 5 (Advanced UX) ←── polish ให้เป็น world-class
   ↓
เฟส 7 (Analytics) ←── วัดผลและปรับปรุง
```

---

## 📋 คำสั่งสำหรับ AI ตัวถัดไป

> เมื่อเริ่มทำงาน ให้อ่านไฟล์เหล่านี้ก่อน:
> 1. อ่านไฟล์แผนนี้ (`implementation_plan.md`)
> 2. อ่าน `src/lib/config.ts` เพื่อดู env vars ปัจจุบัน
> 3. อ่าน `src/lib/genai.ts` เพื่อดู AI integration
> 4. อ่าน `src/app/api/ask/route.ts` เพื่อดู request flow
> 5. รัน `npm test` เพื่อยืนยันว่า tests ผ่านก่อนเริ่มแก้
> 6. ดำเนินการตามเฟสที่ user ระบุ
