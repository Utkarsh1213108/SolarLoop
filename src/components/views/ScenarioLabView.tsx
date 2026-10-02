import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { TimeSeriesChart } from '../common/TimeSeriesChart';
import { 
  Play, 
  RotateCcw, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Factory,
  Coins
} from 'lucide-react';

export const ScenarioLabView: React.FC = () => {
  const { 
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

  // Baseline reference values (Base Regular scenario)
  const baseWaste2040Kt = 2007;
  const simWaste2040Kt = simulationResult.milestones.cumulative2040Kt;
  const wasteDeltaPct = Math.round(((simWaste2040Kt - baseWaste2040Kt) / baseWaste2040Kt) * 100);

  const baseCapacityReqKt = 360; // Base regular 2040 annual inflow
  const simCapacityReqKt = simulationResult.infrastructure.requiredCapacity2040KtYr;
  const capacityDeltaPct = Math.round(((simCapacityReqKt - baseCapacityReqKt) / baseCapacityReqKt) * 100);

  const baseNetMargin = 2180;
  const simNetMargin = simulationResult.economics.netMarginPerTonneINR;
  const marginDeltaPct = Math.round(((simNetMargin - baseNetMargin) / Math.abs(baseNetMargin)) * 100);

  // Generate plain English explanation of why the delta occurred
  const getWhyExplanation = () => {
    const reasons: string[] = [];
    if (scenarioParams.annualSolarAdditionsGW > 25) {
      reasons.push(`Increasing annual additions to ${scenarioParams.annualSolarAdditionsGW} GW accelerates the operational fleet size.`);
    } else if (scenarioParams.annualSolarAdditionsGW < 25) {
      reasons.push(`Lower annual additions (${scenarioParams.annualSolarAdditionsGW} GW) slow future waste accumulation.`);
    }

    if (scenarioParams.earlyLossRatePct > 3.0) {
      reasons.push(`Elevated early loss (${scenarioParams.earlyLossRatePct}%) brings forward decommissioning volumes by 10–15 years.`);
    }

    if (scenarioParams.avgTransportDistanceKm > 300) {
      reasons.push(`Logistics haul distance (${scenarioParams.avgTransportDistanceKm} km) increases freight costs, squeezing net margins.`);
    }

    if (scenarioParams.eprFeePerTonneINR > 2400) {
      reasons.push(`Enhanced EPR contribution (₹${scenarioParams.eprFeePerTonneINR.toLocaleString()}/t) bolsters project viability.`);
    }

    if (reasons.length === 0) {
      return 'Current parameters match the standard baseline research model.';
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
            Test policy, technology, and market assumptions against the baseline model.
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

      {/* BASELINE vs MY SCENARIO HEAD-TO-HEAD (Section 20 Requirement) */}
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
                {(simWaste2040Kt / unitDivider).toLocaleString()} {unitLabel}
              </span>
              <div className="text-[11px] text-slate-400">Baseline: {(baseWaste2040Kt / unitDivider).toLocaleString()} {unitLabel}</div>
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
            <span>2040 Required Capacity</span>
            <Factory className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <div>
              <span className="text-xl font-bold text-slate-900">
                ~{simulationResult.infrastructure.requiredPlants2040} Plants
              </span>
              <div className="text-[11px] text-slate-400">Baseline: ~12 Plants</div>
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
            <span>Net Unit Economics</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono tabular-nums">
            <div>
              <span className={`text-xl font-bold ${
                simNetMargin >= 0 ? 'text-teal-900' : 'text-rose-700'
              }`}>
                ₹{simNetMargin.toLocaleString()}/t
              </span>
              <div className="text-[11px] text-slate-400">Baseline: ₹{baseNetMargin.toLocaleString()}/t</div>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              marginDeltaPct >= 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
            }`}>
              {marginDeltaPct >= 0 ? `+${marginDeltaPct}%` : `${marginDeltaPct}%`}
            </span>
          </div>
        </div>
      </div>

      {/* WHY DID THIS HAPPEN? EXPLANATION (Section 20 Requirement) */}
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

      {/* 4 CORE CONTROLS INITIALLY (Section 20 Requirement) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Primary Scenario Inputs
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Adjust the 4 primary macro variables. Output updates automatically.
            </p>
          </div>
          <DataProvenanceBadge tier="USER ASSUMPTION" sourceText="Simulation Parameters" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
          {/* Input 1: Annual PV Additions */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-700 font-semibold">Annual Additions (GW):</span>
              <span className="font-mono text-slate-900 font-bold tabular-nums">
                {scenarioParams.annualSolarAdditionsGW} GW/yr
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="50"
              step="1"
              value={scenarioParams.annualSolarAdditionsGW}
              onChange={(e) => updateScenarioParam('annualSolarAdditionsGW', Number(e.target.value))}
              className="w-full accent-teal-700 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400 flex justify-between font-mono">
              <span>15 GW (Slow)</span>
              <span>50 GW (Aggressive)</span>
            </div>
          </div>

          {/* Input 2: Early Loss Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-700 font-semibold">Early-Loss Rate (%):</span>
              <span className="font-mono text-teal-800 font-bold tabular-nums">
                {scenarioParams.earlyLossRatePct}%
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="8.0"
              step="0.5"
              value={scenarioParams.earlyLossRatePct}
              onChange={(e) => updateScenarioParam('earlyLossRatePct', Number(e.target.value))}
              className="w-full accent-teal-700 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400 flex justify-between font-mono">
              <span>1% (Ultra Durable)</span>
              <span>8% (Harsh Desert)</span>
            </div>
          </div>

          {/* Input 3: Transport Haul Distance */}
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
              <span>50 km (Local Spoke)</span>
              <span>600 km (Long Haul)</span>
            </div>
          </div>

          {/* Input 4: EPR Fee Incentive */}
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-700 font-semibold">EPR Credit (₹/t):</span>
              <span className="font-mono text-teal-800 font-bold tabular-nums">
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
            <div className="text-[10px] text-slate-400 flex justify-between font-mono">
              <span>₹0 (No Mandate)</span>
              <span>₹5,000/t (Strict EPR)</span>
            </div>
          </div>
        </div>

        {/* COLLAPSIBLE ADVANCED ASSUMPTIONS (Section 20 Requirement) */}
        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>Advanced assumptions (Commodity prices, plant scale, module mass)</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {showAdvanced && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2 text-xs">
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
              </div>

              {/* Design Life (Years) */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Design Life (Years):</span>
                  <span className="font-mono font-bold">{scenarioParams.designLifeYears} yrs</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="35"
                  step="1"
                  value={scenarioParams.designLifeYears}
                  onChange={(e) => updateScenarioParam('designLifeYears', Number(e.target.value))}
                  className="w-full accent-teal-700 cursor-pointer"
                />
              </div>

              {/* Weibull Beta Shape Factor */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Weibull Shape (β):</span>
                  <span className="font-mono font-bold">β = {scenarioParams.weibullBeta}</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="8.0"
                  step="0.5"
                  value={scenarioParams.weibullBeta}
                  onChange={(e) => updateScenarioParam('weibullBeta', Number(e.target.value))}
                  className="w-full accent-teal-700 cursor-pointer"
                />
              </div>

              {/* Plant Scale (4 tiers) */}
              <div className="space-y-1">
                <span className="text-slate-600 font-medium block">Facility Capacity:</span>
                <select
                  value={scenarioParams.plantCapacityTonnesYr}
                  onChange={(e) => updateScenarioParam('plantCapacityTonnesYr', Number(e.target.value))}
                  className="w-full p-1.5 border border-slate-300 rounded bg-slate-50 font-mono"
                >
                  <option value={3600}>3,600 t/yr (Pilot / Demonstration)</option>
                  <option value={10000}>10,000 t/yr (Small Commercial)</option>
                  <option value={30000}>30,000 t/yr (Regional Hub)</option>
                  <option value={60000}>60,000 t/yr (Large Industrial Center)</option>
                </select>
              </div>

              {/* Silver Price */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Silver Price (₹/kg):</span>
                  <span className="font-mono font-bold">₹{scenarioParams.silverPriceINR_per_kg.toLocaleString()}</span>
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

              {/* Feedstock Price */}
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Feedstock Cost (₹/t):</span>
                  <span className="font-mono font-bold">₹{scenarioParams.feedstockCostPerTonneINR.toLocaleString()}</span>
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
            </div>
          )}
        </div>
      </div>

      {/* Visual Chart */}
      <TimeSeriesChart
        title="Live Simulated Waste Trajectory vs Base Trajectory"
        showScenarioComparison={true}
      />
    </div>
  );
};
