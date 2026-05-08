# 🏠 RentEase – House Rent Management Frontend

A professional React + Vite frontend for the RentEase House Rent Management System.
Built with **MUI v5**, **Redux Toolkit**, **React Toastify**, and **React Router v6**.

---

## 📁 Folder Structure

```
house-rent-frontend/
├── index.html
├── vite.config.js              # Proxy: /api → http://localhost:8000
├── package.json
└── src/
    ├── main.jsx                # App entry — Redux, Theme, Router, Toastify
    ├── App.jsx                 # All routes with PrivateRoute guards
    ├── api/
    │   ├── apiUrls.js          # API_URLS constants
    │   ├── axiosInstance.js    # Axios + JWT interceptors + auto-refresh
    │   └── actions.js          # All API call functions (getAPI, postAPI...)
    ├── context/
    │   └── UserContext.jsx     # isOwner / isTenant context
    ├── redux/
    │   ├── store.js
    │   └── slices/
    │       ├── authSlice.js    # Login / logout / token
    │       ├── houseSlice.js   # Houses list state
    │       ├── houseLogSlice.js
    │       └── uiSlice.js      # Modal open/close state
    ├── styles/
    │   └── theme.js            # MUI dark theme — red/yellow palette
    ├── pages/
    │   ├── LoginPage.jsx       # Login with demo buttons
    │   ├── DashboardPage.jsx   # Owner dashboard — stats + house cards
    │   ├── HousePage.jsx       # Houses CRUD table
    │   ├── HouseLogPage.jsx    # Rent logs CRUD with filter
    │   ├── TenantPage.jsx      # Tenant CRUD (owner only)
    │   └── TenantDashboard.jsx # Tenant view — own house + rent history
    └── components/
        ├── common/
        │   ├── Layout.jsx      # Sidebar + AppBar shell
        │   └── ConfirmDialog.jsx
        ├── house/
        │   └── HouseModal.jsx  # Add/Edit house modal
        └── houselog/
            └── HouseLogModal.jsx  # Add/Edit log with live bill calc
```

---

## 🚀 Setup Guide (Step by Step)

### 1. Prerequisites
- Node.js 18+ installed
- Django backend running on `http://localhost:8000`
- MySQL configured in Django

### 2. Install dependencies
```bash
cd house-rent-frontend
npm install
```

### 3. Start development server
```bash
npm run dev
```
App runs on **http://localhost:3000**
API calls proxy to **http://localhost:8000** automatically via Vite.

---

## 🔗 Backend API URLs Expected

| Endpoint           | Description             |
|--------------------|-------------------------|
| POST `/login/`     | JWT Login               |
| GET/POST `/house/` | House CRUD              |
| PUT/DELETE `/house/?id=` | House update/delete |
| GET/POST `/house-log/` | House Log CRUD      |
| PUT/DELETE `/house-log/?pk=` | Log update/delete |
| GET/POST `/user/`  | User/Tenant CRUD        |
| PUT/DELETE `/user/?id=` | User update/delete |
| POST `/token/refresh/` | JWT refresh        |

---

## 👤 Roles

| Role   | Access                                      |
|--------|---------------------------------------------|
| Owner  | Dashboard, Houses, Rent Logs, Tenants       |
| Tenant | Own house details + rent history only       |

Owner = `is_staff=True` or `is_superuser=True` in Django.

---

## ✨ Key Features

- 🔐 JWT Authentication with auto-refresh
- 🏠 Full CRUD for Houses, Rent Logs, Tenants
- ⚡ Live electricity bill calculation in modal
- 🔴🟡 Red & Yellow dark theme (MUI)
- 🔔 Toast notifications for all operations
- 📱 Responsive sidebar layout
- 🏗️ Redux state management
- 🧩 Reusable modal and confirm dialog components

---

## 🔧 Django Backend Requirements

Add to `urls.py`:
```python
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('login/', LoginView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),
    path('house/', HouseView.as_view()),
    path('house-log/', HouseLogView.as_view()),
    path('user/', UserView.as_view()),
]
```

Add to `settings.py`:
```python
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
INSTALLED_APPS += ['corsheaders']
MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware', ...rest]
```

Install: `pip install django-cors-headers`
