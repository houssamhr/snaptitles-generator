// server.js (Node.js/Express Backend)

// 1. Import necessary libraries
require('dotenv').config(); // Loads environment variables from .env file
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

// 2. Initialize the Gemini AI Client
// It automatically looks for the GEMINI_API_KEY in environment variables
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not set in the environment variables.");
    process.exit(1);
}
const ai = new GoogleGenAI(apiKey);
const model = "gemini-2.5-flash"; // A fast and capable model for this task

// 3. Setup Express Server
const app = express();
const port = process.env.PORT || 3000; // Use port 3000 locally, or host's port

// Middleware
// Enable CORS for all origins, allowing your frontend to connect
app.use(cors());
// Parse JSON bodies from client requests
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
        
        console.log(`Generating titles for topic: ${topic} in ${language}`);

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0.8, // Higher temperature for creativity
            }
        });

        // Parse the text response from the AI
        const generatedText = response.text.trim();
        
        // Clean up and format the titles into an array
        const titles = generatedText
            .split('\n')
            .map(line => line.replace(/^\s*\d+\.\s*/, '').trim()) // Removes numbered list format (1. Title)
            .filter(title => title.length > 5); // Filters out very short or empty lines

        // 5. Send the structured JSON response back to the client
        res.json({
            titles: titles
        });

    } catch (error) {
        console.error('Gemini API Error:', error);
        // 6. Send a descriptive error response to prevent the client from getting HTML
        res.status(500).json({ 
            error: "Failed to generate titles due to a server or external API error.",
            details: error.message 
        });
    }
});

// Optional: Serve your index.html file for the root path
app.get('/', (req, res) => {
    // Assuming index.html is in the same directory as server.js
    res.sendFile(__dirname + '/index.html');
});

// 7. Start the server
app.listen(port, () => {
    console.log(`Snap Titles Generator backend running on port ${port}`);
});
