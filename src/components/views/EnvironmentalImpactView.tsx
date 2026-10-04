import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { PUBLISHED_EXTERNAL_CO2E_REFERENCE } from '../../models/coreCalculations';
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
  if (!simulationResult) {
  return (
    <div className="p-6 text-sm text-slate-500">
      Loading canonical scenario data...
    </div>
  );
}
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
          <DataProvenanceBadge tier="MODEL OUTPUT" sourceText="Canonical disposition; LCA factors unavailable" />
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
            Canonical recovered material
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-100">
            Co-processed: {impact.coProcessedMassKt.toLocaleString()} kt · Residual: {impact.residualMassKt.toLocaleString()} kt
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
            Recovered + co-processed mass; canonical disposition
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
            Published external reference: ~{PUBLISHED_EXTERNAL_CO2E_REFERENCE.valueMt} <span className="text-base font-normal font-sans text-slate-500">Mt CO2e</span>
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
                CO2e_avoided = Unavailable — evidence required
              </div>
              <div className="text-slate-500 font-sans text-[11px] pt-1">
                No defensible CO2e factor is present in the canonical dataset or validation register.
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                <span className="font-semibold text-slate-900">Aluminium Frame Remelting</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Unavailable — aluminium displacement factor requires evidence.
                </p>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                <span className="font-semibold text-slate-900">Solar Float Glass Cullet</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Unavailable — glass displacement and sand factor require evidence.
                </p>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                <span className="font-semibold text-slate-900">Silicon & Silver Reclaiming</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Unavailable — silicon and silver displacement factors require evidence.
                </p>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 font-mono italic">
              Published external reference: the {PUBLISHED_EXTERNAL_CO2E_REFERENCE.valueMt} Mt figure from the {PUBLISHED_EXTERNAL_CO2E_REFERENCE.source}; not a SolarLoop runtime calculation.
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
          Lead content and hazardous-metal mass are unavailable from the canonical material model. Certified decommissioning routes the canonical residual stream to designated Treatment, Storage, and Disposal Facilities (TSDFs); quantitative containment impact requires evidence.
        </p>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 flex justify-between items-center tabular-nums">
          <span>Hazardous Heavy Metals Safely Managed:</span>
          <span className="font-bold text-slate-900">Unavailable — evidence required</span>
        </div>
      </div>
    </div>
  );
};
