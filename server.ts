import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SolarLoop Intelligence Platform', timestamp: new Date().toISOString() });
});

// Canonical Data Source Endpoint
app.get('/api/canonical', (req, res) => {
  try {
    const canonicalPath = path.resolve(process.cwd(), 'canonical/solarloop_canonical_data.json');
    if (fs.existsSync(canonicalPath)) {
      const data = JSON.parse(fs.readFileSync(canonicalPath, 'utf-8'));
      return res.json(data);
    }
    return res.status(404).json({ error: 'Canonical data file not found at canonical/solarloop_canonical_data.json' });
  } catch (err: any) {
    console.error('Failed to read canonical data:', err);
    return res.status(500).json({ error: 'Failed to read canonical data', details: err.message });
  }
});

// Validation Register Endpoint
app.get('/api/validation-register', (req, res) => {
  try {
    const regPath = path.resolve(process.cwd(), 'canonical/validation_register.json');
    if (fs.existsSync(regPath)) {
      const data = JSON.parse(fs.readFileSync(regPath, 'utf-8'));
      return res.json(data);
    }
    return res.status(404).json({ error: 'Validation register not found' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to read validation register', details: err.message });
  }
});

// SolarLoop Intelligence Query Endpoint
app.post('/api/intelligence/query', async (req, res) => {
  const { question, context } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Question is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // Grounded context prompt builder
  const systemInstruction = `You are "SolarLoop Intelligence", an expert AI decision-support assistant embedded in SolarLoop, an industrial solar circularity intelligence platform for India.
You must adhere strictly to these rules:
1. Answer using ONLY verified platform data, deterministic model outputs, official research sources, and explicit model assumptions provided in the context.
2. If evidence is insufficient or data is not configured, state explicitly: "Insufficient data for a reliable conclusion."
3. Never fabricate statistics, policy rules, company information, market prices, recycling capacities, or forecasts.
4. Always cite the underlying source, model scenario, or assumption tag (e.g. [VERIFIED SOURCE: CEEW/Bridge to India/MNRE], [MODEL OUTPUT: SolarLoop Base Regular], [USER ASSUMPTION], [SCENARIO OUTPUT]).
5. Maintain a restrained, analytical, professional tone. Avoid buzzwords, fluff, or enthusiastic hype.
6. The case company INA Solar has 700+ verified channel partners, aluminium-frame manufacturing capability, planned TOPCon/cell manufacturing, and potential role in reverse logistics and closed-loop material recovery. Do NOT invent any additional INA data.`;

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // High-quality deterministic fallback response grounded in canonical data layer
    const qLower = question.toLowerCase();
    let responseText = '';
    let citations = ['CANONICAL SOURCE: solarloop_canonical_data.json / solar_waste_model_v2.py'];

    if (qLower.includes('accelerate') || qLower.includes('2040') || qLower.includes('why does waste')) {
      responseText = `Under the canonical IRENA/IEA-PVPS Weibull model (solar_waste_model_v2.py, alpha=5.3759, beta=30.0), waste acceleration after 2035-2040 is driven by the 25-30 year end-of-life wave from India's exponential solar capacity additions that began scaling from 2015 onwards.
Under Base·Regular:
- 2030: 75.93 kt annual waste (503.42 kt cumulative)
- 2040: 255.75 kt annual waste (2,007.39 kt cumulative)
- 2050: 1,220.53 kt annual waste (8,873.68 kt cumulative)
Under Base·Early (alpha=2.4928):
- 2030: 156.48 kt annual waste (838.53 kt cumulative)
- 2040: 675.12 kt annual waste (4,832.89 kt cumulative)
- 2050: 1,661.55 kt annual waste (16,768.25 kt cumulative)
In addition, commissioning scrap (transit and handling loss) contributes 2.3% of annual new installations (e.g. 66.7 kt in 2030 under Base).`;
      citations.push('CANONICAL MODEL: solar_waste_model_v2.py (FROZEN)');
    } else if (qLower.includes('capacity') || qLower.includes('infrastructure') || qLower.includes('driving')) {
      responseText = `National recycling capacity requirements in the canonical framework are based on standard 3,600 tpa plants (CEEW 2025):
- At 2030 Base·Regular annual waste of 75.93 kt/yr, India requires ~22 standard recycling plants (national capex ~₹316.8 Cr at ₹14.4 Cr/plant).
- The logistics architecture specifies a Hub-and-Spoke Regional Network with district spoke consolidation (stripping 74% glass and 10% aluminium locally) and regional hydromet chemical hubs, cutting baseline haul from 360 km (₹4,454/t) to 100 km, saving ~₹3,217/tonne.`;
      citations.push('CANONICAL LAYER: solarloop_canonical_data.json logistics_network');
    } else if (qLower.includes('economic') || qLower.includes('variable') || qLower.includes('largest effect') || qLower.includes('margin')) {
      responseText = `Canonical recycling economics benchmarks (per tonne, CEEW 2025 Exhibit 25):
1. Published CEEW Reference Case (Chemical Route): Net -₹12,341/t (Silver at ₹95.8/g, feedstock cost ₹600/module, no EPR).
2. Silver Re-Priced Team Case (Chemical Route): Net -₹5,938/t (Silver repriced to ₹240/g adds +₹6,403/t, but remains negative without policy support).
3. Hypothetical EPR Floor Case: Net +₹16,062/t (assumes ₹22/kg EPR certificate credit adds +₹22,000/t).
4. Published CEEW Mechanical Route: Net -₹10,200/t (lower OPEX, but 0% silver recovery).
Feedstock procurement (₹27,300/t at ₹600/module) and logistics are the primary cost burdens.`;
      citations.push('CANONICAL BENCHMARK: CEEW 2025 Exhibit 25');
    } else if (qLower.includes('epr') || qLower.includes('policy') || qLower.includes('changes under')) {
      responseText = `The canonical policy matrix (solarloop_canonical_data.json) outlines 5 key statutory interventions:
1. Solar EPR Targets & Certificates: Category CEEW14 mandatory recycling targets with an EPR floor of ₹22/kg (+₹22,000/t effect).
2. Bulk-Consumer Channelling Duty: Developers >1 MW surrender modules at zero cost, eliminating ₹600/module procurement costs (+₹27,300/t saving).
3. Material-Specific Recovery Mandates: 70% Ag, 80% Cu, 80% Si to prevent mechanical downcycling.
4. National Installed-Asset Registry: Extending ALMM/RFID digital traceability to district levels.
5. Pre-Funded Disposal Escrow: ₹0.3-0.5/W advance fee collected at commissioning.`;
      citations.push('CANONICAL POLICY: policy_matrix');
    } else {
      responseText = `Based on the SolarLoop Canonical Analytical Platform (v2.0-SolarLoop):
- Scenarios: Conservative·Regular, Conservative·Early, Base·Regular, Base·Early, High·Regular, High·Early.
- Base·Regular cumulative waste: 503.42 kt (2030), 2,007.39 kt (2040), 8,873.68 kt (2050).
- Base·Early cumulative waste: 838.53 kt (2030), 4,832.89 kt (2040), 16,768.25 kt (2050).
- Canonical mass baseline (CEEW 2025): Glass 74.2%, Polymer 11.3%, Aluminium 10.3%, Silicon 3.35%, Copper 0.57%, Silver 0.006% (60 g/t), Other 0.274%.
- 3 Disposition categories: Recovered material, Co-processing (113 kg/t polymer in cement kilns), Residual TSDF (~90 kg/t).`;
      citations.push('CANONICAL SOURCE: solarloop_canonical_data.json');
    }

    return res.json({
      answer: responseText,
      citations,
      mode: 'deterministic_grounded_engine',
      model: 'solarloop-expert-rules'
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const promptText = `User Question: "${question}"\n\nPlatform State & Context:\n${JSON.stringify(context, null, 2)}\n\nPlease provide a disciplined, concise, analytical answer addressing the user's inquiry. Always cite specific figures, sources, and scenarios from the context. If data is lacking, state "Insufficient data for a reliable conclusion."`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.2,
      }
    });

    const answer = response.text || 'Insufficient data for a reliable conclusion.';

    return res.json({
      answer,
      citations: [
        'MODEL OUTPUT: SolarLoop Base Scenario Engine',
        'VERIFIED SOURCE: Research Dossier on India Solar Asset Circularity',
        'SYSTEM: Gemini 3.8 Flash Grounded Inference'
      ],
      mode: 'llm_grounded',
      model: 'gemini-3.8-flash'
    });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return res.status(500).json({
      error: 'Intelligence engine temporarily unable to process request',
      fallbackAnswer: 'Under Base Regular, cumulative waste reaches 503 kt (2030), 2,007 kt (2040), and 8,874 kt (2050). Under Base Early-Loss, waste is 839 kt (2030), 4,833 kt (2040), and 16,768 kt (2050). Check network logs or API configuration.',
      citations: ['MODEL OUTPUT: SolarLoop Research Baseline']
    });
  }
});

// Mount Vite or static server
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SolarLoop server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
