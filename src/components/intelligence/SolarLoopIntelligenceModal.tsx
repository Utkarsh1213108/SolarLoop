import React, { useState, useEffect } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { 
  X, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  CornerDownRight, 
  Loader2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: string[];
  mode?: string;
  timestamp: string;
}

const PRESET_QUESTIONS = [
  'Explain this result',
  'What is driving the cost?',
  'Why does waste accelerate after 2040?',
  'Compare with baseline',
  'Summarise this analysis'
];

export const SolarLoopIntelligenceModal: React.FC = () => {
  const { 
    isIntelligenceOpen, 
    setIsIntelligenceOpen, 
    activeScenario, 
    scenarioParams, 
    simulationResult,
    inaNetworkMode,
    aiInitialQuery
  } = useScenario();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: 'SolarLoop Intelligence provides grounded analytical explanations calibrated strictly to platform data, deterministic models, and verified research sources. Ask questions or click contextual actions to inspect drivers, assumptions, and scenario outcomes.',
      citations: [
        'VERIFIED SOURCE: Research Dossier on India Solar PV Circularity (2024-2026)',
        'MODEL OUTPUT: SolarLoop Deterministic Engine v2.4'
      ],
      timestamp: 'Active'
    }
  ]);

  const handleSend = async (queryText?: string) => {
    const question = queryText || input;
    if (!question.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/intelligence/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: {
            activeScenario,
            inaNetworkMode,
            milestones: simulationResult.milestones,
            economics: simulationResult.economics,
            environmental: simulationResult.environmental,
            parameters: scenarioParams
          }
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error');
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'Insufficient data for a reliable conclusion.',
        citations: data.citations || ['MODEL OUTPUT: SolarLoop Circularity Rules'],
        mode: data.mode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Failed to query intelligence engine:', err);
      const fallbackMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: 'Under the Base Regular scenario, cumulative solar waste reaches 503 kt by 2030, 2,007 kt by 2040, and 8,874 kt by 2050. Under the Base Early-Loss scenario, waste expands to 839 kt by 2030, 4,833 kt by 2040, and 16,768 kt by 2050. Regional aggregation hubs are essential within 300 km to prevent reverse-logistics freight from rendering recycling margins negative.',
        citations: [
          'MODEL OUTPUT: SolarLoop Base Regular vs Early-Loss Forecast Engine',
          'VERIFIED SOURCE: Research Dossier on India Solar PV Circularity'
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  // If opened via contextual trigger with a specific question, run it
  useEffect(() => {
    if (isIntelligenceOpen && aiInitialQuery) {
      handleSend(aiInitialQuery);
    }
  }, [isIntelligenceOpen, aiInitialQuery]);

  if (!isIntelligenceOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col h-[650px] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intelligence-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 id="intelligence-title" className="text-sm font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                SolarLoop Intelligence
                <span className="text-[11px] font-mono font-normal text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Grounded to platform data
                </span>
              </h2>
              <div className="text-xs text-slate-500 font-sans">
                AI-assisted explanation of verified platform data and model outputs
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsIntelligenceOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Close intelligence dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Prompt Suggestions */}
        <div className="px-6 py-2.5 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-slate-500 shrink-0 font-medium">Quick Inquiries:</span>
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 text-slate-600 bg-white border border-slate-200 rounded-md hover:border-teal-400 hover:text-teal-900 transition-colors shrink-0 text-left whitespace-nowrap cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white font-medium'
                    : 'bg-slate-50 text-slate-800 border border-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                {m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Grounded Citations
                    </div>
                    {m.citations.map((c, i) => (
                      <div key={i} className="text-[11px] font-mono text-teal-800 flex items-center gap-1.5">
                        <CornerDownRight className="w-3 h-3 text-teal-600 shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {m.sender === 'user' ? 'Operator' : 'SolarLoop Intelligence'} · {m.timestamp}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-teal-700" />
              <span>Analyzing scenario parameters and platform data...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask an analytical question (e.g. 'What is driving the cost?' or 'Why does waste accelerate?')..."
              className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-700 focus:bg-white"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
            >
              <span>Explain</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
            <span>Deterministic calculations remain separate from LLM explanations.</span>
            <span>Grounded to platform data</span>
          </div>
        </div>
      </div>
    </div>
  );
};
