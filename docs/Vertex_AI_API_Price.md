Vertex_AI_API_Price ในหน่วย US 
อัตราการแลกเปลี่ยนโดยประมาณคือ 1US: 34 บาท

### 1. Gemini 2.5 Standard
**ตารางค่าใช้จ่าย (ราคาต่อ 1 ล้าน Tokens)**

| Model | Type | Price (<= 200K input tokens) | Price (> 200K input tokens) | Price (<= 200K cached input tokens) | Price (> 200K cached input tokens) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gemini 2.5 Pro** | Input (text, image, video, audio) | $1.25 | $2.50 | $0.13 | $0.25 |
| | Text output (response and reasoning) | $10 | $15 | N/A | N/A |
| **Gemini 2.5 Pro Computer Use-Preview** | Input (text, image, video, audio) | $1.25 | $2.5 | N/A | N/A |
| | Text output (response and reasoning) | $10.00 | $15.00 | N/A | N/A |
| **Gemini 2.5 Flash** | Input (text, image, video) | $0.30 | $0.30 | $0.03 | $0.03 |
| | Audio Input | $1 | $1 | $0.10 | $0.10 |
| | Text output (response and reasoning) | $2.50 | $2.50 | N/A | N/A |
| **Gemini 2.5 Flash Image** | Input (text, image) | $0.30 | N/A | N/A | N/A |
| | Text output (response and reasoning) | $2.50 | N/A | N/A | N/A |
| | Image output*** | $30 | N/A | N/A | N/A |
| **Gemini 2.5 Flash Live API** | 1M input text tokens | $0.5 | $0.5 | N/A | N/A |
| | 1M input audio tokens | $3 | $3 | N/A | N/A |
| | 1M input video/image tokens | $3 | $3 | N/A | N/A |
| | 1M output text tokens | $2 | $2 | N/A | N/A |
| | 1M output audio tokens | $12 | $12 | N/A | N/A |
| **Gemini 2.5 Flash Lite** | Input (text, image, video) | $0.10 | $0.10 | $0.01 | $0.01 |
| | Audio Input | $0.30 | $0.30 | $0.03 | $0.03 |
| | Text output (response and reasoning) | $0.40 | $0.40 | N/A | N/A |

---

### 2. Gemini 2.5 Priority
**ตารางค่าใช้จ่าย (ราคาต่อ 1 ล้าน Tokens แบบ Priority)**

| Model | Type | Price (<= 200K input tokens) | Price (> 200K input tokens) | Price (<= 200K cached input tokens) | Price (> 200K cached input tokens) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Gemini 2.5 Pro** | Input (text, image, video, audio) | $2.25 | $4.50 | $0.23 | $0.45 |
| | Text output (response and reasoning) | $18 | $27 | N/A | N/A |
| **Gemini 2.5 Pro Computer Use-Preview** | *(ไม่มีบริการในรูปแบบ Priority)* | N/A | N/A | N/A | N/A |
| **Gemini 2.5 Flash** | Input (text, image, video) | $0.54 | $0.54 | $0.05 | $0.05 |
| | Audio Input | $1.80 | $1.80 | $0.18 | $0.18 |
| | Text output (response and reasoning) | $4.50 | $4.50 | N/A | N/A |
| **Gemini 2.5 Flash Image** | *(ไม่มีบริการในรูปแบบ Priority)* | N/A | N/A | N/A | N/A |
| **Gemini 2.5 Flash Live API** | *(ไม่มีบริการในรูปแบบ Priority)* | N/A | N/A | N/A | N/A |
| **Gemini 2.5 Flash Lite** | Input (text, image, video) | $0.18 | $0.18 | $0.02 | $0.02 |
| | Audio Input | $0.54 | $0.54 | $0.05 | $0.05 |
| | Text output (response and reasoning) | $0.72 | $0.72 | N/A | N/A |

---

### 3. Gemini 2.5 Flex/Batch
**ตารางค่าใช้จ่าย (ราคาต่อ 1 ล้าน Tokens แบบ Flex/Batch)**
*(หมายเหตุ: รูปแบบนี้ไม่มีฟีเจอร์ Cached input)*

| Model | Type | Price (<= 200K input tokens) | Price (> 200K input tokens) |
| :--- | :--- | :--- | :--- |
| **Gemini 2.5 Pro** | Input (text, image, video, audio) | $0.625 | $1.25 |
| | Text output (response and reasoning) | $5 | $7.5 |
| **Gemini 2.5 Pro Computer Use-Preview** | *(ไม่มีบริการในรูปแบบ Flex/Batch)* | N/A | N/A |
| **Gemini 2.5 Flash** | Input (text, image, video) | $0.15 | $0.15 |
| | Audio Input | $0.5 | $0.5 |
| | Text output (response and reasoning) | $1.25 | $1.25 |
| **Gemini 2.5 Flash Image** | Input (text, image) | $0.15 | N/A |
| | Text output (response and reasoning) | $1.25 | N/A |
| | Image output*** | $15 | N/A |
| **Gemini 2.5 Flash Live API** | *(ไม่มีบริการในรูปแบบ Flex/Batch)* | N/A | N/A |
| **Gemini 2.5 Flash Lite** | Input (text, image, video) | $0.05 | $0.05 |
| | Audio Input | $0.15 | $0.15 |
| | Text output (response and reasoning) | $0.2 | $0.2 |

---

### 4. ตาราง Feature Pricing

| Feature | Pricing & Details |
| :--- | :--- |
| **Grounding with Google Search** | - **Gemini 2.0 Flash, 2.5 Flash และ 2.5 Flash-Lite**: รวมสิทธิ์ใช้งาน 1,500 grounded prompts/วัน ฟรี<br>- **Gemini 2.5 Pro**: รวมสิทธิ์ใช้งาน 10,000 grounded prompts/วัน ฟรี<br>- หากเกินโควต้า จะคิดราคา **$35 ต่อ 1,000 grounded prompts**<br>- 1 grounded prompt คือการส่งคำขอไปที่ Gemini ซึ่งจะมีการ Query ไปที่ Google Search** อย่างน้อย 1 ครั้ง (แม้จะ Query หลายครั้งก็คิดเงินแค่ 1 ครั้ง)<br>- หากต้องการใช้เกิน 1 ล้านครั้ง/วัน หรือไม่ต้องการแสดงผลการค้นหาบน UI (มีค่าใช้จ่ายเพิ่มเติม) ให้ติดต่อทีมงาน Account |
| **Web Grounding for enterprise** | - **$45 ต่อ 1,000 grounded prompts**<br>- กฎการใช้งานคล้ายกับ Grounding with Google Search ด้านบน (ติดต่อทีมงานหากใช้เกิน 1 ล้านครั้ง หรือต้องการซ่อน Search Suggestions) |
| **Grounding with your data** | - **$2.5 ต่อ 1,000 requests** |
| **Grounding with Google Maps** | - **$25 ต่อ 1,000 grounded prompts**<br>- 1 grounded prompt คือการส่งคำขอที่ต้อง Query ไปที่ Google Maps อย่างน้อย 1 ครั้ง |

---

### 5. Other (เงื่อนไขและรายละเอียดเพิ่มเติม)
*   **กฎสำหรับ Long Context ( * ):** หาก Query input context ยาวเกินกว่า 200K tokens จะถูกคิดราคาในเรท "long context rates" ทั้งสำหรับ Input และ Output
*   **เงื่อนไขการคิดเงิน Grounding ( ** ):** Grounding with Google Search และ Web Grounding for enterprise จะคิดเงินก็ต่อเมื่อ Prompt นั้นสามารถคืนค่าเว็บสำเร็จ (มี URL ที่ได้จากเว็บอย่างน้อย 1 รายการ) ส่วนค่าใช้จ่ายของโมเดล Gemini แยกต่างหาก
*   **ขนาดและการคำนวณ Token ของรูปภาพ ( *** ):** รูปภาพขนาด 1024x1024 ใช้งานไป 1,290 tokens ซึ่งจำนวน token จะแปรผันตามความละเอียดภาพ (อ้างอิงวิธีคำนวณในหน้า Documentation ของ Google)
*   **Computer Use ( **** ):** การคิดเงินสำหรับ Computer Use จะใช้ระบบ SKU ของ Gemini 2.5 Pro หากต้องการแยกดูค่าใช้จ่ายส่วนนี้ ให้ตั้งค่า Billing tags เพิ่มเติม
*   **การคิดเงิน LiveAPI Session's Context Window:** คุณจะถูกคิดเงิน **"ต่อรอบ (per turn)"** โดยนับทุก token ที่อยู่ในหน้าต่าง Session Context ซึ่งจะรวมเอา token ใหม่จากรอบปัจจุบันไปบวกกับ token เก่าจากรอบก่อนหน้าทั้งหมด (แปลว่า token เก่าจะถูกประมวลผลซ้ำและคิดเงินใหม่ในทุกๆ รอบตามข้อจำกัดของขนาด Context window) 1 รอบ = 1 input จากผู้ใช้ + การตอบกลับของโมเดล
*   **Proactive Audio Mode:** เมื่อเปิดใช้งานฟีเจอร์นี้ จะมีการคิดเงิน Input tokens ตลอดเวลาที่ LiveAPI เปิดฟังอยู่ ส่วน Output tokens จะคิดเงินเฉพาะตอนที่ API ทำการตอบกลับ
*   **Audio to Text Transcription:** เมื่อเปิดใช้งานการแปลงเสียงเป็นข้อความ token ที่ถูกสร้างเป็นข้อความออกมาทั้งหมด จะถูกคิดราคาในเรทของ text token output 

หากมีส่วนไหนที่คุณต้องการให้ช่วยเปรียบเทียบหรือหาจุดที่คุ้มค่าที่สุดสำหรับการใช้งานของคุณ สามารถแจ้งได้เลยนะครับ!