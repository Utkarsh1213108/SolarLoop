import React from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { STATE_SOLAR_PROFILES } from '../../data/researchBaseline';
import { ForecastScenarioId } from '../../types';
import { Sparkles, HelpCircle, MapPin, Award } from 'lucide-react';

interface TopHeaderProps {
  currentTabName: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ currentTabName }) => {
  const { 
    selectedState, 
    setSelectedState, 
    activeScenario, 
    setActiveScenario,
    availableScenarios,
    unit, 
    setUnit,
    horizonYear,
    setHorizonYear,
    setIsIntelligenceOpen,
    setIsMethodologyOpen
  } = useScenario();

  return (
    <header className="h-14 border-b border-slate-200/90 bg-white px-6 flex items-center justify-between sticky top-0 z-20 select-none shadow-xs">
      {/* Zone 1: Brand & Context Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-slate-900 text-sm tracking-tight font-sans">
            SolarLoop
          </span>
          <span className="hidden lg:inline text-slate-400 text-xs font-normal">|</span>
          <span className="hidden lg:inline text-xs text-slate-600 font-medium tracking-tight">
            India Solar Panel Circularity Decision Engine
          </span>
        </div>
        <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-teal-800 bg-teal-50 border border-teal-200">
          <Award className="w-3 h-3 text-teal-700" />
          <span>Inter IIT Tech Meet 13.0</span>
        </span>
      </div>

      {/* Zone 2: Decision Controls (Scenario, Horizon, Geography, Units) */}
      <div className="flex items-center gap-2.5">
        {/* Scenario Selector Dropdown */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold hidden sm:inline">
            Scenario:
          </span>
          <select
            value={activeScenario}
            onChange={(e) => setActiveScenario(e.target.value as ForecastScenarioId)}
            className="bg-transparent font-medium text-slate-800 text-xs focus:outline-none cursor-pointer"
          >
            {availableScenarios.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Horizon Year Selector (2030, 2040, 2050) */}
        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-[11px] font-mono">
          {(['2030', '2040', '2050'] as const).map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHorizonYear(h)}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                horizonYear === h
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {h}
            </button>
          ))}
        </div>

        {/* Geography Dropdown */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
          <MapPin className="w-3 h-3 text-slate-400" />
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-transparent text-slate-800 text-xs font-medium focus:outline-none cursor-pointer"
          >
            <option value="ALL">All India (National)</option>
            {STATE_SOLAR_PROFILES.map((st) => (
              <option key={st.code} value={st.code}>
                {st.name} ({st.code})
              </option>
            ))}
          </select>
        </div>

        {/* Unit Toggle (kt / Mt) */}
        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setUnit('kt')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              unit === 'kt' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            kt
          </button>
          <button
            type="button"
            onClick={() => setUnit('Mt')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              unit === 'Mt' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Mt
          </button>
        </div>

        {/* Methodology */}
        <button
          type="button"
          onClick={() => setIsMethodologyOpen(true)}
          title="Methodology Register & Provenance"
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* Intelligence Modal */}
        <button
          type="button"
          onClick={() => setIsIntelligenceOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-teal-300" />
          <span className="hidden sm:inline">Ask Intelligence</span>
        </button>
      </div>
    </header>
  );
};
