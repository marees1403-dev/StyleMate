import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '1mb' }));

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

app.get('/api/health', (_req, res) => {
  const ai = getGeminiClient();
  res.json({
    ok: true,
    aiConfigured: Boolean(ai),
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/stylist/chat', async (req, res) => {
  const { message, bagItems = [], audience = 'women', aesthetics = [], history = [] } = req.body ?? {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'A styling question is required.' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured in environment secrets.',
      code: 'AI_UNAVAILABLE',
    });
  }

  try {
    const bagSummary =
      Array.isArray(bagItems) && bagItems.length > 0
        ? bagItems
            .map((item: { title?: string; color?: string; size?: string }) => `${item.title ?? 'Item'} (${item.color ?? 'Pastel'}, Size ${item.size ?? 'S'})`)
            .join(', ')
        : 'Empty bag';

    const historyText = Array.isArray(history)
      ? history
          .slice(-6)
          .map((m: { role?: string; text?: string }) => `${m.role === 'user' ? 'Shopper' : 'StyleMate'}: ${m.text ?? ''}`)
          .join('\n')
      : '';

    const systemInstruction = `You are StyleMate AI, a warm, upbeat, fashion-savvy personal stylist for a pastel & dollcore family fashion boutique (Women, Men, Kids, Family Matching Capsules).
Keep responses concise (2-4 short sentences), practical, and tailored to the shopper's bag and preferred aesthetics.
Catalog highlights you can recommend:
- Lavender Cloud Soft Cardigan & Blouse Set ($48, Lilac Blossom)
- Blush Pleated Wide-Leg Trousers ($52, Soft Blush)
- Pastel Chunky Sneakers ($62-$64, Lilac Mist)
- Quilted Heart Crossbody Bag ($34, Cream Pearl)
- Soft Cloud Puffer Tote ($38)
- Ruffle Mini Sundress ($34, Kids)
- Lilac Pinafore Overall ($38, Kids)
- Kids Bunny Twinning Romper (Out of stock / Waitlist)
- Daisy Knit Vest ($38)
- Cloud Puff Hoodie ($52)
- Cord Overshirt ($59, Lilac)
- Pearl Ribbon Duo ($12)
Current shopper focus: ${audience}. Preferred aesthetics: ${Array.isArray(aesthetics) && aesthetics.length ? aesthetics.join(', ') : 'Soft Pastel, Cozy Knits'}.
Current shopping bag: ${bagSummary}.`;

    const prompt = historyText
      ? `${historyText}\nShopper: ${message}\nStyleMate:`
      : `Shopper: ${message}`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text?.trim();
    if (!reply) {
      return res.status(502).json({ error: 'Empty response from AI stylist.' });
    }

    return res.json({ reply, model: 'gemini-4-hydrogen' });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to reach AI stylist.';
    console.error('Stylist chat error:', errorMessage);
    return res.status(500).json({ error: errorMessage });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StyleMate AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
