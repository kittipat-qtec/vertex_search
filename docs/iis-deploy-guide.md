# คู่มือ Deploy QTEC Knowledge Brain บนเครื่อง Windows + IIS

## สถาปัตยกรรม

```
พนักงาน QTEC (browser)
  ↓  http://192.168.x.x/brain
IIS (Windows Auth → inject headers)
  ↓  http://localhost:8080
Docker container (Next.js)
  ↓
Gemini API (Google Cloud)
```

---

## ขั้นตอนที่ 1 — ติดตั้ง IIS Modules

เปิด PowerShell (Run as Administrator):

```powershell
# ติดตั้ง IIS + Windows Auth
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServer,IIS-WindowsAuthentication,IIS-RequestFiltering -All

# ติดตั้ง URL Rewrite Module (download ก่อน)
# https://www.iis.net/downloads/microsoft/url-rewrite

# ติดตั้ง Application Request Routing (ARR)
# https://www.iis.net/downloads/microsoft/application-request-routing
```

---

## ขั้นตอนที่ 2 — Build Docker Image

```bash
# อยู่ใน folder โปรเจกต์
cd C:\Users\kittipat\Desktop\vertex_search

docker build -t qtec-brain .
```

---

## ขั้นตอนที่ 3 — สร้าง .env.local สำหรับ production

คัดลอกจาก `.env.production` แล้วแก้ค่า:

```env
MOCK_MODE=true
GOOGLE_CLOUD_PROJECT=your-project-id
MODEL_NAME=gemini-2.5-flash
ADMIN_USERS=kittipat
```

---

## ขั้นตอนที่ 4 — รัน Docker Container

```bash
docker run -d ^
  --name qtec-brain ^
  --restart always ^
  -p 8080:8080 ^
  --env-file .env.local ^
  qtec-brain
```

ตรวจสอบว่า container รันอยู่:
```bash
docker ps
curl http://localhost:8080
```

---

## ขั้นตอนที่ 5 — ตั้งค่า IIS Site

1. เปิด **IIS Manager**
2. สร้าง Site ใหม่ หรือใช้ Default Web Site
3. สร้าง **Virtual Directory** ชื่อ `brain`
4. Physical path: ใช้โฟลเดอร์ `iis/` ในโปรเจกต์ (ที่มี `web.config`)
5. ไปที่ **Authentication** → เปิด `Windows Authentication`, ปิด `Anonymous Authentication`

---

## ขั้นตอนที่ 6 — เปิด ARR Proxy

1. เปิด IIS Manager → root node (ชื่อเครื่อง)
2. Double-click **Application Request Routing Cache**
3. คลิก **Server Proxy Settings** → เปิด **Enable proxy** → Apply

---

## ขั้นตอนที่ 7 — วาง web.config

คัดลอกไฟล์ `iis/web.config` ไปวางที่ Physical path ของ IIS site

---

## ทดสอบ

```
http://192.168.x.x/brain   ← คนอื่นใน VLAN เดียวกัน
```

Windows จะถาม username/password (domain credentials) → ล็อกอินสำเร็จ → ระบบรู้จักตัวตนอัตโนมัติ

---

## แก้ปัญหาที่พบบ่อย

| ปัญหา | วิธีแก้ |
|-------|--------|
| 502 Bad Gateway | ตรวจสอบ container รันอยู่ `docker ps` |
| Auth ไม่ทำงาน | ตรวจสอบ IIS Windows Auth เปิดอยู่ |
| Mock user ยังแสดง | ตรวจสอบ ARR proxy inject headers ถูกต้อง |
| ไม่เห็น IIS ของคนอื่น | เปิด port 80 ใน Windows Firewall |
