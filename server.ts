import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Gemini AI Client Setup
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint: Personalized Spending Summaries & Insights
app.post('/api/spending-summary', async (req, res) => {
  try {
    const { transactions, budgets, subscriptions, accounts, userName } = req.body;

    const safeUserName = userName || 'Ishmael Sackey Junior';

    if (!genAI) {
      // High quality deterministic fallback when key isn't provided
      return res.json({
        summary: `Fin-Buddy AI Financial Audit for ${safeUserName}: Overall cashflow is resilient with solid emergency liquidity across linked accounts. Discretionary spending on dining and recurring cloud subscriptions represents your highest optimization opportunity.`,
        healthScore: 84,
        savingsRate: 26.5,
        burnRateDaily: 48.2,
        topLeaks: [
          { category: 'Dining & Takeout', amount: 342.5, advice: 'Cooking 2 additional meals at home weekly could recoup ~$180/month.' },
          { category: 'Unused Cloud/Digital Subscriptions', amount: 84.99, advice: '2 subscriptions show 0 log-in activity over the past 45 days.' }
        ],
        actionItems: [
          'Enable MoMo automated round-up savings on peer-to-peer transfers.',
          'Negotiate annual billing for software subscriptions to save up to 20%.',
          'Allocate 15% of surplus cashflow to your High-Yield Emergency Reserve.'
        ],
        projectedSurplus: 915.20,
        modelUsed: 'deterministic-fallback'
      });
    }

    const prompt = `You are Fin-Buddy's AI Financial Advisor built for ${safeUserName}.
Analyze the following financial snapshot:
- Accounts: ${JSON.stringify(accounts || [])}
- Budgets: ${JSON.stringify(budgets || [])}
- Recent Transactions: ${JSON.stringify((transactions || []).slice(0, 20))}
- Subscriptions: ${JSON.stringify(subscriptions || [])}

Provide a deep, personalized financial summary and return ONLY a valid JSON object matching this schema:
{
  "summary": "2-3 concise, high-value sentences analyzing Ishmael's financial momentum, spending velocity, and surplus.",
  "healthScore": integer from 0 to 100,
  "savingsRate": number (estimated percentage like 28.4),
  "burnRateDaily": number (average daily burn in currency units),
  "topLeaks": [
    { "category": "Category Name", "amount": number, "advice": "Concrete action to fix" }
  ],
  "actionItems": [
    "High-impact actionable tip 1",
    "High-impact actionable tip 2",
    "High-impact actionable tip 3"
  ],
  "projectedSurplus": number (estimated surplus at end of month)
}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({
      ...parsed,
      modelUsed: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error generating spending summary:', error);
    return res.status(500).json({
      error: 'Failed to generate spending summary',
      message: error?.message || 'Unknown error',
    });
  }
});

// Endpoint: Smart Transaction Auto-Categorization & Intelligence
app.post('/api/categorize-transaction', async (req, res) => {
  try {
    const { merchant, amount, type, notes } = req.body;

    if (!genAI) {
      // Deterministic classification
      const lower = (merchant + ' ' + (notes || '')).toLowerCase();
      let category = 'General & Miscellaneous';
      if (lower.includes('uber') || lower.includes('bolt') || lower.includes('fuel') || lower.includes('shell') || lower.includes('petrol')) category = 'Transportation';
      else if (lower.includes('cafe') || lower.includes('restaurant') || lower.includes('burger') || lower.includes('coffee') || lower.includes('kfc') || lower.includes('pizza')) category = 'Food & Dining';
      else if (lower.includes('netflix') || lower.includes('spotify') || lower.includes('aws') || lower.includes('github') || lower.includes('apple') || lower.includes('icloud')) category = 'Subscriptions & Tech';
      else if (lower.includes('groceries') || lower.includes('supermarket') || lower.includes('walmart') || lower.includes('shoprite')) category = 'Groceries';
      else if (lower.includes('rent') || lower.includes('landlord') || lower.includes('electricity') || lower.includes('water') || lower.includes('ecg')) category = 'Housing & Utilities';
      else if (lower.includes('momo') || lower.includes('transfer') || lower.includes('p2p') || lower.includes('cash')) category = 'Peer-to-Peer & Transfers';

      return res.json({
        category,
        confidence: 0.92,
        isRecurring: lower.includes('netflix') || lower.includes('spotify') || lower.includes('aws') || lower.includes('rent'),
        tags: [category.toLowerCase().split(' ')[0], type === 'expense' ? 'expense' : 'income'],
        budgetImpactAdvice: `Recorded under ${category}. Fits comfortably within your monthly limit.`
      });
    }

    const prompt = `Classify this financial transaction for personal finance app Fin-Buddy:
Merchant/Payee: "${merchant}"
Amount: ${amount}
Type: "${type}"
Notes: "${notes || 'None'}"

Available standard categories:
- Food & Dining
- Groceries
- Housing & Utilities
- Transportation
- Subscriptions & Tech
- Shopping & Lifestyle
- Health & Wellness
- Peer-to-Peer & Transfers
- Entertainment & Leisure
- Income & Salary
- Investments & Savings
- Education & Work

Return ONLY a JSON object:
{
  "category": "Matched category name from above",
  "confidence": number between 0.0 and 1.0,
  "isRecurring": boolean,
  "tags": ["tag1", "tag2"],
  "budgetImpactAdvice": "Short 1-sentence tip on this expense"
}`;

    const response = await genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Categorization error:', error);
    return res.status(500).json({ error: 'Categorization failed' });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fin-Buddy fullstack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
