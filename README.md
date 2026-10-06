# FinSaathi

**"Ask your money anything."**

FinSaathi is a premium personal financial intelligence platform. It acts as an AI-powered copilot, allowing users to understand their finances through natural language queries, beautiful dashboards, and deterministic financial calculations.

## Architecture

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Recharts, Zustand
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL
- **AI Service**: FastAPI, Python, LangGraph
- **Database**: PostgreSQL (hosted on Neon)

## Setup Instructions

### 1. Database (Neon)
The project uses Neon PostgreSQL. The database connection string should be provided in the `.env` file of the `backend` directory.

### 2. Backend
```bash
cd backend
npm install
# Set DATABASE_URL and JWT_SECRET in .env
npx prisma migrate dev
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. AI Service
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
# Set GROQ_API_KEY and DATABASE_URL in .env
uvicorn app.main:app --reload
```

## Features (Phase 1)
- React frontend shell
- Express backend with Prisma schema
- AI Service foundation
- Neon PostgreSQL connection

## Security
- User data is completely isolated.
- Passwords are hashed using bcrypt.
- JWT is used for authentication.
- API keys are managed via `.env` files. Never commit them!
