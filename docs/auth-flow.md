# QTEC Knowledge Brain — Windows Authentication Flow

## ลำดับการทำงาน

```
1. ผู้ใช้เปิดเว็บไซต์ผ่าน IIS
2. IIS ยืนยันตัวตนผ่าน Windows Auth (NTLM/Kerberos)
3. IIS ส่ง request ต่อพร้อม auth headers
4. Next.js API Route อ่าน headers ผ่าน auth middleware
5. Frontend เรียก GET /api/auth/whoami เพื่อรู้ว่าผู้ใช้คือใคร
6. AuthProvider เก็บข้อมูลผู้ใช้ใน React Context
7. ProtectedRoute ตรวจว่า authenticated แล้วหรือยัง
8. ถ้าไม่ authenticated → redirect ไป /unauthorized
```

## IIS Auth Headers

Header names สามารถ configure ผ่าน env vars:

| Env Var | Default Header | ค่าตัวอย่าง |
|---------|---------------|------------|
| `AUTH_HEADER_USER` | `x-iis-auth-user` | `QTEC\somchai.s` |
| `AUTH_HEADER_DISPLAYNAME` | `x-iis-auth-displayname` | `สมชาย สุขใจ` |
| `AUTH_HEADER_EMAIL` | `x-iis-auth-email` | `somchai.s@qtec.co.th` |
| `AUTH_HEADER_DOMAIN` | `x-iis-auth-domain` | `QTEC` |

## Mock Mode Auth

เมื่อ `MOCK_MODE=true` ระบบใช้ mock user แทน:

```env
MOCK_AUTH_USER=QTEC\dev.user
MOCK_AUTH_DISPLAYNAME=นักพัฒนาทดสอบ
MOCK_AUTH_EMAIL=dev.user@qtec.co.th
```

## Key Files

| ไฟล์ | หน้าที่ |
|------|--------|
| `src/lib/auth.ts` | Parse IIS headers, สร้าง mock user |
| `src/app/api/auth/whoami/route.ts` | GET endpoint คืน identity |
| `src/components/auth/AuthProvider.tsx` | React Context fetch whoami |
| `src/components/auth/ProtectedRoute.tsx` | Guard redirect |
| `src/components/auth/UserBadge.tsx` | แสดงชื่อผู้ใช้ใน UI |
| `src/app/unauthorized/page.tsx` | Fallback page |
