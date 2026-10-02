import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { calculate_processing_economics } from '../../models/coreCalculations';
import { WaterfallChart } from '../common/WaterfallChart';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { 
  Coins, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw,
  Sliders
} from 'lucide-react';

export const EconomicsView: React.FC = () => {
  const { 
    scenarioParams, 
    updateScenarioParam, 
    resetScenarioParams,
    askIntelligence
  } = useScenario();

  const [showDetailedEconomics, setShowDetailedEconomics] = useState(false);

  // Directly calculate economics using the centralized scenario configuration
  const outputs = calculate_processing_economics(scenarioParams);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Solar Recycling Economics
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Model-generated financial returns, processing margins, and reverse logistics break-even thresholds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DataProvenanceBadge tier="MODEL OUTPUT" sourceText="SolarLoop Economic Engine v2.4" />
          <button
            type="button"
            onClick={() => askIntelligence('What is driving the cost?')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>Explain Cost Drivers</span>
          </button>
        </div>
      </div>

      {/* STEP 1: FOUR CLEAN STATS (Section 9 Requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Potential Material Value */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Potential Material Value</div>
          <div className="mt-2 text-2xl font-bold text-emerald-800 font-mono tabular-nums">
            ₹{outputs.grossRecoveredValuePerTonneINR.toLocaleString()}
            <span className="text-xs font-sans font-normal text-slate-500"> / tonne</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Aluminium frames + Silver paste
          </div>
        </div>

        {/* Stat 2: Processing Cost */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Processing Cost</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ₹{outputs.processingCostPerTonneINR.toLocaleString()}
            <span className="text-xs font-sans font-normal text-slate-500"> / tonne</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1 capitalize">
            {scenarioParams.technologyPathway} Technology OPEX
          </div>
        </div>

        {/* Stat 3: Logistics Cost */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Logistics Cost</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ₹{outputs.logisticsCostPerTonneINR.toLocaleString()}
            <span className="text-xs font-sans font-normal text-slate-500"> / tonne</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            {scenarioParams.avgTransportDistanceKm} km avg haul distance
          </div>
        </div>

        {/* Stat 4: Net Economics */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Net Economics</div>
          <div className={`mt-2 text-2xl font-bold font-mono tabular-nums ${
            outputs.netMarginPerTonneINR >= 0 ? 'text-teal-900' : 'text-rose-700'
          }`}>
            ₹{outputs.netMarginPerTonneINR.toLocaleString()}
            <span className="text-xs font-sans font-normal text-slate-500"> / tonne</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Includes ₹{scenarioParams.eprFeePerTonneINR.toLocaleString()}/t EPR credit
          </div>
        </div>
      </div>

      {/* STEP 2: IS THE SCENARIO ECONOMICALLY ATTRACTIVE? (Section 9 Requirement) */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        outputs.isEconomicallyAttractive
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          : outputs.netMarginPerTonneINR > 0
          ? 'bg-amber-50/80 border-amber-200 text-amber-950'
          : 'bg-rose-50/80 border-rose-200 text-rose-950'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm">
            {outputs.isEconomicallyAttractive ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            )}
            <span>
              {outputs.isEconomicallyAttractive
                ? 'Yes — This scenario is economically attractive'
                : outputs.netMarginPerTonneINR > 0
                ? 'Marginally attractive — Modest infrastructure returns'
                : 'Deficit — Currently unviable without enhanced EPR support'}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
            {outputs.attractivenessReasoning}
          </p>
        </div>

        <button
          type="button"
          onClick={() => askIntelligence('What changes under an EPR scenario?')}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 shadow-xs shrink-0 cursor-pointer"
        >
          Explore EPR Sensitivity
        </button>
      </div>

      {/* Waterfall Visualization */}
      <WaterfallChart economics={outputs} />

      {/* STEP 3: ADVANCED USERS CAN EXPAND "VIEW DETAILED ECONOMICS" (Section 9 Requirement) */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setShowDetailedEconomics(!showDetailedEconomics)}
          className="w-full px-5 py-4 text-xs font-bold text-slate-800 hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-700" />
            <span>View Detailed Economics & Scenario Assumptions</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 font-mono font-normal">
            <span>{showDetailedEconomics ? 'Hide Assumptions' : 'Expand 7 Live Assumptions'}</span>
            {showDetailedEconomics ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showDetailedEconomics && (
          <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-5">
            {/* Plant Level Summary Numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono tabular-nums">
              <div>
                <span className="text-slate-400 text-[10px]">Break-Even Feedstock Price:</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  ₹{outputs.breakEvenFeedstockPricePerTonneINR.toLocaleString()}/t
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Annual Plant EBITDA:</span>
                <div className="text-sm font-bold text-teal-800 mt-0.5">
                  ₹{outputs.annualPlantEBITDA_INR_Cr} Cr / year
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">Project IRR (10y Amort):</span>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {outputs.projectIRRPct}%
                </div>
              </div>
            </div>

            {/* Live Interactive Assumption Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Silver Price */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Silver Price (₹/kg):</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{scenarioParams.silverPriceINR_per_kg.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="60000"
                  max="120000"
                  step="2000"
                  value={scenarioParams.silverPriceINR_per_kg}
                  onChange={(e) => updateScenarioParam('silverPriceINR_per_kg', Number(e.target.value))}
                  className="w-full accent-teal-700 cursor-pointer"
                />
              </div>

              {/* Aluminium Price */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Aluminium Frame (₹/kg):</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{scenarioParams.aluminiumPriceINR_per_kg}
                  </span>
                </div>
                <input
                  type="range"
                  min="160"
                  max="300"
                  step="5"
                  value={scenarioParams.aluminiumPriceINR_per_kg}
                  onChange={(e) => updateScenarioParam('aluminiumPriceINR_per_kg', Number(e.target.value))}
                  className="w-full accent-teal-700 cursor-pointer"
                />
              </div>

              {/* Haul Distance */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Haul Distance (km):</span>
                  <span className="font-mono font-bold text-slate-900">
                    {scenarioParams.avgTransportDistanceKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="600"
                  step="25"
                  value={scenarioParams.avgTransportDistanceKm}
                  onChange={(e) => updateScenarioParam('avgTransportDistanceKm', Number(e.target.value))}
                  className="w-full accent-teal-700 cursor-pointer"
                />
              </div>

              {/* EPR Fee Credit */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">EPR Credit (₹/t):</span>
                  <span className="font-mono font-bold text-teal-800">
                    ₹{scenarioParams.eprFeePerTonneINR.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="200"
                  value={scenarioParams.eprFeePerTonneINR}
                  onChange={(e) => updateScenarioParam('eprFeePerTonneINR', Number(e.target.value))}
                  className="w-full accent-teal-700 cursor-pointer"
                />
              </div>

              {/* Feedstock Cost */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Feedstock Cost (₹/t):</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{scenarioParams.feedstockCostPerTonneINR.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4000"
                  step="100"
                  value={scenarioParams.feedstockCostPerTonneINR}
                  onChange={(e) => updateScenarioParam('feedstockCostPerTonneINR', Number(e.target.value))}
                  className="w-full accent-teal-700 cursor-pointer"
                />
              </div>

              {/* Technology Selection */}
              <div className="space-y-1">
                <span className="text-slate-600 font-medium block">Recycling Technology:</span>
                <select
                  value={scenarioParams.technologyPathway}
                  onChange={(e) => updateScenarioParam('technologyPathway', e.target.value as any)}
                  className="w-full p-1.5 border border-slate-300 rounded bg-slate-50 text-xs font-medium"
                >
                  <option value="mechanical">Mechanical Delamination (OPEX: ₹4,200/t)</option>
                  <option value="thermal">Thermal Pyrolysis (OPEX: ₹7,800/t)</option>
                  <option value="chemical">Hydrometallurgical (OPEX: ₹9,600/t)</option>
                  <option value="hybrid">Hybrid Thermo-Mech (OPEX: ₹8,400/t)</option>
                </select>
              </div>

              {/* Plant Scale */}
              <div className="space-y-1">
                <span className="text-slate-600 font-medium block">Facility Capacity:</span>
                <select
                  value={scenarioParams.plantCapacityTonnesYr}
                  onChange={(e) => updateScenarioParam('plantCapacityTonnesYr', Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded bg-slate-50 text-xs font-mono font-medium"
                >
                  <option value={10000}>10,000 t/yr (Pilot)</option>
                  <option value={30000}>30,000 t/yr (Regional Hub)</option>
                  <option value={60000}>60,000 t/yr (Mega Hub)</option>
                </select>
              </div>

              {/* Reset Action */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetScenarioParams}
                  className="w-full py-2 px-3 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All to Baseline</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
