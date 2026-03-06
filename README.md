# Stock Research Platform

Collaborative stock discovery and research platform for 2 users to research potential investments together.

**Live**: `stocks.srv1105540.hstgr.cloud`

## How It Works — Example Flow

Here's a typical workflow showing how 2 users (Harshil & Guest) research and make investment decisions together:

### Step 1: Create a Research Todo
Harshil creates a research task: **"Research AI chip companies for Q1 2026"** with priority `High`.
This goes on the Todos kanban board under "Pending".

### Step 2: Find & Add Sources
While researching, Harshil finds a great Nvidia earnings report article.
He creates a **Source**:
- Title: "Nvidia Q4 Earnings Beat Expectations"
- Type: Report
- URL: https://example.com/nvidia-q4
- Summary: "Revenue up 80% YoY, data center segment driving growth"
- Attaches the PDF earnings report via drag-and-drop upload

He then **links this source to the research todo** — now the todo shows what research materials were found.

### Step 3: Discover Stocks
From the research, Harshil discovers NVDA as a potential investment.
He creates a **Stock**:
- Ticker: NVDA
- Company: Nvidia Corporation
- Sector: Technology

He then **links the source to the stock** — the source now shows which stocks it mentions, and the stock shows which sources reference it.

### Step 4: Write Analysis
Both users write their own independent analysis on NVDA:
- **Thesis**: "AI infrastructure spending will continue growing for 3+ years"
- **Bull Case**: "Dominant market share in AI GPUs, strong moat"
- **Bear Case**: "Valuation is stretched, competition from AMD/custom chips"
- **Target Price**: "$180"
- **Notes**: Additional observations

Each user sees both analyses side-by-side on the Stock Detail page.

### Step 5: Discuss
Users add **comments** on the source, the stock, or the todo:
- On the source: "This report confirms datacenter revenue is accelerating"
- On the stock: "I think the bear case is overstated — their CUDA ecosystem is a huge moat"
- Comments support threaded replies

### Step 6: Make a Decision
After research and discussion, Harshil records a **Decision**:
- Decision: **Buy**
- Price at Decision: $145.50
- Rationale: "Strong fundamentals, reasonable entry point after pullback"

The stock card now shows a green "Buy" badge. All decisions are logged in a history timeline and visible on the Decisions page.

### Step 7: Update & Iterate
As new information comes in, users can:
- Update the todo status (Pending → In Progress → Done)
- Add more sources and link them to existing stocks
- Revise their analysis
- Change decisions (Buy → Hold → Sell) — each change is recorded in history

### Real-time Collaboration
Everything updates in real-time via WebSocket. When Harshil adds a source, Guest sees it appear instantly. When Guest writes an analysis, Harshil sees it immediately. No refresh needed.

---

## Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + Framer Motion v12 |
| **State** | TanStack Query v5 (server) + Zustand v5 (client) |
| **Routing** | React Router v7 |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | PostgreSQL 16 + Drizzle ORM |
| **Real-time** | Socket.io |
| **Auth** | JWT (access + refresh tokens) + bcrypt |
| **Deploy** | Docker (multi-stage) + Traefik + GitHub Actions |

## Pages

| Page | Description |
|------|-------------|
| **Dashboard** | Overview stats, recent activity, quick actions |
| **Todos** | Kanban board (Pending/In Progress/Done) + list view with filters |
| **Sources** | Card grid of research materials with type filters |
| **Source Detail** | Source info, attachments, linked stocks/todos, discussion |
| **Todos Detail** | Todo info, linked sources/stocks, discussion |
| **Stocks** | Card grid of discovered stocks with search/sector filters |
| **Stock Detail** | Analysis (per user), discussion, decisions tabs |
| **Decisions** | Table of all investment decisions across stocks |

## Key Features

- Dark/light theme with Apple-inspired UI
- Drag-and-drop file uploads (10MB max, type-validated)
- Real-time updates via WebSocket (no refresh needed)
- Threaded comments on sources, stocks, and todos
- Many-to-many linking (sources ↔ stocks, sources ↔ todos, todos ↔ stocks)
- Kanban drag-and-drop for todo status management
- Decision history timeline with rationale
- JWT auth with refresh token rotation (httpOnly cookies)

## Development

```bash
# Server
cd server && npm install && npm run dev

# Client (separate terminal)
cd client && npm install && npm run dev
```

Server runs on `http://localhost:3000`, client on `http://localhost:5173` (proxied to server).

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/dbname
STOCK_JWT_SECRET=<64-char-random-string>
JWT_EXPIRY=30m
USER1_USERNAME=harshil
USER1_PASSWORD=<password>
USER1_DISPLAY_NAME=Harshil
USER2_USERNAME=guest
USER2_PASSWORD=<password>
USER2_DISPLAY_NAME=Guest
UPLOAD_DIR=/app/uploads
MAX_UPLOAD_SIZE_MB=10
```

## Deploy

Push to `main` triggers GitHub Actions → SSH to VPS → `docker compose up --build` → run migrations → health check.
