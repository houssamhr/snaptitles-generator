// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
const port = process.env.PORT || 5173;
const CLIENT_SECRET = process.env.CLIENT_SECRET || "";

app.use(cors());
app.use(bodyParser.json());

if (!process.env.OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/api/generate", async (req, res) => {
  try {
    if (CLIENT_SECRET) {
      const incoming = req.headers["x-client-secret"] || req.body.clientSecret;
      if (!incoming || incoming !== CLIENT_SECRET)
        return res.status(401).json({ error: "Unauthorized" });
    }
    const { topic, lang } = req.body;
    if (!topic) return res.status(400).json({ error: "Missing topic" });

    const prompt = `Give exactly 10 catchy titles about: ${topic} in ${lang || "en"}`;

    const resp = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      max_output_tokens: 300
    });

    let out = resp.output_text || "";
    const titles = out.split("\n").map(t=>t.trim()).filter(Boolean).slice(0,10);
    res.json({ titles });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.listen(port, () => console.log("Server on port", port));
