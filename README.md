# 🎓 Certificate System - Frontend

A modern, feature-rich frontend for the Digital Certificate Management System built with React, TypeScript, and Material-UI.

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.x-007FFF?logo=mui)](https://mui.com/)

---

## 📋 สารบัญ

- [คุณสมบัติ](#-คุณสมบัติ)
- [เทคโนโลยีที่ใช้](#-เทคโนโลยีที่ใช้)
- [การเริ่มต้น](#-การเริ่มต้น)
- [โครงสร้างโปรเจค](#-โครงสร้างโปรเจค)
- [คำสั่งที่ใช้บ่อย](#-คำสั่งที่ใช้บ่อย)
- [Component หลัก](#-component-หลัก)
- [Routing](#-routing)
- [การเชื่อมต่อ API](#-การเชื่อมต่อ-api)

---

## ✨ คุณสมบัติ

### 🔐 การจัดการผู้ใช้และสิทธิ์
- รองรับ 4 บทบาท: Admin, Staff, Signer, Student
- ระบบ JWT Authentication
- Role-based Access Control (RBAC)
- รีเซ็ตรหัสผ่าน
- จัดการโปรไฟล์ส่วนตัว

### 📜 จัดการเกียรติบัตร
- CRUD เกียรติบัตร
- **สร้างเกียรติบัตรอัตโนมัติแบบ Wizard** ⚡
- Approval workflow (Draft → Pending → Approved → Published)
- ดาวน์โหลด PDF
- จัดการผู้รับเกียรติบัตร

### 🎨 Template Designer
- ออกแบบเทมเพลตแบบ Drag & drop
- จัดการ Layer
- **Asset Manager** - อัปโหลด/ลบรูปภาพ 🖼️
- ตัวอย่างเทมเพลต
- Template versioning

### 📊 Analytics & Reports
- Dashboard แบบ Real-time
- สถิติเกียรติบัตร
- สถิติการใช้งาน
- สถิติ Email campaign
- Export รายงาน (PDF, Excel, CSV)

### 📧 จัดการการส่งออก
- **Email Campaign Management** 📨
- ส่งอีเมลแบบ Bulk
- ติดตามสถานะการจัดส่ง
- ติดตาม Open rate / Click rate
- ควบคุม Campaign (Start, Pause, Stop, Retry)

### 📱 จัดการ QR Code
- **สร้าง/สร้างใหม่ QR Code**
- ดาวน์โหลดแบบเดี่ยวหรือ Bulk
- ติดตามการตรวจสอบ
- สถิติ QR Code

### 🔍 ฟีเจอร์เพิ่มเติม
- ค้นหาแบบละเอียด (Multi-criteria)
- กรองตามวันที่
- ตรวจสอบเกียรติบัตรแบบสาธารณะ
- ประวัติการตรวจสอบ
- **Audit Logs** (Admin only) 🔒
- File Manager

---

## 🛠️ เทคโนโลยีที่ใช้

### หลัก
- **React 18.x** - UI Library
- **TypeScript 5.x** - Type Safety
- **Vite** - Build Tool

### UI Framework
- **Material-UI (MUI) 5.x** - Component Library
- **@mui/x-date-pickers** - Date/Time Pickers
- **React Router 6.x** - Routing

### การจัดการฟอร์ม
- **React Hook Form** - Form Management
- **Yup** - Schema Validation

### การจัดการไฟล์
- **React Dropzone** - Drag & Drop Upload
- **File Saver** - Download Files

### HTTP Client
- **Axios** - API Requests

---

## 🚀 การเริ่มต้น

### ข้อกำหนด

- **Node.js** 18.x ขึ้นไป
- **npm** 9.x ขึ้นไป
- **Backend API** ทำงานอยู่ (ดู [API Documentation](../API/README.md))

### การติดตั้ง

```bash
# Clone repository
git clone https://github.com/yourusername/certificate-system.git
cd certificate-system

# ติดตั้ง dependencies
npm install

# Copy environment file
cp .env.example .env

# แก้ไข .env ให้ตรงกับ API URL
# REACT_APP_API_URL=http://localhost:8080/api/v1
```

### Environment Variables

สร้างไฟล์ `.env`:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8080/api/v1

# Environment
REACT_APP_ENV=development

# Session Timeout (milliseconds)
REACT_APP_SESSION_TIMEOUT=3600000
```

### รันโปรแกรม

```bash
# Development mode
npm run dev
# เปิดที่ http://localhost:5173

# Production build
npm run build

# ดูตัวอย่าง production build
npm run preview
```

---

## 📁 โครงสร้างโปรเจค

```
certificate-system/
├── src/
│   ├── components/          # Component ที่ใช้ซ้ำได้
│   │   ├── designer/        # Template designer (18 components)
│   │   ├── signer/          # Signer components (15 components)
│   │   ├── navigation/      # Sidebar, Menu
│   │   └── ...
│   │
│   ├── pages/               # หน้าต่างๆ (46 pages)
│   │   ├── CertificateGenerationPage.tsx     ⚡ ใหม่!
│   │   ├── DistributionManagementPage.tsx    📧 ใหม่!
│   │   ├── QRCodeManagementPage.tsx          📱 ใหม่!
│   │   ├── AuditLogPage.tsx                  🔒 ใหม่!
│   │   └── ...
│   │
│   ├── services/            # API Services (14 files)
│   │   ├── authService.ts
│   │   ├── certificateService.ts
│   │   ├── distributionService.ts    📧 ใหม่!
│   │   ├── qrCodeService.ts          📱 ใหม่!
│   │   ├── auditLogService.ts        🔒 ใหม่!
│   │   └── ...
│   │
│   ├── contexts/            # React Contexts
│   ├── hooks/               # Custom Hooks
│   ├── types/               # TypeScript Types
│   ├── utils/               # Utility Functions
│   └── App.tsx              # Main App
│
├── package.json
├── vite.config.ts
└── README.md
```

---

## 📜 คำสั่งที่ใช้บ่อย

```bash
# Development
npm run dev          # รัน dev server
npm run build        # Build production
npm run preview      # ดู production build

# Code Quality
npm run lint         # ตรวจสอบโค้ด
npm run format       # จัด format โค้ด

# Testing
npm run test         # รัน tests
```

---

## 🧩 Component หลัก

### 1. Template Designer
**ที่อยู่:** `src/components/designer/`

**คุณสมบัติ:**
- Drag & Drop elements
- จัดการ Layer แบบหลายชั้น
- แก้ไข Properties แบบ Real-time
- **Asset Manager** - อัปโหลดและจัดการรูปภาพ
- Font Picker
- Export เป็น JSON

### 2. Distribution Manager
**ที่อยู่:** `src/pages/DistributionManagementPage.tsx`

**คุณสมบัติ:**
- สร้าง Email Campaign
- ติดตามสถานะการส่ง
- Monitor Open/Click rates
- Pause/Resume campaigns
- Retry ที่ล้มเหลว
- Export รายงาน

### 3. Certificate Generation Wizard
**ที่อยู่:** `src/pages/CertificateGenerationPage.tsx`

**ขั้นตอน:**
1. เลือกกิจกรรม
2. เลือกเทมเพลต
3. เลือกผู้รับ
4. กำหนดค่า
5. ดูผลลัพธ์

### 4. QR Code Manager
**ที่อยู่:** `src/pages/QRCodeManagementPage.tsx`

**คุณสมบัติ:**
- สร้าง/สร้างใหม่ QR Code
- ดาวน์โหลดแบบ Bulk
- ติดตามการตรวจสอบ
- จัดการสถานะ
- ค้นหาและกรอง

### 5. Audit Log Viewer
**ที่อยู่:** `src/pages/AuditLogPage.tsx`

**คุณสมบัติ:**
- ดู Activity logs ทั้งหมด
- กรองตาม User/Action/Date
- Export logs
- ค้นหารายละเอียด

---

## 🛣️ Routing

### Public Routes
```
/                    # Landing page
/login               # เข้าสู่ระบบ
/verify/:code        # ตรวจสอบสาธารณะ
```

### Protected Routes

#### Admin (ผู้ดูแลระบบ)
```
/dashboard           # Dashboard
/users               # จัดการผู้ใช้
/audit-logs          # Audit Logs 🆕
/settings            # ตั้งค่าระบบ
+ เข้าถึงได้ทุก route
```

#### Staff (เจ้าหน้าที่)
```
/activities          # จัดการกิจกรรม
/certificates        # จัดการเกียรติบัตร
/certificates/generate # สร้างเกียรติบัตร 🆕
/templates           # จัดการเทมเพลต
/designer            # ออกแบบเทมเพลต
/distribution        # จัดการการส่งออก 🆕
/bulk-operations     # นำเข้า/ส่งออกข้อมูล
/qr-management       # จัดการ QR Code 🆕
/analytics           # รายงานและสถิติ
```

#### Signer (ผู้ลงนาม)
```
/signer/pending      # เอกสารรอลงนาม
/signer/signing/:id  # ลงนามเอกสาร
/signatures          # ลายเซ็นของฉัน
```

#### Student (นักศึกษา)
```
/certificates        # เกียรติบัตรของฉัน
/downloads           # ดาวน์โหลด
/verify              # ตรวจสอบเกียรติบัตร
```

---

## 🔌 การเชื่อมต่อ API

### API Client

```typescript
import apiClient from './services/apiClient';

// รวม JWT token อัตโนมัติ
const response = await apiClient.get('/certificates');
```

### Service Layer

```typescript
// Certificate Service
import certificateService from './services/certificateService';

const certificates = await certificateService.getCertificates();
```

### Services ที่มี

- `authService` - Authentication
- `certificateService` - เกียรติบัตร
- `templateService` - เทมเพลต
- `distributionService` - Email distribution 🆕
- `qrCodeService` - QR Code 🆕
- `auditLogService` - Audit Logs 🆕
- `analyticsService` - Analytics

---

## 📊 สถิติโปรเจค

- **หน้าทั้งหมด:** 46 pages
- **Components:** 100+ components
- **Services:** 14 services
- **Routes:** 48+ routes
- **ความสมบูรณ์:** 93%

---

## 🎯 สิ่งที่เพิ่มใหม่ (Recent Updates)

### ✅ หน้าใหม่ (4 หน้า)
1. **CertificateGenerationPage** - Wizard สร้างเกียรติบัตรอัตโนมัติ
2. **DistributionManagementPage** - จัดการ Email campaigns
3. **QRCodeManagementPage** - จัดการ QR Code
4. **AuditLogPage** - ดู System logs

### ✅ Services ใหม่ (3 files)
1. **distributionService.ts** - Email campaigns API
2. **qrCodeService.ts** - QR Code API
3. **auditLogService.ts** - Audit logs API

### ✅ Components ใหม่
1. **TemplateAssetManager** - จัดการ Assets ใน Template Designer

---

## 📚 เอกสารเพิ่มเติม

- **[Frontend Analysis](FRONTEND_ANALYSIS.md)** - การวิเคราะห์ครบถ้วน
- **[Improvements Summary](FRONTEND_IMPROVEMENTS_SUMMARY.md)** - สรุปการปรับปรุง
- **[API Documentation](../API/README.md)** - เอกสาร Backend API

---

## 🐛 การแก้ปัญหา

### ปัญหาที่พบบ่อย

#### 1. เชื่อมต่อ API ไม่ได้
```
Error: Network Error
```
**วิธีแก้:** ตรวจสอบว่า Backend API ทำงานอยู่และ `REACT_APP_API_URL` ถูกต้อง

#### 2. Authentication Error
```
Error: Unauthorized (401)
```
**วิธีแก้:** ล้าง localStorage แล้ว login ใหม่

#### 3. Build Error
```
Error: Module not found
```
**วิธีแก้:** ลบ `node_modules` แล้วรัน `npm install` ใหม่

---

## 📞 ติดต่อและสนับสนุน

- **Issues:** [GitHub Issues](https://github.com/yourusername/certificate-system/issues)
- **Documentation:** ดูในโฟลเดอร์ docs/
- **Email:** support@example.com

---

**สร้างด้วย ❤️ โดย Certificate System Team**

---

**เวอร์ชันปัจจุบัน:** 1.0.0
**อัพเดทล่าสุด:** 2 ตุลาคม 2568
**ความสมบูรณ์:** 93% ✅
