// server.js (Node.js/Express Backend using OpenAI)

// 1. Import necessary libraries
require('dotenv').config(); // Loads environment variables from .env file
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai'); // Use the official OpenAI library

// 2. Initialize the OpenAI Client
// It automatically looks for the OPENAI_API_KEY in environment variables
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.error("FATAL ERROR: OPENAI_API_KEY is not set in the environment variables.");
    process.exit(1);
}
// Client initialization
const openai = new OpenAI({ apiKey: apiKey }); 
const model = "gpt-3.5-turbo"; // A fast and capable model for this task

// 3. Setup Express Server
const app = express();
const port = process.env.PORT || 3000; 

// Middleware
app.use(cors());
app.use(express.json()); 

// 4. Define the API Endpoint
app.post('/generate-titles', async (req, res) => {
    try {
        const { topic, language, num_titles } = req.body;

        if (!topic) {
            return res.status(400).json({ error: "Missing required field: topic" });
        }

        // Construct a detailed prompt for the AI
        const prompt = `Generate exactly ${num_titles || 10} compelling, short, and clickbait-style titles for a Snapchat or TikTok video about the topic: "${topic}". The titles must be in the ${language || 'English'} language. Return the titles as a numbered list, one title per line.`;
        
        console.log(`Generating titles for topic: ${topic} in ${language} using ${model}`);

        // 5. OpenAI API Call (using Chat Completions)
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                {
                    role: "system",
                    content: "You are an expert social media content creator who specializes in generating clickbait titles for Snapchat and TikTok. Your output must be a clean, numbered list of titles only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.8, // Higher temperature for creativity
        });

        // 6. Parse the text response from the AI
        const generatedText = completion.choices[0].message.content.trim();
        
        // Clean up and format the titles into an array
        const titles = generatedText
            .split('\n')
            .map(line => line.replace(/^\s*\d+\.\s*/, '').trim()) // Removes numbered list format (1. Title)
            .filter(title => title.length > 5); // Filters out very short or empty lines

        // 7. Send the structured JSON response back to the client
        res.json({
            titles: titles
        });

    } catch (error) {
        console.error('OpenAI API Error:', error);
        // 8. Send a descriptive error response to the client
        res.status(500).json({ 
            error: "Could not connect to AI service. Check your API Key and Console.",
            details: error.message 
        });
    }
});

// Optional: Serve your index.html file for the root path
app.get('/', (req, res) => {
    // Assuming index.html is in the same directory as server.js
    res.sendFile(__dirname + '/index.html');
});

// 9. Start the server
app.listen(port, () => {
    console.log(`Snap Titles Generator backend running on port ${port}`);
});
