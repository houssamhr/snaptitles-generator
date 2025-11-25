import express from "express";
import cors from "cors";
import "dotenv/config";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));   // your frontend folder

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post("/generate", async (req, res) => {
    try {
        const { topic } = req.body;

        const completion = await client.chat.completions.create({
            model: "gpt-4.1-mini",
            messages: [
                { role: "system", content: "You generate 10 catchy short video titles." },
                { role: "user", content: `Create 10 unique, engaging titles about: ${topic}` }
            ],
            max_tokens: 150
        });

        res.json({ titles: completion.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "AI request failed" });
    }
});

app.listen(process.env.PORT, () =>
    console.log(`Secure backend running at http://localhost:${process.env.PORT}`)
);
