import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import NodeCache from "node-cache";
import { cityDataRouter } from "./routes/cityData.js";
import { heatmapRouter } from "./routes/heatmap.js";
import { healthRiskRouter } from "./routes/healthRisk.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Cache: city data 10-15 min, chart 1hr, heatmap 10 min
const cityCache = new NodeCache({ stdTTL: 12 * 60 }); // 12 min
const heatmapCache = new NodeCache({ stdTTL: 10 * 60 }); // 10 min

app.use(cors());
app.use(express.json());

// Attach caches for routes
app.use((req, res, next) => {
  req.cityCache = cityCache;
  req.heatmapCache = heatmapCache;
  next();
});

// API Routes
app.use("/api/city", cityDataRouter);
app.use("/api/heatmap", heatmapRouter);
app.use("/api/health-risk", healthRiskRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SDG-3 Air Pollution Dashboard API" });
});

// API Documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    name: "SDG-3 Air Quality & Health Dashboard API",
    version: "1.0.0",
    description: "Urban Planner API for air quality impact on respiratory diseases",
    endpoints: {
      health: {
        path: "/api/health",
        method: "GET",
        description: "API health check"
      },
      cityData: {
        path: "/api/city",
        method: "POST",
        body: { city: "string" },
        description: "Get detailed air quality and health data for a specific city"
      },
      heatmap: {
        path: "/api/heatmap",
        method: "GET",
        query: { state: "optional - filter by Indian state" },
        description: "Get heatmap data for all cities or filtered by state",
        example: "/api/heatmap?state=Maharashtra"
      },
      heatmapStates: {
        path: "/api/heatmap/states",
        method: "GET",
        description: "Get list of available states for filtering"
      },
      healthRisk: {
        path: "/api/health-risk",
        method: "GET",
        query: { city: "required - city name" },
        description: "Get comprehensive health risk assessment for a city",
        example: "/api/health-risk?city=Delhi"
      },
      healthRiskSummary: {
        path: "/api/health-risk/summary",
        method: "GET",
        description: "Get health risk summary for all cities"
      }
    },
    sdgAlignment: "SDG-3: Good Health and Well-Being",
    dataRefresh: "Every 5 minutes"
  });
});

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  SDG-3 Air Quality Dashboard API`);
  console.log(`========================================`);
  console.log(`  Server:    http://localhost:${PORT}`);
  console.log(`  API Docs:  http://localhost:${PORT}/api`);
  console.log(`  Health:    http://localhost:${PORT}/api/health`);
  console.log(`========================================\n`);
});
