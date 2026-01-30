# Air Pollution & Health Impact Dashboard – India (SDG-3)

A web platform that converts air pollution data into clear health insights, aligned with UN Sustainable Development Goal 3 – Good Health & Well-Being.

## Quick Start

### 1. Install dependencies

```bash
# Backend
cd Backend && npm install

# Frontend
cd Frontend && npm install
```

### 2. Configure environment

Create `.env` in the project root (or copy from `.env.example`):

```
PORT=5000
NODE_ENV=development
OPENAQ_API_KEY=your_openaq_api_key
```

### 3. Run the app

**Terminal 1 – Backend:**
```bash
cd Backend && npm run dev
```

**Terminal 2 – Frontend:**
```bash
cd Frontend && npm run dev
```

- Backend: http://localhost:5000  
- Frontend: http://localhost:5173  

## Project Structure

- **Backend/** – Node.js/Express API
  - City validation, OpenAQ integration, health risk calculation
  - Disease mapping, chart data, heatmap, advisory generation
  - Caching for city data (12 min), heatmap (10 min)

- **Frontend/** – React + Vite + Tailwind
  - Location selector (State → City)
  - Dashboard: PM2.5/PM10, risk badge, disease cards, charts, heat map, advisory

## Color Palette

- `#09637E` – Primary
- `#088395` – Secondary
- `#7AB2B2` – Accent
- `#EBF4F6` – Background

## API Endpoints

- `POST /api/city` – Body: `{ city: "Nagpur" }` → Returns full dashboard data
- `GET /api/heatmap` – Returns India heatmap points
- `GET /api/health` – Health check
