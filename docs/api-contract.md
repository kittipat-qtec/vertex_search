# QTEC Knowledge Brain — API Contract

## Base URL

- Dev: `http://localhost:3000`
- Production: `https://<cloud-run-url>`

---

## Authentication

ทุก endpoint (ยกเว้น `/api/health`) ต้องมี IIS Windows Auth headers:

| Header | ค่าตัวอย่าง | จำเป็น |
|--------|------------|:------:|
| `x-iis-auth-user` | `QTEC\somchai.s` | ✅ |
| `x-iis-auth-displayname` | `สมชาย สุขใจ` | ❌ |
| `x-iis-auth-email` | `somchai.s@qtec.co.th` | ❌ |
| `x-iis-auth-domain` | `QTEC` | ❌ |

> **Mock Mode:** เมื่อ `MOCK_MODE=true` ระบบจะใช้ mock user โดยไม่ตรวจ headers

---

## Endpoints

### `GET /api/auth/whoami`

คืนข้อมูล identity ของผู้ใช้ปัจจุบัน

**Response 200:**
```json
{
  "ok": true,
  "user": {
    "username": "somchai.s",
    "domain": "QTEC",
    "displayName": "สมชาย สุขใจ",
    "email": "somchai.s@qtec.co.th",
    "fullIdentity": "QTEC\\somchai.s"
  }
}
```

**Response 401:**
```json
{
  "ok": false,
  "error": "ไม่สามารถระบุตัวตนผู้ใช้งานจาก IIS headers ได้"
}
```

---

### `POST /api/ask`

ถามคำถามเกี่ยวกับเอกสารองค์กร

**Request Body:**
```json
{
  "question": "นโยบายการลาพักร้อนเป็นอย่างไร",
  "department": "HR"
}
```

| Field | Type | จำเป็น | คำอธิบาย |
|-------|------|:------:|---------|
| `question` | string | ✅ | คำถามภาษาไทย/อังกฤษ |
| `department` | string | ❌ | ฝ่ายงานสำหรับ filter |

**Response 200:**
```json
{
  "ok": true,
  "answer": "ตามคู่มือพนักงาน ...",
  "sources": [
    {
      "title": "Employee Handbook 2022",
      "uri": "docs/Employee Handbook 2022.pdf",
      "snippet": "พนักงานประจำมีสิทธิ์ลาพักร้อน..."
    }
  ],
  "grounded": true,
  "model": "gemini-2.5-flash",
  "requestId": "uuid",
  "latencyMs": 850,
  "mock": true
}
```

**Error Responses:**

| Status | เงื่อนไข |
|--------|---------|
| 400 | ไม่ระบุ question หรือ format ผิด |
| 401 | ไม่พบ auth headers |
| 500 | Vertex AI error |
| 503 | Data store ยังไม่ได้ตั้งค่า |

---

### `GET /api/health`

สถานะระบบ (ไม่ต้อง auth)

**Response 200:**
```json
{
  "ok": true,
  "project": "aix-communication-hub",
  "location": "us-central1",
  "model": "gemini-2.5-flash",
  "mock": true,
  "timestamp": "2026-03-16T04:00:00.000Z",
  "vertexAiConfigured": true,
  "dataStoreConfigured": false
}
```

---

### `POST /api/search/debug`

Debug retrieval chunks สำหรับตรวจว่า data store คืนเอกสารอะไร

**Request Body:**
```json
{
  "query": "วันหยุดประจำปี"
}
```

**Response 200:**
```json
{
  "ok": true,
  "chunks": [
    {
      "title": "ประกาศวันหยุดประจำปี 2569",
      "uri": "docs/ประกาศวันหยุดประจำปี 2569.pdf",
      "snippet": "..."
    }
  ],
  "requestId": "uuid",
  "mock": true,
  "query": "วันหยุดประจำปี"
}
```
