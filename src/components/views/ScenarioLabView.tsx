import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { TimeSeriesChart } from '../common/TimeSeriesChart';
import { 
  Play, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  TrendingUp, 
  Factory, 
  Coins,
  CheckCircle2
} from 'lucide-react';

export const ScenarioLabView: React.FC = () => {
  const { 
    canonicalData,
    activeScenario,
    setActiveScenario,
    availableScenarios,
    scenarioParams, 
    updateScenarioParam, 
    resetScenarioParams, 
    simulationResult, 
    runSimulation,
    unit,
    askIntelligence
  } = useScenario();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const unitDivider = unit === 'Mt' ? 1000 : 1;
  const unitLabel = unit === 'Mt' ? 'Mt' : 'kt';

  // Canonical Baseline reference values (Base·Regular scenario)
  const baseRegularData = canonicalData.forecast_outputs['Base·Regular'];
  const baseWaste2040Kt = baseRegularData.milestone_years['2040'].cumulative_waste_kt; // 2,007.39 kt
  const simWaste2040Kt = simulationResult.milestones.cumulative2040Kt;
  const wasteDeltaPct = Math.round(((simWaste2040Kt - baseWaste2040Kt) / baseWaste2040Kt) * 100);

  const baseCapacityReqKt = baseRegularData.milestone_years['2040'].annual_waste_kt; // 255.75 kt
  const simCapacityReqKt = simulationResult.infrastructure.requiredCapacity2040KtYr;
  const capacityDeltaPct = Math.round(((simCapacityReqKt - baseCapacityReqKt) / baseCapacityReqKt) * 100);

  const baseNetMargin = canonicalData.economics_reference.Silver_Repriced_Team_Case.net_inr_per_tonne; // -₹5,938/t
  const simNetMargin = simulationResult.economics.netMarginPerTonneINR;
  const marginDeltaPct = Math.round(((simNetMargin - baseNetMargin) / Math.abs(baseNetMargin)) * 100);

  // Generate plain English explanation of why the delta occurred
  const getWhyExplanation = () => {
    const reasons: string[] = [];
    if (activeScenario.includes('early_loss')) {
      reasons.push('Active early-loss failure distribution (α=2.49) brings forward decommissioning volumes by ~10–15 years.');
    } else if (activeScenario.includes('high')) {
      reasons.push('High capacity additions trajectory (60–80 GW/yr) accelerates future decommissioning volumes.');
    } else if (activeScenario.includes('conservative')) {
      reasons.push('Conservative additions trajectory (30 GW/yr) moderates future decommissioning volumes.');
    }

    if (scenarioParams.avgTransportDistanceKm > 300) {
      reasons.push(`Long logistics haul distance (${scenarioParams.avgTransportDistanceKm} km) increases freight costs, squeezing margins.`);
    } else if (scenarioParams.avgTransportDistanceKm <= 100) {
      reasons.push('Optimized spoke consolidation (100 km haul) lowers logistics overhead.');
    }

    if (scenarioParams.eprFeePerTonneINR > 0) {
      reasons.push(`Statutory EPR certificate credit (+₹${scenarioParams.eprFeePerTonneINR.toLocaleString()}/t) bolsters circularity bankability.`);
    }

    if (reasons.length === 0) {
      return 'Current parameters match the Base·Regular canonical baseline model.';
    }
    return reasons.join(' ');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Scenario Lab & Sensitivity Simulation
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Examine operational, logistics, and policy sensitivities grounded strictly on the six canonical IRENA/CEEW forecast trajectories.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetScenarioParams}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>
          <button
            type="button"
            onClick={runSimulation}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Analysis</span>
          </button>
        </div>
      </div>

      {/* Model Baseline Scenario Selector (Six Canonical Trajectories) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Model Foundation Trajectory (Six Canonical Scenarios)
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Select underlying additions path and Weibull failure curve (α=5.38 Regular vs α=2.49 Early-Loss).
            </p>
          </div>
          <DataProvenanceBadge tier="VERIFIED SOURCE" sourceText="solar_waste_model_v2.py (FROZEN)" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {availableScenarios.map((sc) => {
            const isSelected = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => setActiveScenario(sc.id)}
                className={`p-2.5 rounded-lg text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-50/80 border-teal-600 text-teal-950 ring-1 ring-teal-600'
                    : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="font-semibold text-xs flex items-center justify-between">
                  <span>{sc.name}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {sc.capacityPath.split(' ')[0]} · α={sc.alpha}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* BASELINE vs MY SCENARIO HEAD-TO-HEAD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Delta 1: Waste */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>2040 Cumulative Waste</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <div>
              <span className="text-xl font-bold text-slate-900">
                {(simWaste2040Kt / unitDivider).toLocaleString(undefined, { maximumFractionDigits: 1 })} {unitLabel}
              </span>
              <div className="text-[11px] text-slate-400">
                Base·Regular: {(baseWaste2040Kt / unitDivider).toLocaleString(undefined, { maximumFractionDigits: 1 })} {unitLabel}
              </div>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              wasteDeltaPct > 0 ? 'bg-teal-50 text-teal-800' : 'bg-slate-100 text-slate-700'
            }`}>
              {wasteDeltaPct >= 0 ? `+${wasteDeltaPct}%` : `${wasteDeltaPct}%`}
            </span>
          </div>
        </div>

        {/* Delta 2: Required Capacity */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>2040 Required Facilities</span>
            <Factory className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <div>
              <span className="text-xl font-bold text-slate-900">
                ~{simulationResult.infrastructure.requiredPlants2040} Plants
              </span>
              <div className="text-[11px] text-slate-400">
                Base·Regular: ~72 Plants (3,600 tpa)
              </div>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              capacityDeltaPct > 0 ? 'bg-indigo-50 text-indigo-800' : 'bg-slate-100 text-slate-700'
            }`}>
              {capacityDeltaPct >= 0 ? `+${capacityDeltaPct}%` : `${capacityDeltaPct}%`}
            </span>
          </div>
        </div>

        {/* Delta 3: Net Economics */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Net Operating Margin</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <div>
              <span className={`text-xl font-bold ${
                simNetMargin >= 0 ? 'text-teal-900' : 'text-rose-700'
              }`}>
                {simNetMargin >= 0 ? '+' : ''}₹{simNetMargin.toLocaleString()}/t
              </span>
              <div className="text-[11px] text-slate-400">
                Base Repriced: −₹{Math.abs(baseNetMargin).toLocaleString()}/t
              </div>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              marginDeltaPct >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
            }`}>
              {marginDeltaPct >= 0 ? `+${marginDeltaPct}%` : `${marginDeltaPct}%`}
            </span>
          </div>
        </div>
      </div>

      {/* WHY DID THIS HAPPEN? EXPLANATION */}
      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-teal-900 font-bold">
            Why did this happen?
          </span>
          <p className="text-xs text-slate-800 leading-relaxed font-sans max-w-3xl">
            {getWhyExplanation()}
          </p>
        </div>
        <button
          type="button"
          onClick={() => askIntelligence('Why did this change?')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-white border border-teal-300 hover:bg-teal-50 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-700" />
          <span>Explain Details</span>
        </button>
      </div>

      {/* SENSITIVITY CONTROLS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Operational & Policy Sensitivity Levers
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Adjust logistics, freight distance, and EPR policy credits to evaluate economics.
            </p>
          </div>
          <DataProvenanceBadge tier="USER ASSUMPTION" sourceText="Sensitivity Parameters" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
          {/* Input 1: Transport Haul Distance */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-700 font-semibold">Logistics Distance (km):</span>
              <span className="font-mono text-slate-900 font-bold tabular-nums">
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
            <div className="text-[10px] text-slate-400 flex justify-between font-mono">
              <span>50 km (Spoke consolidation)</span>
              <span>600 km (Inter-state haul)</span>
            </div>
          </div>

          {/* Input 2: EPR Fee Incentive */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-700 font-semibold">EPR Credit Floor (₹/t):</span>
              <span className="font-mono text-teal-800 font-bold tabular-nums">
                ₹{scenarioParams.eprFeePerTonneINR.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25000"
              step="1000"
              value={scenarioParams.eprFeePerTonneINR}
              onChange={(e) => updateScenarioParam('eprFeePerTonneINR', Number(e.target.value))}
              className="w-full accent-teal-700 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400 flex justify-between font-mono">
              <span>₹0 (Unsubsidised)</span>
              <span>₹22,000/t (CEEW14 Floor)</span>
            </div>
          </div>

          {/* Input 3: Facility Scale */}
          <div className="space-y-1.5">
            <span className="text-slate-700 font-semibold block">Facility Capacity:</span>
            <select
              value={scenarioParams.plantCapacityTonnesYr}
              onChange={(e) => updateScenarioParam('plantCapacityTonnesYr', Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50 font-mono text-xs cursor-pointer"
            >
              <option value={3600}>3,600 t/yr (CEEW Benchmark Standard)</option>
              <option value={10000}>10,000 t/yr (Commercial Plant)</option>
              <option value={30000}>30,000 t/yr (Regional Hub)</option>
            </select>
            <div className="text-[10px] text-slate-400 font-mono">
              CEEW (2025) standard modular sizing
            </div>
          </div>
        </div>

        {/* COLLAPSIBLE ADVANCED ASSUMPTIONS */}
        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Advanced parameters (Commodity silver price, module mass, canonical Weibull status)</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {showAdvanced && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2 text-xs">
              {/* Module Mass */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Module Mass (kg):</span>
                  <span className="font-mono font-bold">{scenarioParams.moduleMassKg} kg</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="30"
                  step="0.5"
                  value={scenarioParams.moduleMassKg}
                  onChange={(e) => updateScenarioParam('moduleMassKg', Number(e.target.value))}
                  className="w-full accent-teal-700 cursor-pointer"
                />
                <div className="text-[10px] text-slate-400 font-mono">
                  c-Si standard module weight
                </div>
              </div>

              {/* Silver Price */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Silver Commodity Price (₹/g):</span>
                  <span className="font-mono font-bold">₹{(scenarioParams.silverPriceINR_per_kg / 1000).toFixed(1)}/g</span>
                </div>
                <input
                  type="range"
                  min="60000"
                  max="300000"
                  step="10000"
                  value={scenarioParams.silverPriceINR_per_kg}
                  onChange={(e) => updateScenarioParam('silverPriceINR_per_kg', Number(e.target.value))}
                  className="w-full accent-teal-700 cursor-pointer"
                />
                <div className="text-[10px] text-slate-400 flex justify-between font-mono">
                  <span>₹95.8/g (CEEW Ref)</span>
                  <span>₹240/g (Team Repriced)</span>
                </div>
              </div>

              {/* Canonical Weibull Parameters Display (Read-only) */}
              <div className="space-y-1 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-semibold block">Canonical Weibull Distribution:</span>
                <div className="font-mono text-xs font-bold text-slate-900 mt-1">
                  β = 30.0 yrs · α = {activeScenario.includes('early_loss') ? '2.4928 (Early-Loss)' : '5.3759 (Regular)'}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  IRENA (2016) / CEEW (2024) frozen model parameters
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Chart */}
      <TimeSeriesChart
        title="Live Canonical Waste Trajectory vs Benchmark Pathways"
        showScenarioComparison={true}
      />
    </div>
  );
};
