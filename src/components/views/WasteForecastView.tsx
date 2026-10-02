import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { TimeSeriesChart } from '../common/TimeSeriesChart';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { BASELINE_SCENARIOS } from '../../data/researchBaseline';
import { 
  TrendingUp, 
  HelpCircle, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  ShieldCheck,
  Info
} from 'lucide-react';

export const WasteForecastView: React.FC = () => {
  const { 
    unit, 
    setUnit, 
    activeScenario, 
    setActiveScenario,
    simulationResult,
    setIsMethodologyOpen,
    askIntelligence
  } = useScenario();

  const [selectedHorizon, setSelectedHorizon] = useState<'2030' | '2040' | '2050'>('2040');
  const [showDetailedDecomposition, setShowDetailedDecomposition] = useState(false);
  const [showCalibrationInspect, setShowCalibrationInspect] = useState(false);

  const unitDivider = unit === 'Mt' ? 1000 : 1;
  const unitLabel = unit === 'Mt' ? 'Mt' : 'kt';

  // Value for selected horizon
  const horizonValueKt = selectedHorizon === '2030' 
    ? simulationResult.milestones.cumulative2030Kt 
    : selectedHorizon === '2040' 
    ? simulationResult.milestones.cumulative2040Kt 
    : simulationResult.milestones.cumulative2050Kt;

  const horizonValueDisplay = (horizonValueKt / unitDivider).toLocaleString();

  // Research benchmark comparison matrix
  const milestones = [
    {
      horizon: '2030',
      baseRegular: 503,
      baseEarlyLoss: 839,
      conservativeRegular: 397,
      focus: 'Infant failure & early rooftop replacement onset'
    },
    {
      horizon: '2035',
      baseRegular: 1042,
      baseEarlyLoss: 2169,
      conservativeRegular: 734,
      focus: 'Repowering of early NSM Phase-1 & 2 utility parks'
    },
    {
      horizon: '2040',
      baseRegular: 2007,
      baseEarlyLoss: 4833,
      conservativeRegular: 1466,
      focus: 'Exponential acceleration inflection point (25y EoL)'
    },
    {
      horizon: '2047',
      baseRegular: 5658,
      baseEarlyLoss: 12108,
      conservativeRegular: 4360,
      focus: 'India Centenary Benchmark (~37 Mt CO2e avoided)'
    },
    {
      horizon: '2050',
      baseRegular: 8874,
      baseEarlyLoss: 16768,
      conservativeRegular: 6756,
      focus: 'Peak wave of India 500 GW net-zero additions'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Solar Panel Waste Forecast
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Causal cohort-based model projecting solar PV decommissioning volumes across India through 2050.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DataProvenanceBadge tier="MODEL OUTPUT" sourceText="SolarLoop model scenario" />
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

      {/* Simple Controls (Section 5 requirement) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scenario Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Select Scenario:
            </label>
            <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActiveScenario('base_regular')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeScenario === 'base_regular'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Base Regular (25y EoL)
              </button>
              <button
                type="button"
                onClick={() => setActiveScenario('base_early_loss')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeScenario === 'base_early_loss'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Early Loss (Defects & Attrition)
              </button>
              <button
                type="button"
                onClick={() => setActiveScenario('conservative_regular')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeScenario === 'conservative_regular'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Conservative
              </button>
            </div>
          </div>

          {/* Horizon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Forecast Horizon:
            </label>
            <div className="inline-flex rounded-lg border border-slate-200 p-1 bg-slate-50">
              {(['2030', '2040', '2050'] as const).map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedHorizon(yr)}
                  className={`px-4 py-1.5 text-xs font-mono font-semibold rounded-md transition-colors cursor-pointer ${
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

      {/* Interactive Time Series Chart */}
      <TimeSeriesChart
        title={`Projected Waste Trajectory (${activeScenario.replace('_', ' ').toUpperCase()})`}
        showScenarioComparison={true}
      />

      {/* Immediate Clear Executive Sentence & Drivers (Section 5 Requirement) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        {/* Simple sentence immediately below chart */}
        <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-sm text-slate-800 leading-relaxed font-sans">
            Under the selected scenario, cumulative solar waste reaches approximately{' '}
            <strong className="text-teal-900 font-mono text-base font-bold">
              {horizonValueDisplay} {unitLabel}
            </strong>{' '}
            by <strong className="font-mono text-slate-900">{selectedHorizon}</strong>.
          </p>
          <button
            type="button"
            onClick={() => setIsMethodologyOpen(true)}
            className="text-xs font-semibold text-teal-800 hover:text-teal-950 underline shrink-0 cursor-pointer"
          >
            View methodology
          </button>
        </div>

        {/* Transparent Calibration Note (Section 2 Requirement) */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-slate-700 uppercase text-[10px] bg-white px-2 py-0.5 rounded border border-slate-300">
                Calibration Note
              </span>
              <span className="text-slate-700">
                <strong>SolarLoop cohort model</strong> vs <strong>Research reference scenario:</strong>{' '}
                {simulationResult.calibration.isDivergent 
                  ? <span className="text-amber-800 font-semibold">Model divergence driven by assumptions ({simulationResult.calibration.diffPct > 0 ? `+${simulationResult.calibration.diffPct}%` : `${simulationResult.calibration.diffPct}%`} vs reference baseline).</span>
                  : <span className="text-teal-800 font-medium">Calibrated closely with published research reference baseline (±5%).</span>
                }
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-slate-500">
                Ref 2040: {(simulationResult.calibration.ref2040 / unitDivider).toLocaleString()} {unitLabel}
              </span>
              <button
                type="button"
                onClick={() => setShowCalibrationInspect(!showCalibrationInspect)}
                className="text-xs font-semibold text-teal-800 hover:text-teal-950 underline cursor-pointer inline-flex items-center gap-1"
              >
                <span>{showCalibrationInspect ? 'Hide assumptions' : 'Inspect assumptions'}</span>
                {showCalibrationInspect ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Inspect Calibration Assumptions Drawer */}
          {showCalibrationInspect && (
            <div className="pt-3 border-t border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Driver Comparison: Active Cohort Model vs Reference Scenario</span>
                <span className="font-mono text-[10px]">Research literature calibration points</span>
              </div>
              <div className="overflow-x-auto rounded border border-slate-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Parameter</th>
                      <th className="py-2 px-3 text-teal-900 font-mono">SolarLoop Cohort Model</th>
                      <th className="py-2 px-3 text-slate-700 font-mono">Research Reference Scenario</th>
                      <th className="py-2 px-3 text-slate-600">Model Impact / Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {simulationResult.calibration.assumptionsComparison?.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 font-medium text-slate-900 font-sans">{row.param}</td>
                        <td className="py-2 px-3 font-semibold text-teal-800">{row.activeValue}</td>
                        <td className="py-2 px-3 text-slate-600">{row.referenceValue}</td>
                        <td className="py-2 px-3 text-slate-600 font-sans text-[11px]">{row.divergenceImpact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Note: Research scenarios (CEEW/BridgeToIndia/IRENA literature) reflect model benchmarks, not statutory government quotas. SolarLoop evaluates discrete yearly probability mass via Weibull CDF(age + 1) - Weibull CDF(age).
              </p>
            </div>
          )}
        </div>

        {/* What is driving this? (3 major drivers) */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            What is driving this?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1">
              <span className="font-semibold text-slate-900 font-sans">1. Growing Installed Capacity</span>
              <p className="text-slate-600 leading-relaxed">
                India's operational solar fleet expanded from 10 GW in 2017 to &gt;85 GW today. As additions approach 25–40 GW annually, the physical mass of modules in service grows exponentially.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1">
              <span className="font-semibold text-slate-900 font-sans">2. Retirement of Older Cohorts</span>
              <p className="text-slate-600 leading-relaxed">
                Early installations from the National Solar Mission (commissioned 2011–2016) reach their 25-year design lifespan between 2036 and 2041, triggering the first large EoL wave.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 space-y-1">
              <span className="font-semibold text-slate-900 font-sans">3. Early-Loss & Replacement</span>
              <p className="text-slate-600 leading-relaxed">
                Transport micro-cracks, harsh desert thermal cycling, and cyclone wind damage cause 3–5% of modules to exit service 10–15 years before natural end-of-life.
              </p>
            </div>
          </div>
        </div>

        {/* Collapsible Detailed Stream Decomposition */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowDetailedDecomposition(!showDetailedDecomposition)}
            className="w-full py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-between transition-colors cursor-pointer"
          >
            <span>View Detailed Waste-Stream Decomposition Table</span>
            {showDetailedDecomposition ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDetailedDecomposition && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Horizon</th>
                    <th className="py-2 px-3 text-right">Base Regular</th>
                    <th className="py-2 px-3 text-right">Base Early-Loss</th>
                    <th className="py-2 px-3 text-right">Conservative</th>
                    <th className="py-2 px-3">Primary Operational Driver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                  {milestones.map((m) => (
                    <tr key={m.horizon} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">{m.horizon}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                        {(m.baseRegular / unitDivider).toLocaleString()} {unitLabel}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-teal-800">
                        {(m.baseEarlyLoss / unitDivider).toLocaleString()} {unitLabel}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600">
                        {(m.conservativeRegular / unitDivider).toLocaleString()} {unitLabel}
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-600 text-[11px]">
                        {m.focus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
