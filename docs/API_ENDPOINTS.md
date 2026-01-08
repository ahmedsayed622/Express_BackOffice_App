# 📚 دليل API Endpoints الكامل

## معلومات عامة

**Base URL:** `http://10.1.118.87:3000/api/v1`

**Content-Type:** `application/json`

**Response Format:** جميع الاستجابات بصيغة JSON

---

## 🏥 Health Check APIs

### 1. فحص اتصال قواعد البيانات

**Endpoint:** `GET /api/v1/health/integrations`

**الوصف:** يفحص حالة الاتصال بقواعد البيانات (Sequelize و OracleDB)

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/health/integrations
```

**الاستجابة الناجحة:**
```json
{
  "success": true,
  "data": {
    "sequelize": {
      "status": "connected",
      "pool": { "min": 2, "max": 10 }
    },
    "oracledb": {
      "status": "connected",
      "pool": { "min": 2, "max": 10 }
    }
  }
}
```

---

## 📊 Client Monthly Data APIs (CMP_DORMAN_TBL_MONTHLY_DATA)

### 1. عرض جميع البيانات الشهرية

**Endpoint:** `GET /api/v1/client-monthly-data`

**الوصف:** يسترجع جميع سجلات البيانات الشهرية للعملاء

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/client-monthly-data
```

**الاستجابة:**
```json
{
  "success": true,
  "data": [
    {
      "PROFILE_ID": "12345",
      "CLIENT_NAME_EN": "ABC Company",
      "UNIFIED_CODE": "UC001",
      "ANALYSIS_PERIOD_FROM": 202401,
      "ANALYSIS_PERIOD_TO": 202412,
      "ANALYSIS_MONTH": 12,
      "INACTIVITY_FROM_YEAR": 2024,
      "INACTIVITY_TO_YEAR": 2024
    }
  ]
}
```

---

### 2. عرض البيانات للسنوات >= 2025

**Endpoint:** `GET /api/v1/client-monthly-data/gte-2025`

**الوصف:** يسترجع البيانات للسنوات الأكبر من أو تساوي 2025

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/client-monthly-data/gte-2025
```

---

### 3. البحث في البيانات

**Endpoint:** `GET /api/v1/client-monthly-data/search?q={searchTerm}`

**الوصف:** يبحث في جميع حقول البيانات الشهرية

**Query Parameters:**
- `q` (required): كلمة البحث (1-200 حرف)

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/client-monthly-data/search?q=ABC
```

---

### 4. البيانات حسب السنة

**Endpoint:** `GET /api/v1/client-monthly-data/year/{year}`

**الوصف:** يسترجع البيانات لسنة محددة

**Path Parameters:**
- `year` (required): السنة (1900-2100)

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/client-monthly-data/year/2025
```

---

### 5. البيانات حسب السنة والشهر

**Endpoint:** `GET /api/v1/client-monthly-data/year/{year}/month/{month}`

**الوصف:** يسترجع البيانات لسنة وشهر محددين

**Path Parameters:**
- `year` (required): السنة (1900-2100)
- `month` (required): الشهر (1-12)

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/client-monthly-data/year/2025/month/9
```

---

### 6. البيانات حسب سنة عدم النشاط

**Endpoint:** `GET /api/v1/client-monthly-data/inact-year/{year}`

**الوصف:** يسترجع البيانات حسب سنة عدم النشاط

**Path Parameters:**
- `year` (required): سنة عدم النشاط (1900-2100)

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/client-monthly-data/inact-year/2024
```

---

### 7. البيانات حسب سنة وشهر عدم النشاط

**Endpoint:** `GET /api/v1/client-monthly-data/inact-year/{year}/month/{month}`

**الوصف:** يسترجع البيانات حسب سنة وشهر عدم النشاط

**Path Parameters:**
- `year` (required): سنة عدم النشاط (1900-2100)
- `month` (required): شهر عدم النشاط (1-12)

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/client-monthly-data/inact-year/2024/month/12
```

---

### 8. عرض سجل واحد بالـ ID

**Endpoint:** `GET /api/v1/client-monthly-data/{id}`

**الوصف:** يسترجع سجل واحد باستخدام PROFILE_ID

**Path Parameters:**
- `id` (required): معرّف العميل (PROFILE_ID)

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/client-monthly-data/12345
```

**استجابة 404 إذا لم يوجد السجل:**
```json
{
  "success": false,
  "code": "NOT_FOUND",
  "message": "Record not found"
}
```

---

## 🎛️ Client Control APIs (CMP_DORMAN_TBL_CLIENT_CONTROL)

### 1. عرض جميع سجلات التحكم

**Endpoint:** `GET /api/v1/client-control`

**الوصف:** يسترجع جميع سجلات التحكم بالعملاء

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/client-control
```

**الاستجابة:**
```json
{
  "success": true,
  "data": [
    {
      "ID": 1,
      "CLIENT_ID": "C001",
      "CONTROL_FLAG": "Y",
      "CREATED_DATE": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## 📈 Summary APIs (CMP_DORMAN_TBL_SUMMARY)

### 1. عرض جميع الملخصات

**Endpoint:** `GET /api/v1/summary`

**الوصف:** يسترجع جميع سجلات الملخصات من جدول SUMMARY

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/summary
```

---

### 2. أحدث ملخص لسنة محددة

**Endpoint:** `GET /api/v1/summary/latest/{year}`

**الوصف:** يسترجع أحدث ملخص لسنة محددة

**Path Parameters:**
- `year` (required): السنة (1900-2100)

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/summary/latest/2025
```

---

## 👁️ Summary View APIs (CMP_DORMAN_VIEW_SUMMARY)

### 1. عرض الملخصات من الـ View

**Endpoint:** `GET /api/v1/summary-view`

**الوصف:** يسترجع البيانات من View الملخصات (Read-only)

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/summary-view
```

---

## 📦 Employee Daily Orders APIs (CMP_EMP_TBL_DAILY_ORDERS)

### 1. عرض جميع الطلبات اليومية

**Endpoint:** `GET /api/v1/client-emp-daily-orders`

**الوصف:** يسترجع جميع الطلبات اليومية مع إمكانية الفلترة

**Query Parameters (اختيارية):**
- `execId`: معرّف التنفيذ
- `invoiceNo`: رقم الفاتورة
- `profileId`: معرّف العميل
- `stockId`: معرّف المخزون
- `from`: من تاريخ (YYYYMMDD)
- `to`: إلى تاريخ (YYYYMMDD)

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/client-emp-daily-orders?execId=EMP001&from=20250101
```

**الاستجابة:**
```json
{
  "success": true,
  "data": [
    {
      "profileId": 12345,
      "customerNameEn": "ABC Corporation",
      "invoiceDate": 20250925,
      "invoiceNo": 789012,
      "execId": "EMP001",
      "stockId": 67890,
      "qty": 100,
      "secondProfile": 54321
    }
  ]
}
```

---

### 2. الطلبات حسب رقم الفاتورة

**Endpoint:** `GET /api/v1/client-emp-daily-orders/invoice/{invoiceNo}`

**الوصف:** يسترجع جميع الطلبات لرقم فاتورة محدد

**Path Parameters:**
- `invoiceNo` (required): رقم الفاتورة

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/client-emp-daily-orders/invoice/789012
```

---

### 3. الطلبات حسب معرّف التنفيذ

**Endpoint:** `GET /api/v1/client-emp-daily-orders/exec/{execId}`

**الوصف:** يسترجع جميع الطلبات لمعرّف تنفيذ محدد

**Path Parameters:**
- `execId` (required): معرّف التنفيذ

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/client-emp-daily-orders/exec/EMP001
```

---

### 4. الطلبات في تاريخ محدد

**Endpoint:** `GET /api/v1/client-emp-daily-orders/date/{date}`

**الوصف:** يسترجع جميع الطلبات في تاريخ محدد بالضبط

**Path Parameters:**
- `date` (required): التاريخ بصيغة YYYYMMDD

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/client-emp-daily-orders/date/20250925
```

---

### 5. الطلبات من تاريخ محدد فصاعدًا

**Endpoint:** `GET /api/v1/client-emp-daily-orders/from/{from}`

**الوصف:** يسترجع جميع الطلبات من تاريخ محدد حتى الآن

**Path Parameters:**
- `from` (required): من تاريخ (YYYYMMDD)

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/client-emp-daily-orders/from/20250101
```

---

### 6. الطلبات في نطاق تاريخي

**Endpoint:** `GET /api/v1/client-emp-daily-orders/range?from={from}&to={to}`

**الوصف:** يسترجع جميع الطلبات في نطاق تاريخي محدد

**Query Parameters:**
- `from` (required): من تاريخ (YYYYMMDD)
- `to` (required): إلى تاريخ (YYYYMMDD)

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/client-emp-daily-orders/range?from=20250101&to=20251231
```

---

### 7. البحث في الطلبات

**Endpoint:** `GET /api/v1/client-emp-daily-orders/search?q={searchTerm}`

**الوصف:** يبحث في جميع حقول الطلبات اليومية

**Query Parameters:**
- `q` (required): كلمة البحث (1-200 حرف)

**مثال الطلب:**
```bash
GET http://10.1.118.87:3000/api/v1/client-emp-daily-orders/search?q=ACME
```

---

## ⚙️ Procedures APIs (Oracle Stored Procedures)

### 1. تشغيل Dormant Orchestrator

**Endpoint:** `POST /api/v1/procedures/dormant-orchestrator`

**الوصف:** يقوم بتشغيل إجراء Oracle المخزّن للتنسيق بين العمليات الخاصة بالعملاء غير النشطين

**Query Parameters (اختيارية):**
- `timeout`: وقت الانتظار بالثواني (0-3600)، القيمة الافتراضية: 0

**Body Parameters (اختيارية):**
- `timeout`: وقت الانتظار بالثواني (0-3600)

**مثال الطلب:**
```bash
POST http://10.1.118.87:3000/api/v1/procedures/dormant-orchestrator?timeout=0
```

**الاستجابة الناجحة:**
```json
{
  "success": true,
  "status": "COMPLETED",
  "code": "OK",
  "message": "Orchestrator completed successfully",
  "driver": "node-oracledb"
}
```

**استجابة خطأ - العملية قيد التشغيل (409):**
```json
{
  "success": false,
  "code": "ALREADY_RUNNING",
  "message": "A run is already in progress"
}
```

**استجابة خطأ - انتهاء وقت الانتظار (423):**
```json
{
  "success": false,
  "code": "TIMEOUT",
  "message": "Could not obtain lock within timeout"
}
```

---

## 🚨 رموز الأخطاء الشائعة

### 400 - خطأ في التحقق من البيانات
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "year",
      "message": "Year must be between 1900 and 2100"
    }
  ]
}
```

### 404 - المورد غير موجود
```json
{
  "success": false,
  "code": "NOT_FOUND",
  "message": "Resource not found"
}
```

### 409 - تعارض (عملية قيد التشغيل)
```json
{
  "success": false,
  "code": "ALREADY_RUNNING",
  "message": "A run is already in progress"
}
```

### 423 - مقفل (Locked)
```json
{
  "success": false,
  "code": "TIMEOUT",
  "message": "Could not obtain lock within timeout"
}
```

### 500 - خطأ في السيرفر
```json
{
  "success": false,
  "code": "INTERNAL_ERROR",
  "message": "Internal server error"
}
```

---

## 📋 قواعد التحقق من البيانات

| Parameter | Type | Range/Rules | Example |
|-----------|------|-------------|---------|
| year | Integer | 1900-2100 | 2025 |
| month | Integer | 1-12 | 9 |
| q (search) | String | 1-200 chars | "ABC" |
| timeout | Integer | 0-3600 seconds | 30 |
| date (YYYYMMDD) | String | 8 digits | "20250925" |
| invoiceNo | Integer | Positive | 789012 |
| execId | String | 1-200 chars | "EMP001" |

---

## 🔗 أمثلة cURL كاملة

```bash
# Health check
curl -X GET "http://10.1.118.87:3000/api/v1/health/integrations"

# Client monthly data - all
curl -X GET "http://10.1.118.87:3000/api/v1/client-monthly-data"

# Client monthly data - by year
curl -X GET "http://10.1.118.87:3000/api/v1/client-monthly-data/year/2025"

# Client monthly data - search
curl -X GET "http://10.1.118.87:3000/api/v1/client-monthly-data/search?q=ABC"

# Employee orders - by exec ID
curl -X GET "http://10.1.118.87:3000/api/v1/client-emp-daily-orders/exec/EMP001"

# Employee orders - date range
curl -X GET "http://10.1.118.87:3000/api/v1/client-emp-daily-orders/range?from=20250101&to=20251231"

# Run procedure
curl -X POST "http://10.1.118.87:3000/api/v1/procedures/dormant-orchestrator?timeout=0"
```

---

## 📝 ملاحظات مهمة

1. **جميع التواريخ** بصيغة `YYYYMMDD` (مثال: 20250925)
2. **جميع الاستجابات** تحتوي على `success: true/false`
3. **Query parameters** اختيارية ما لم يُذكر غير ذلك
4. **Path parameters** إلزامية دائمًا
5. **التحقق من البيانات** يتم تلقائيًا باستخدام `express-validator`
6. **الأخطاء** يتم إرجاعها بصيغة موحدة مع `code` و `message`

---

**آخر تحديث:** يناير 2026
