
import express from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/generate', async (req,res)=>{
    const { topic } = req.body;
    if(!topic) return res.status(400).json({ error: 'No topic provided' });
    try{
        const response = await openai.chat.completions.create({
            model:'gpt-3.5-turbo',
            messages:[
                { role:'system', content:'Generate 10 short catchy Snapchat video titles.' },
                { role:'user', content: `Topic: ${topic}` }
            ],
            max_tokens: 200
        });
        const titles = response.choices[0].message.content.split('\n').filter(Boolean);
        res.json({ titles });
    }catch(err){
        console.error(err);
        res.status(500).json({ error:'AI generation failed' });
    }
});

app.listen(port, ()=>console.log(`Server running at http://localhost:${port}`));
