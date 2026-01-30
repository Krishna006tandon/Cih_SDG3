import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import NodeCache from "node-cache";
import { cityDataRouter } from "./routes/cityData.js";
import { heatmapRouter } from "./routes/heatmap.js";

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

app.use("/api/city", cityDataRouter);
app.use("/api/heatmap", heatmapRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SDG-3 Air Pollution Dashboard API" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
