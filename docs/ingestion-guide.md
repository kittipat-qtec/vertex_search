# QTEC Knowledge Brain — Document Ingestion Guide

## Ingestion Pipeline Overview

```
[Google Drive] ──┐
                 ├──► [Ingestion Worker] ──► [GCS Bucket] ──► [Vertex AI Search Data Store]
[File Server] ───┘
```

## Metadata Convention

ทุกไฟล์ที่ ingest เข้าระบบต้องมี metadata ดังนี้:

| Field | ตัวอย่าง | จำเป็น |
|-------|---------|:------:|
| `source_system` | `google_drive`, `file_server` | ✅ |
| `department` | `HR`, `QA`, `IT`, `Safety` | ✅ |
| `doc_type` | `policy`, `sop`, `manual`, `announcement` | ✅ |
| `effective_date` | `2025-01-01` | ❌ |
| `version` | `1.0`, `2022-rev1` | ❌ |

## Naming Convention

```
{department}-{doc_type}-{sequence}_{title}.{ext}
```

ตัวอย่าง:
- `HR-POL-001_leave-policy.pdf`
- `SAF-MAN-001_factory-safety-manual.pdf`
- `HR-ANN-002_holiday-2569.pdf`

## Include / Exclude Rules

**Include:**
- PDF, DOCX, PPTX, TXT
- ไฟล์ที่มีสถานะ "approved" หรือ "published"

**Exclude:**
- ไฟล์ draft, obsolete, duplicate
- ไฟล์เก่ากว่า 3 ปี (ยกเว้น policy ที่ยังมีผลบังคับ)
- ไฟล์ที่ลงท้ายด้วย `_draft`, `_old`, `_backup`

## Current Document Set (PoC)

| ไฟล์ | ประเภท | หมวด |
|------|--------|------|
| Employee Handbook 2022.pdf | คู่มือพนักงาน | HR |
| ประกาศวันหยุดประจำปี 2569.pdf | ประกาศ | HR |
| รายชื่อสถานพยาบาลปี 2569.pdf | รายชื่อ | สวัสดิการ |

## Sync Schedule (Production)

- **Auto sync:** ทุก 24 ชั่วโมง (GCS → Data Store)
- **Manual trigger:** เมื่อมีเอกสารสำคัญเข้าใหม่
- **Full re-index:** เดือนละ 1 ครั้ง
