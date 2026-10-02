import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { 
  Leaf, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Info,
  CheckCircle2
} from 'lucide-react';

export const EnvironmentalImpactView: React.FC = () => {
  const { simulationResult, unit, askIntelligence } = useScenario();
  const [showMethodology, setShowMethodology] = useState(false);

  const impact = simulationResult.environmental;
  const unitDivider = unit === 'Mt' ? 1000 : 1;
  const unitLabel = unit === 'Mt' ? 'Mt' : 'kt';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Environmental Impact & Decarbonisation
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Life-cycle assessment (LCA) displacement metrics: secondary mineral reclamation, landfill diversion, and avoided embodied carbon.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DataProvenanceBadge tier="MODEL OUTPUT" sourceText="Displacement LCA Factors (1.85 tCO2e/t)" />
          <button
            type="button"
            onClick={() => askIntelligence('How is CO2e avoided calculated?')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>Explain Calculation</span>
          </button>
        </div>
      </div>

      {/* STEP 1: FIRST SHOW 3 PRIMARY METRICS (Section 14 & 19 Requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Material Recovered */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">Material Recovered</span>
            <span className="text-[10px] font-mono text-teal-800 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
              MODEL OUTPUT
            </span>
          </div>
          <div className="mt-2 text-3xl font-bold text-teal-900 font-mono tabular-nums">
            {(impact.totalMassRecoveredKt / unitDivider).toLocaleString()} {unitLabel}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Secondary glass cullet, Al, Cu, Si & Ag
          </div>
        </div>

        {/* Metric 2: Waste Diverted */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">Waste Diverted from Landfills</span>
            <span className="text-[10px] font-mono text-teal-800 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
              MODEL OUTPUT
            </span>
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {(impact.wasteDivertedFromLandfillKt / unitDivider).toLocaleString()} {unitLabel}
          </div>
          <div className="text-[11px] text-emerald-700 font-mono mt-1 font-medium">
            100% avoided informal dumping
          </div>
        </div>

        {/* Metric 3: CO2e Avoided */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-medium">CO2e Avoided (2047 Target)</span>
            <span className="text-[10px] font-mono text-amber-800 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              RESEARCH REFERENCE ESTIMATE
            </span>
          </div>
          <div className="mt-2 text-3xl font-bold text-emerald-800 font-mono tabular-nums">
            ~37 <span className="text-base font-normal font-sans text-slate-500">Mt CO2e</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            National Solar Dossier 2047 Benchmark
          </div>
        </div>
      </div>

      {/* STEP 2: "HOW WAS THIS CALCULATED?" (Section 19 Requirement) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowMethodology(!showMethodology)}
          className="w-full px-5 py-4 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-teal-700" />
            <span>How was this calculated? (Life-Cycle Assessment Factors)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 font-mono font-normal">
            <span>{showMethodology ? 'Hide Methodology' : 'Expand Calculation Formula'}</span>
            {showMethodology ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showMethodology && (
          <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] space-y-1">
              <div className="text-slate-500 font-sans font-medium">Displacement Formula:</div>
              <div className="text-slate-900 font-bold">
                CO2e_avoided = Total_Recovered_Mass (t) × 1.85 tCO2e/tonne
              </div>
              <div className="text-slate-500 font-sans text-[11px] pt-1">
                Derived from life-cycle inventory (LCI) databases for primary vs secondary material extraction in India:
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                <span className="font-semibold text-slate-900">Aluminium Frame Remelting</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Avoids ~11.5 tCO2e per tonne of aluminium by bypassing bauxite refining and bauxite mining (saves ~4 tonnes of raw bauxite per tonne Al).
                </p>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                <span className="font-semibold text-slate-900">Solar Float Glass Cullet</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Lowers furnace melting temperatures by 250°C and eliminates carbonate raw batch calcination emissions (saves ~1.1 tonnes of silica sand per tonne).
                </p>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                <span className="font-semibold text-slate-900">Silicon & Silver Reclaiming</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Circumvents trichlorosilane gas distillation and high-temperature Siemens reduction reactors for virgin polysilicon.
                </p>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono italic">
              Note: The 37 Mt figure is a research reference estimate from the India Solar PV Circularity Dossier. It is not an independently audited SolarLoop assurance.
            </div>
          </div>
        )}
      </div>

      {/* Hazardous Heavy Metal Safe Handling */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Hazardous Material Containment
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          Standard crystalline silicon modules contain ~12–15 grams of lead (Pb) in soldering ribbon plus antimony fining agents in glass. Decommissioning via certified circular pathways ensures safe handling of heavy metals in designated Treatment, Storage, and Disposal Facilities (TSDFs), preventing groundwater leaching.
        </p>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 flex justify-between items-center tabular-nums">
          <span>Hazardous Heavy Metals Safely Managed:</span>
          <span className="font-bold text-slate-900">{impact.hazardousHeavyMetalsSafelyHandledTonnes.toLocaleString()} tonnes</span>
        </div>
      </div>
    </div>
  );
};
