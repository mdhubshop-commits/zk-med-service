# ZK-Med Portal

A secure, decentralized zero-knowledge medical verification platform built for high-end cryptographic data privacy. This application enables individuals to generate client-side zk-proofs regarding their health or vaccination statuses without revealing sensitive underlying health data or identity profiles.

---

## 🛠️ Tech Stack

- **Frontend:** React / Next.js (App Router), Tailwind CSS
- **Backend Logics:** Node.js / Express
- **ZK Cryptography:** Noir (Zero-Knowledge Circuits)

---

## 📁 Repository Structure

```text
zk-med-service/
├── backend/            # Node.js & Express API server logic
│   ├── server.js       # Main server entrypoint
│   └── package.json
├── circuits/           # Noir ZK circuit configurations (Kingnana's workspace)
└── frontend/           # Next.js client interface
    ├── src/app/        # Core layout & component dashboard viewports
    └── package.json

---

## 🚀 Run Locally

### Prerequisites
- Node.js 18 or later
- npm (bundled with Node.js)

### 1. Install dependencies
From the repository root run:

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 2. Start the backend server
In a terminal:

```bash
cd backend
npm run dev
```

### 3. Start the frontend app
In a second terminal:

```bash
cd frontend
npm run dev
```

### 4. Open the app
Visit:

```text
http://localhost:3000
```

### Notes for judges
- If the app does not open automatically, refresh the browser after both servers are running.
- If port `3000` is already in use, stop the conflicting process or change the frontend port by setting `PORT=3001` before `npm run dev`.
- The document type dropdown is styled for a dark interface and should appear as part of the main portal form.

If you want, I can also add a brief section for the proof generation flow and how to use the upload form.