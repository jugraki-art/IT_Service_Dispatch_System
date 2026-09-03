# React + Nest.js + MySQL (XAMPP) Fullstack Application

A modern full-stack web application structure with **React** (Vite + TypeScript) on the frontend, **Nest.js** (TypeScript) on the backend, and **MySQL** (via XAMPP) as the relational database managed with **TypeORM**.

---

## 📁 Project Architecture & Directory Layout

```text
react-nest-project/
├── backend/                       # Nest.js Backend API
│   ├── src/
│   │   ├── items/                 # Sample CRUD Module (Entity, Controller, Service)
│   │   │   ├── dto/
│   │   │   │   └── create-item.dto.ts
│   │   │   ├── entities/
│   │   │   │   └── item.entity.ts # TypeORM Item entity mapping to MySQL
│   │   │   ├── items.controller.ts
│   │   │   ├── items.module.ts
│   │   │   └── items.service.ts
│   │   ├── app.controller.ts      # Health check endpoints
│   │   ├── app.module.ts          # TypeORM & ConfigModule setup
│   │   ├── app.service.ts
│   │   └── main.ts                # Server entry, CORS configuration
│   ├── .env                       # MySQL credentials & Port config
│   ├── .env.example
│   └── package.json
│
├── frontend/                      # React 19 Frontend (Vite + TS)
│   ├── src/
│   │   ├── services/
│   │   │   └── api.ts             # Axios API client for NestJS backend
│   │   ├── App.tsx                # Interactive Dashboard with Live MySQL Demo
│   │   ├── App.css
│   │   └── main.tsx
│   ├── vite.config.ts             # Vite config with dev proxy to :5000
│   └── package.json
│
├── package.json                   # Root scripts for running both projects together
└── README.md
```

---

## ⚙️ Prerequisites

1. **XAMPP**:
   - Ensure MySQL service is running (Port `3306`).
   - The database `react_nest_db` has been created automatically.
   - You can access phpMyAdmin at [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
2. **Node.js**:
   - Node.js v18+ (v24 detected) and npm.

---

## 🚀 Quick Start

### 1. Run Both Frontend and Backend Concurrently (Recommended)

From the root directory (`react-nest-project`):

```bash
npm run dev
```

This starts:
- **Backend**: [http://localhost:5000/api](http://localhost:5000/api)
- **Frontend**: [http://localhost:5173](http://localhost:5173)

---

### 2. Run Independently

#### Backend (Nest.js):
```bash
cd backend
npm run start:dev
```

#### Frontend (React):
```bash
cd frontend
npm run dev
```

---

## 🐬 Database Configuration (XAMPP MySQL)

Configuration is located in `backend/.env`:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=react_nest_db
```

TypeORM is configured with `synchronize: true` in development, automatically keeping your MySQL tables in sync with TypeORM entities without manual migrations.

---

## 📡 API Endpoints

All backend endpoints are prefixed with `/api`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status & MySQL connectivity check |
| `GET` | `/api/items` | Retrieve all items from MySQL |
| `POST` | `/api/items` | Create a new item in MySQL |
| `GET` | `/api/items/:id` | Get item by ID |
| `PATCH` | `/api/items/:id/toggle` | Toggle item completion status |
| `DELETE` | `/api/items/:id` | Delete an item from MySQL |
