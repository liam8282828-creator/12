import { Router, type IRouter } from "express";
import ytSearch from "yt-search";
import { apiKeyAuth } from "../middlewares/auth.js";

const router: IRouter = Router();

router.post("/music/search", apiKeyAuth, async (req, res) => {
  const { query, limit = 5 } = req.body as { query?: string; limit?: number };
  if (!query) { res.status(400).json({ success: false, error: "Campo 'query' requerido" }); return; }
  try {
    const results = await ytSearch(query);
    res.json({ success: true, query, results: results.videos.slice(0, Math.min(limit, 10)).map((v) => ({ title: v.title, url: v.url, videoId: v.videoId, duration: v.duration.timestamp, views: v.views, thumbnail: v.thumbnail, author: v.author.name })) });
  } catch (e) { res.status(500).json({ success: false, error: e instanceof Error ? e.message : String(e) }); }
});

router.get("/music/search", apiKeyAuth, async (req, res) => {
  const query = req.query["q"] as string;
  if (!query) { res.status(400).json({ success: false, error: "Param 'q' requerido" }); return; }
  try {
    const results = await ytSearch(query);
    const top = results.videos[0];
    if (!top) { res.status(404).json({ success: false, error: "Sin resultados" }); return; }
    res.json({ success: true, query, result: { title: top.title, url: top.url, videoId: top.videoId, duration: top.duration.timestamp, views: top.views, thumbnail: top.thumbnail, author: top.author.name } });
  } catch (e) { res.status(500).json({ success: false, error: e instanceof Error ? e.message : String(e) }); }
});

export default router;
