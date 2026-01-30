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

#### Backend Configuration
Create `Backend/.env` (copy from `Backend/.env.example`):

```
# Server configuration
PORT=5000
NODE_ENV=development

# AirVisual API Key (Required for real-time data)
# Get your free API key from: https://www.airvisual.com/api
AIRVISUAL_API_KEY=your-airvisual-api-key-here
AIRVISUAL_API_URL=https://api.airvisual.com/v2

# OpenAQ API Key (Optional, for backup data)
# Get your API key from: https://explore.openaq.org
OPENAQ_API_KEY=your-openaq-api-key-here
```

> **Note**: The application will work with static fallback data even without API keys, but real-time data requires valid API keys.

#### Frontend Configuration
Create `Frontend/.env` (copy from `Frontend/.env.example`):

```
VITE_API_BASE_URL=http://localhost:5000
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
