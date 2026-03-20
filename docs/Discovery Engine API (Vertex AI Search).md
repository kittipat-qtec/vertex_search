Discovery Engine API (Vertex AI Search)_Price ในหน่วย US 

### 1. รูปแบบการคิดราคาหลัก (Pricing Models)
Vertex AI Search มีรูปแบบการคิดราคา 2 แบบหลักที่คุณต้องเลือกใช้:
*   **General Pricing (จ่ายตามการใช้งานจริง):** เหมาะสำหรับการเริ่มต้นที่รวดเร็ว, มีปริมาณ Query ต่ำกว่า 15 ล้านครั้ง/เดือน และทราฟฟิกไม่แน่นอน คิดเงินตามจำนวน Query และขนาดข้อมูลที่ Index, (มีให้ทดลองใช้ฟรี 10,000 queries/บัญชี/เดือน โดยไม่รวม Advanced Generative Answers)
*   **Configurable Pricing (สมัครสมาชิกรายเดือน):** เหมาะสำหรับงานที่มีมากกว่า 15 ล้าน Query/เดือน, ทราฟฟิกคงที่ และต้องการควบคุมงบประมาณ คิดค่าบริการพื้นฐานรายเดือน (QPM และ Storage) ร่วมกับค่า Add-on ตามการใช้งานจริง,

---

### 2. General Pricing (ราคาแบบจ่ายตามการใช้งานจริง)
ตารางค่าบริการสำหรับการค้นหา (Pricing for search queries):

| ประเภท (Type) | ราคาต่อ 1,000 Query (USD) | รายละเอียดที่รวมอยู่ด้วย |
| :--- | :--- | :--- |
| **Search Standard Edition** | $1.50 | ค้นหาข้อมูล Unstructured/Structured, รวม Semantic Retrieval และ KPI Optimization |
| **Search Enterprise Edition** | $4.00 | ค้นหาข้อมูล Unstructured/Structured/Website, รวม Core Generative Answers (AI Mode) ให้คำตอบ สรุป และ follow-ups พื้นฐาน |
| **Advanced Generative Answers (AI Mode)** | +$4.00 | เป็นส่วนเสริม (Add-on) เพิ่มฟีเจอร์ ถาม-ตอบแบบซับซ้อน (Suggested follow-ups, Complex query, Multimodality), |

*(หมายเหตุ: หากใช้ Advanced Generative Answers คู่กับ Enterprise Edition จะคิดราคา $4.00 + $4.00 = $8.00 ต่อ 1,000 queries,)*

---

### 3. Configurable Pricing (ราคาแบบสมัครสมาชิกและเลือก Add-on)
ตารางค่าบริการแบบ Subscription (ต้องสมัครขั้นต่ำ: 1,000 QPM และ Storage 50 GB):

**ค่าบริการพื้นฐาน (Core Subscription)**
| ประเภทบริการ | ราคาต่อ 1 ชั่วโมง (USD) | รายละเอียด |
| :--- | :--- | :--- |
| **Query Unit** | $0.008219178 | ค่าสมัครสมาชิกสำหรับความจุ Throughput ของการค้นหา (QPM) |
| **Storage Unit** | $0.001369863 | ค่าสมัครสมาชิกสำหรับพื้นที่เก็บข้อมูลดิบเพื่อทำ Indexing |

**ค่าบริการเสริม (Pay-As-You-Go Add-ons)** (คิดราคาต่อ 1,000 ครั้ง),
| Add-on | ราคา (USD) | รายละเอียด |
| :--- | :--- | :--- |
| **Semantic** | $0.75 (+ $1.50/GB/เดือน สำหรับ Embeddings) | การเข้าใจบริบทและ Hybrid Search (จำเป็นต้องมีหากใช้ AI Mode) |
| **KPI & Personalization** | $0.20 | ปรับแต่งผลลัพธ์ให้ตรงเป้าหมายทางธุรกิจ (เช่น การมีส่วนร่วม, Conversion) |
| **Core Generative Answers** | $2.00 | สร้างคำตอบ การอ้างอิง และ Follow-ups (ต้องใช้ร่วมกับ Semantic) |
| **Advanced Generative Answers (AI Mode)** | $4.00 | จัดการคำถามซับซ้อน, Multi-turn และ Multimodality (ต้องใช้ร่วมกับ Semantic) |
*(หมายเหตุ: หากใช้งานเกิน QPM ที่สมัครไว้ (Overage) จะถูกคิดเงินในเรท General Pricing ที่ $1.50 / 1,000 queries)*

---

### 4. ค่าพื้นที่จัดเก็บข้อมูล (Index Storage Pricing)
| ประเภท | โควต้าฟรี | ราคาเมื่อเกินโควต้า (USD) |
| :--- | :--- | :--- |
| **Index Storage** | 10 GiB แรก/เดือน | $0.006849315 ต่อ 1 GiB/ชั่วโมง |
*(หมายเหตุ: ข้อมูลประเภท Website จะคำนวณที่ 500 KiB ต่อ 1 หน้าเว็บ)*

---

### 5. การค้นหาเฉพาะอุตสาหกรรม (Healthcare & Media)
**Vertex AI Search for Healthcare**
*   **Healthcare Search:** $20.00 ต่อ 1,000 ครั้ง

**Vertex AI Search for Media**,,
*   **Data Index:** ฟรี 10 GiB แรก/เดือน, ส่วนเกินคิด $0.006849315 ต่อ 1 GiB/ชั่วโมง
*   **Media Search API Request:** $2.00 ต่อ 1,000 ครั้ง
*   **Media Recommendations - Predictions requests:** $0.20 ต่อ 1,000 ครั้ง
*   **Media Recommendations - Training and Tuning:** $2.50 ต่อ 1 ชั่วโมง (ต่อ Node)

---

### 6. บริการเสริมและ API อื่นๆ (APIs & Document AI)

**Grounded Generation API** (ใช้สร้างคำตอบโดยอิงข้อมูลจาก Search หรือเอกสารของคุณ),
*   **Input / Output:** คิดราคาตามโมเดล Gemini ที่เลือกใช้งาน
*   **Grounding บนข้อมูลของคุณเอง (Retrieved data):** $2.50 ต่อ 1,000 ครั้ง (ไม่รวมค่าค้นหาข้อมูลจาก Vertex AI Search)
*   **Grounding บน Google Search:** 10,000 ครั้งแรก/วัน ฟรี, ส่วนเกินคิด $35.00 ต่อ 1,000 ครั้ง
*   **Check Grounding API:** $0.00075 ต่อ 1,000 ครั้ง (ใช้สำหรับตรวจสอบความแม่นยำของคำตอบอ้างอิง),

**Document AI (รวมอยู่ใน Vertex AI Search)**,
*   **Digitize text (OCR):** ฟรี 1,000 หน้าแรก/เดือน, 1,000 ถึง 5 ล้านหน้า คิด $1.50/1,000 หน้า, มากกว่า 5 ล้านหน้า คิด $0.60/1,000 หน้า
*   **Layout Parser:** $10.00 ต่อ 1,000 หน้า
*(ขนาดของ 1 "หน้า" ขึ้นอยู่กับประเภทไฟล์ เช่น ภาพ=1 หน้า, PDF 1 หน้า=1 หน้า, Word/HTML 3,000 ตัวอักษร=1 หน้า)*

**Ranking API** (ใช้จัดเรียงเอกสารตามความเกี่ยวข้องกับ Query),
*   **Ranking:** $1.00 ต่อ 1,000 ครั้ง
*(หมายเหตุ: 1 Query สามารถส่งเอกสารให้จัดเรียงได้สูงสุด 100 เอกสาร หากเกินจะคิดราคาเพิ่มขึ้นทีละ 1 Query ทุกๆ 100 เอกสาร เช่น 132 เอกสารจะคิดเป็น 2 Queries,)*