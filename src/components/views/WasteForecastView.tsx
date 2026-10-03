import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { TimeSeriesChart } from '../common/TimeSeriesChart';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { ForecastScenarioId } from '../../types';
import { 
  TrendingUp, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const WasteForecastView: React.FC = () => {
  const { 
    canonicalData,
    unit, 
    setUnit, 
    activeScenario, 
    setActiveScenario,
    availableScenarios,
    activeCanonicalScenario,
    simulationResult,
    setIsMethodologyOpen,
    askIntelligence
  } = useScenario();

  const [selectedHorizon, setSelectedHorizon] = useState<'2030' | '2040' | '2050'>('2040');
  const [showDetailedDecomposition, setShowDetailedDecomposition] = useState(false);
  const [showAssumptionsModal, setShowAssumptionsModal] = useState(false);

  const unitDivider = unit === 'Mt' ? 1000 : 1;
  const unitLabel = unit === 'Mt' ? 'Mt' : 'kt';

  const milestoneData = activeCanonicalScenario.milestone_years[selectedHorizon];
  const horizonValueDisplay = (milestoneData.cumulative_waste_kt / unitDivider).toLocaleString(undefined, { maximumFractionDigits: 1 });
  const annualFlowDisplay = (milestoneData.annual_waste_kt / unitDivider).toLocaleString(undefined, { maximumFractionDigits: 1 });

  // 6 Canonical Scenarios Table
  const scenarioMatrix = availableScenarios.map(sc => {
    const data = canonicalData.forecast_outputs[sc.canonicalKey];
    return {
      ...sc,
      cum2030: data.milestone_years['2030'].cumulative_waste_kt,
      cum2040: data.milestone_years['2040'].cumulative_waste_kt,
      cum2050: data.milestone_years['2050'].cumulative_waste_kt,
      ann2040: data.milestone_years['2040'].annual_waste_kt,
      comm2040: data.milestone_years['2040'].commissioning_scrap_kt,
      ops2040: data.milestone_years['2040'].operational_failure_kt
    };
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Solar Panel Waste Forecast Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            National decommissioning volume forecasts for India (2026–2050) strictly grounded on the canonical IRENA/IEA-PVPS (2016) Weibull framework and CEEW (2024–2025) benchmarks.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DataProvenanceBadge tier="VERIFIED SOURCE" sourceText="solar_waste_model_v2.py (FROZEN)" />
          <button
            type="button"
            onClick={() => askIntelligence('Why does waste accelerate after 2040?')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>Explain Result</span>
          </button>
        </div>
      </div>

      {/* Scenario & Horizon Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* 6 Scenarios Dropdown / Segmented Grid */}
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Canonical Scenario (3 Trajectories × 2 Loss Curves):
            </label>
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

          {/* Horizon Selector */}
          <div className="lg:w-48 shrink-0">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Milestone Horizon:
            </label>
            <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 w-full justify-between">
              {(['2030', '2040', '2050'] as const).map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedHorizon(yr)}
                  className={`flex-1 py-1.5 text-xs font-mono font-semibold rounded-md transition-colors cursor-pointer text-center ${
                    selectedHorizon === yr
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Canonical Time Series Chart */}
      <TimeSeriesChart
        title={`Solar Waste Accumulation (${activeCanonicalScenario.capacity_path} Path · α=${activeCanonicalScenario.alpha})`}
        showScenarioComparison={true}
      />

      {/* Executive Key Finding Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-slate-800 leading-relaxed font-sans">
            Under <strong className="text-slate-900">{activeCanonicalScenario.capacity_path} Path ({activeCanonicalScenario.alpha === 5.3759 ? 'Regular wear-out' : 'Early-loss stress'})</strong>, cumulative solar waste reaches{' '}
            <strong className="text-teal-900 font-mono text-base font-bold">
              {horizonValueDisplay} {unitLabel}
            </strong>{' '}
            by <strong className="font-mono text-slate-900">{selectedHorizon}</strong>, with annual decommissioning flow of{' '}
            <strong className="font-mono text-slate-900">{annualFlowDisplay} {unitLabel}/year</strong>.
          </p>
          <button
            type="button"
            onClick={() => setIsMethodologyOpen(true)}
            className="text-xs font-semibold text-teal-800 hover:text-teal-950 underline shrink-0 cursor-pointer"
          >
            Methodology & Formulas
          </button>
        </div>

        {/* Canonical 3 Drivers */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Canonical Causal Drivers (solar_waste_model_v2.py)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1">
              <span className="font-semibold text-slate-900 font-sans">1. Commissioning Loss (2.3%)</span>
              <p className="text-slate-600 leading-relaxed">
                Occurs immediately upon installation due to port handling, transit breakage, and EPC installation scrap prior to grid synchronization (CEEW 2024 / Bridge to India benchmark).
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1">
              <span className="font-semibold text-slate-900 font-sans">2. Surviving Cohort Weibull Wearout</span>
              <p className="text-slate-600 leading-relaxed">
                Calculated on surviving mass using IRENA/IEA-PVPS (2016) parameters: characteristic life β = 30.0 years, shape α = 5.3759 (Regular) or α = 2.4928 (Early-loss).
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1">
              <span className="font-semibold text-slate-900 font-sans">3. Mass Intensity (t/MW) Evolution</span>
              <p className="text-slate-600 leading-relaxed">
                65.0 t/MW for historic cohorts (≤2022) transitioning to 58.0 t/MW for vintages &gt;2022 due to wafer thinning and high-efficiency cell architectures.
              </p>
            </div>
          </div>
        </div>

        {/* Collapsible Canonical 6-Scenario Matrix */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowDetailedDecomposition(!showDetailedDecomposition)}
            className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>View Complete 6-Scenario Canonical Milestone Matrix (2030, 2040, 2050)</span>
            {showDetailedDecomposition ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDetailedDecomposition && (
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Scenario</th>
                    <th className="py-2.5 px-3">Capacity Trajectory</th>
                    <th className="py-2.5 px-3 text-center">Weibull α</th>
                    <th className="py-2.5 px-3 text-right">2030 Cumul.</th>
                    <th className="py-2.5 px-3 text-right font-bold text-slate-900">2040 Cumul.</th>
                    <th className="py-2.5 px-3 text-right">2050 Cumul.</th>
                    <th className="py-2.5 px-3 text-right">2040 Annual Flow</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                  {scenarioMatrix.map((m) => {
                    const isCurrent = activeScenario === m.id;
                    return (
                      <tr key={m.id} className={`hover:bg-slate-50/70 ${isCurrent ? 'bg-teal-50/40 font-bold' : ''}`}>
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-900 flex items-center gap-1.5">
                          {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-teal-600 inline-block" />}
                          <span>{m.name}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 font-sans">{m.capacityPath}</td>
                        <td className="py-2.5 px-3 text-center text-slate-600">{m.alpha}</td>
                        <td className="py-2.5 px-3 text-right text-slate-700">
                          {(m.cum2030 / unitDivider).toLocaleString(undefined, { maximumFractionDigits: 1 })} {unitLabel}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-teal-900">
                          {(m.cum2040 / unitDivider).toLocaleString(undefined, { maximumFractionDigits: 1 })} {unitLabel}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700">
                          {(m.cum2050 / unitDivider).toLocaleString(undefined, { maximumFractionDigits: 1 })} {unitLabel}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {(m.ann2040 / unitDivider).toLocaleString(undefined, { maximumFractionDigits: 1 })} {unitLabel}/yr
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
