# 🏢 Park Conscious

Welcome to **Park Conscious**, a smart parking and event management platform designed for modern Indian cities. This project integrates AI-powered parking allocation, secure event ticketing, and a comprehensive admin ecosystem.

---

## 📂 Project Structure

The project is organized into a modular structure to improve maintainability and scalability.

```text
├── apps/               # Buildable Frontend Applications
│   ├── events/         # Customer Events Portal (events.parkconscious.in)
│   └── admin/          # Internal Management Panel (admin.events.parkconscious.in)
├── web/                # Main Landing Page & Static Content
│   ├── assets/         # Images and Multimedia
│   ├── scripts/        # Vanilla JS logic
│   ├── styles/         # CSS and Tailwind configurations
│   ├── owner/          # Owner-specific static pages
│   └── *.html          # Main landing pages (index, about, etc.)
├── api/                # Vercel Serverless Functions (Backend Core)
│   ├── auth.js         # JWT Authentication & OAuth
│   ├── events.js       # Event & Discussion logic
│   ├── pay.js          # Payment Gateway (PhonePe/Razorpay)
│   └── admin.js        # Admin operations
├── services/           # Backend Logic and Core AI
│   ├── core/           # Processing modules (Plates, Scanning, Allocation)
│   ├── backend/        # Legacy/Development Express Server
│   └── data/           # Database schemas and static data
├── package.json        # Global dependencies and Workspace configuration
└── vercel.json         # Production Routing and Subdomain configuration
```

---

## 🚦 Getting Started

### Prerequisites
-   **Node.js**: v18 or later
-   **NPM**: v9 or later (supports workspaces)
-   **Python**: v3.10+ (for core AI services)

### Quick Start
1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Copy `.env.example` to `.env` and fill in your credentials.

3.  **Run Local Backend**:
    ```bash
    npm run dev:backend
    ```

4.  **Run Frontend Apps**:
    -   **Admin Panel**: `npm run dev:admin`
    -   **Events Portal**: `cd apps/events && npm start`

---

## 🚀 Deployment

The project is optimized for deployment on **Vercel**.

-   **Subdomain Routing**: Managed via `vercel.json`.
-   **Build Process**: The root `npm run build` command automatically gathers static files from `web/` and builds all workspaces into their respective production directories.

---

## 🛠 Tech Stack

-   **Frontend**: React (Apps), Vanilla HTML5/JS (Landing Page)
-   **Styling**: Tailwind CSS, AOS (Animations)
-   **Backend**: Node.js Serverless Functions
-   **AI Engine**: Python (Parking Allocation)
-   **Database**: MongoDB
-   **Payments**: PhonePe / Razorpay

---

## 📜 System Documentation

For a deep dive into the API architecture and data flow, please refer to:
- [SYSTEM_DOCUMENTATION.md](SYSTEM_DOCUMENTATION.md)
- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)

---

> [!TIP]
> **Pro-tip**: Use the `local-server.js` to simulate Vercel serverless functions locally while developing.
