import React from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { STATE_SOLAR_PROFILES } from '../../data/researchBaseline';
import { Sparkles, HelpCircle, MapPin, SlidersHorizontal, Bell } from 'lucide-react';

interface TopHeaderProps {
  currentTabName: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ currentTabName }) => {
  const { 
    selectedState, 
    setSelectedState, 
    activeScenario, 
    setActiveScenario,
    unit, 
    setUnit,
    setIsIntelligenceOpen,
    setIsMethodologyOpen
  } = useScenario();

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Zone 1: Contextual Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-sans">SolarLoop</span>
        <span className="text-slate-300 font-mono">/</span>
        <span className="font-semibold text-slate-900 font-sans tracking-tight">{currentTabName}</span>
        <span className="text-slate-300 font-mono">/</span>
        <span className="text-slate-500 font-mono text-[11px]">
          {activeScenario === 'base_regular' && 'Base Regular'}
          {activeScenario === 'base_early_loss' && 'Base Early-Loss'}
          {activeScenario === 'conservative_regular' && 'Conservative Regular'}
          {activeScenario === 'conservative_early_loss' && 'Conservative Early-Loss'}
          {activeScenario === 'custom_scenario' && 'Lab Simulation'}
        </span>
      </div>

      {/* Zone 2: Enterprise Filters (Geography & Units) */}
      <div className="hidden md:flex items-center gap-3">
        {/* Geography Dropdown */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
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

        {/* Unit Toggle */}
        <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50 text-[11px] font-mono">
          <button
            type="button"
            onClick={() => setUnit('kt')}
            className={`px-2 py-0.5 rounded transition-colors ${
              unit === 'kt' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500'
            }`}
          >
            kt
          </button>
          <button
            type="button"
            onClick={() => setUnit('Mt')}
            className={`px-2 py-0.5 rounded transition-colors ${
              unit === 'Mt' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500'
            }`}
          >
            Mt
          </button>
        </div>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2.5">
        {/* Ask SolarLoop Intelligence */}
        <button
          type="button"
          onClick={() => setIsIntelligenceOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-teal-900 hover:bg-teal-800 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-300" />
          <span>SolarLoop Intelligence</span>
        </button>

        {/* Methodology Trigger */}
        <button
          type="button"
          onClick={() => setIsMethodologyOpen(true)}
          title="Methodology and Source Provenance"
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
