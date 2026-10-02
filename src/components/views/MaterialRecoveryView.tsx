import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { 
  REPRESENTATIVE_MODULE_COMPOSITION, 
  RECYCLING_PATHWAYS 
} from '../../data/researchBaseline';
import { 
  calculate_material_recovery, 
  calculate_recovered_material_value 
} from '../../models/coreCalculations';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { 
  Atom, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Layers,
  Cpu
} from 'lucide-react';

export const MaterialRecoveryView: React.FC = () => {
  const { scenarioParams, updateScenarioParam, askIntelligence } = useScenario();
  const [selectedPathway, setSelectedPathway] = useState<'mechanical' | 'thermal' | 'chemical' | 'hybrid'>(scenarioParams.technologyPathway || 'hybrid');
  const [activeElement, setActiveElement] = useState<string>('Aluminium');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Compute elemental recovery
  const referenceMassTonnes = 10000;
  const elementalRecovery = calculate_material_recovery(referenceMassTonnes, selectedPathway);
  const { totalGrossValuePerTonneINR, breakdown } = calculate_recovered_material_value(selectedPathway, scenarioParams);

  const currentPathwaySpec = RECYCLING_PATHWAYS.find(p => p.id === selectedPathway) || RECYCLING_PATHWAYS[3];
  const activeElementData = REPRESENTATIVE_MODULE_COMPOSITION.find(e => e.element === activeElement) || REPRESENTATIVE_MODULE_COMPOSITION[2];

  const handleSelectPathway = (id: 'mechanical' | 'thermal' | 'chemical' | 'hybrid') => {
    setSelectedPathway(id);
    updateScenarioParam('technologyPathway', id);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Material Recovery & Recycling Pathways
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Evaluate bill-of-materials reclamation yields, element-specific purity, and circular reprocessing loops.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DataProvenanceBadge tier="VERIFIED SOURCE" sourceText="Representative module composition used in model" />
          <button
            type="button"
            onClick={() => askIntelligence('Which variable has the largest effect on economics?')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>Explain Material Value</span>
          </button>
        </div>
      </div>

      {/* STEP 1: WHAT IS INSIDE A TYPICAL MODULE? (Section 10 Requirement) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              What is inside a typical module?
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Representative module composition used in the model. Does not imply universal module composition.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            Total Yield: ₹{totalGrossValuePerTonneINR.toLocaleString()}/t
          </span>
        </div>

        {/* 6 Core Material Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {REPRESENTATIVE_MODULE_COMPOSITION.map((m) => {
            const isSelected = activeElement === m.element;
            return (
              <div
                key={m.element}
                onClick={() => setActiveElement(m.element)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-teal-700 bg-teal-50/60 shadow-xs'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{m.element}</span>
                  <span className="text-[10px] font-mono font-bold text-teal-800">{m.percentageByMass}%</span>
                </div>
                <div className="text-[11px] font-mono text-slate-600 mt-1.5 tabular-nums">
                  {m.element === 'Silver' ? '1.32 g' : `${m.massPerModuleKg.toFixed(2)} kg`}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {m.circularPathway.split('/')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 2: TECHNOLOGY RECOMMENDATION & REASONING (Section 11 Requirement) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Technology Recommendation: {currentPathwaySpec.name}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Evaluates processing complexity, purity, CAPEX/OPEX, and mineral yields
            </p>
          </div>

          {/* Simple Pathway Switcher */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            {RECYCLING_PATHWAYS.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPathway(p.id)}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  selectedPathway === p.id ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Why? 3 Short Reasons (Section 11 Requirement) */}
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-teal-800 font-bold block mb-2">
            Why is this pathway recommended?
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1">
              <span className="font-semibold text-slate-900">1. Maximum Value Capture (Silver)</span>
              <p className="text-slate-600 leading-relaxed">
                Recovers {currentPathwaySpec.silverRecoveryRatePct}% of precious silver paste. Pure mechanical shredding loses &gt;80% of silver into glass tailings.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1">
              <span className="font-semibold text-slate-900">2. High-Purity Float Glass</span>
              <p className="text-slate-600 leading-relaxed">
                Prevents downcycling into road base. Produces clean cullet (&gt;98% purity) suitable for domestic solar float furnaces.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1">
              <span className="font-semibold text-slate-900">3. Closed-Loop Aluminium Extrusion</span>
              <p className="text-slate-600 leading-relaxed">
                Reclaims whole un-shredded 6000-series frames ready for immediate billet remelting (e.g. INA's in-house frame loop).
              </p>
            </div>
          </div>
        </div>

        {/* Trade-offs & Applicable Conditions */}
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs space-y-1">
          <div className="font-semibold text-amber-900">Engineering Trade-Offs:</div>
          <p className="text-slate-700 leading-relaxed">
            {currentPathwaySpec.tradeOffs}
          </p>
        </div>

        {/* Expandable Technical Details (Section 11 Requirement) */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>View Technical Details & Energy Intensity Metrics</span>
            {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showTechnicalDetails && (
            <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs font-mono text-[11px] tabular-nums">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">CAPEX per 10,000 t/yr:</span>
                <span className="font-bold text-slate-900">₹{currentPathwaySpec.capexPer10ktINR_Cr} Crores</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Operating OPEX:</span>
                <span className="font-bold text-slate-900">₹{currentPathwaySpec.opexPerTonneINR.toLocaleString()} / tonne</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Specific Energy Intensity:</span>
                <span className="font-bold text-slate-900">{currentPathwaySpec.energyIntensityMJ_per_kg} MJ / kg module</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-600">Silicon Recovery Purity:</span>
                <span className="font-bold text-teal-800">{currentPathwaySpec.siliconRecoveryPurity}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STEP 3: VISUAL CIRCULAR PATHWAYS & DOWN-CYCLE RISKS (Section 10 Requirement) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Elemental Recovery Yields (10,000 Tonne Reference Batch)
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Click any row to inspect circular economy destination
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Element</th>
                  <th className="py-2.5 px-3 text-right">Mass Share</th>
                  <th className="py-2.5 px-3 text-right">Recovery Rate</th>
                  <th className="py-2.5 px-3 text-right">Recovered Mass</th>
                  <th className="py-2.5 px-3 text-right">Gross Value / Tonne</th>
                  <th className="py-2.5 px-3">Circular Pathway</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {elementalRecovery.map((item) => {
                  const isSelected = activeElement === item.element;
                  const itemValue = breakdown.find(b => b.element === item.element)?.valuePerTonneINR || 0;
                  return (
                    <tr
                      key={item.element}
                      onClick={() => setActiveElement(item.element)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-teal-50/70 font-semibold' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-sans text-slate-900 font-medium">
                        {item.element}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600">{item.percentage}%</td>
                      <td className="py-2.5 px-3 text-right text-teal-800 font-bold">{item.efficiencyPct}%</td>
                      <td className="py-2.5 px-3 text-right text-slate-800">
                        {item.recoveredMassTonnes.toLocaleString()} t
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {itemValue >= 0 ? `₹${itemValue.toLocaleString()}` : `-₹${Math.abs(itemValue).toLocaleString()}`}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 text-[11px] truncate max-w-[150px]">
                        {item.pathway}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Element Circular Loop Card */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="pb-2 border-b border-slate-100">
            <span className="text-[10px] font-mono text-teal-700 font-semibold uppercase tracking-wider">
              Circular Economy Destination
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">{activeElementData.element} Reintroduction</h3>
            <div className="text-xs text-slate-500 font-mono">{activeElementData.label}</div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
              <span className="font-semibold text-emerald-950 text-[11px] font-mono uppercase block">
                Target Closed-Loop:
              </span>
              <p className="text-slate-800 mt-1 leading-relaxed">
                {activeElementData.circularPathway}
              </p>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
              <span className="font-semibold text-rose-950 text-[11px] font-mono uppercase block">
                Downcycling / Contamination Risk:
              </span>
              <p className="text-slate-800 mt-1 leading-relaxed">
                {activeElementData.downcycleRisk}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
