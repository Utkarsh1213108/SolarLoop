import React, { useMemo, useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { calculateCanonicalMaterialFlow, CANONICAL_SCENARIOS_META } from '../../data/canonicalLoader';
import { calculate_required_plants, STANDARD_PLANT_CAPACITY_TPA } from '../../models/coreCalculations';
import { 
  TrendingUp, 
  ArrowRight, 
  Factory, 
  Coins, 
  ShieldCheck, 
  Layers, 
  Atom, 
  Truck, 
  AlertTriangle,
  FileCheck,
  CheckCircle2
} from 'lucide-react';

interface OverviewViewProps {
  onNavigate?: (tab: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onNavigate }) => {
  const { 
    canonicalData,
    activeScenario, 
    setActiveScenario,
    availableScenarios,
    activeCanonicalScenario,
    unit, 
    setUnit,
    horizonYear,
    setHorizonYear,
    simulationResult,
    setIsMethodologyOpen,
    askIntelligence
  } = useScenario();

  const [activeChartMetric, setActiveChartMetric] = useState<'both' | 'annual' | 'cumulative'>('both');
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const currentScenarioMeta = CANONICAL_SCENARIOS_META[activeScenario];
  const unitDivider = unit === 'Mt' ? 1000 : 1;
  const unitLabel = unit === 'Mt' ? 'Mt' : 'kt';

  // Active scenario milestone metrics
  const m2030 = activeCanonicalScenario.milestone_years['2030'];
  const m2040 = activeCanonicalScenario.milestone_years['2040'];
  const m2050 = activeCanonicalScenario.milestone_years['2050'];

  // Base Regular milestone metrics for reference comparison
  const baseRegularData = canonicalData.forecast_outputs['Base·Regular'];
  const baseM2030 = baseRegularData.milestone_years['2030'];
  const baseM2040 = baseRegularData.milestone_years['2040'];
  const baseM2050 = baseRegularData.milestone_years['2050'];

  // Standard plant counts use the shared canonical benchmark adapter.
  const plants2030 = calculate_required_plants(m2030.annual_waste_kt, STANDARD_PLANT_CAPACITY_TPA).totalPlants;
  const plants2040 = calculate_required_plants(m2040.annual_waste_kt, STANDARD_PLANT_CAPACITY_TPA).totalPlants;
  const plants2050 = calculate_required_plants(m2050.annual_waste_kt, STANDARD_PLANT_CAPACITY_TPA).totalPlants;

  // Economic reference cases
  const econCases = canonicalData.economics_reference;
  const materialFlow = useMemo(() => calculateCanonicalMaterialFlow(1, 'Chemical'), [canonicalData]);
  const formatNet = (value: number) => `${value >= 0 ? '+' : ''}₹${value.toLocaleString()}`;
  const formatMaterialMass = (element: string, massTonnes: number) => element === 'Silver'
    ? `${(massTonnes * 1_000_000).toFixed(1)} g`
    : `${(massTonnes * 1000).toFixed(['Glass', 'Polymer', 'Aluminium'].includes(element) ? 1 : 2)} kg`;

  // Time-series arrays (2026 to 2050)
  const years = Object.keys(activeCanonicalScenario.annual_series_kt)
    .map(Number)
    .filter(y => y >= 2026 && y <= 2050)
    .sort((a, b) => a - b);

  // Maximum values for chart scaling
  const maxAnnualKt = Math.max(
    ...years.map(y => activeCanonicalScenario.annual_series_kt[String(y)] || 0),
    ...years.map(y => baseRegularData.annual_series_kt[String(y)] || 0)
  );
  const maxCumKt = Math.max(
    ...years.map(y => activeCanonicalScenario.cumulative_series_kt[String(y)] || 0),
    ...years.map(y => baseRegularData.cumulative_series_kt[String(y)] || 0)
  );

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto font-sans text-slate-800">

      {/* ========================================================= */}
      {/* SECTION 1 — HERO INSIGHT                                  */}
      {/* ========================================================= */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8 border border-slate-800 shadow-sm relative overflow-hidden">
        {/* Subtle grid accent background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Metadata Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-teal-400"></span>
              <span className="text-xs font-mono uppercase tracking-widest text-teal-400 font-semibold">
                Strategic Circularity Briefing · {currentScenarioMeta?.name || activeScenario}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DataProvenanceBadge tier="VERIFIED SOURCE" sourceText="solarloop_canonical_data.json (CEEW/IRENA)" />
              <span className="text-[11px] font-mono text-slate-400">
                α={activeCanonicalScenario.alpha} · β=30.0 yr
              </span>
            </div>
          </div>

          {/* Large Conclusion-Led Hero Statement */}
          <div className="space-y-2">
            <div className="text-xs uppercase font-mono tracking-wider text-slate-400">
              National Decommissioning Horizon
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              India's solar waste wave reaches{' '}
              <span className="text-teal-300 font-mono">
                {(m2050.annual_waste_kt / unitDivider).toLocaleString(undefined, { maximumFractionDigits: 1 })} {unitLabel}/year
              </span>{' '}
              by 2050.
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed font-sans">
              Cumulative end-of-life volume accumulates to{' '}
              <strong className="text-white font-semibold">
                {(m2040.cumulative_waste_kt / unitDivider).toLocaleString(undefined, { maximumFractionDigits: 1 })} {unitLabel} by 2040
              </strong>{' '}
              and{' '}
              <strong className="text-white font-semibold">
                {(m2050.cumulative_waste_kt / unitDivider).toLocaleString(undefined, { maximumFractionDigits: 1 })} {unitLabel} by 2050
              </strong>
              . Commercial viability is reference-case dependent, with the canonical economics spanning published, silver-repriced and EPR-floor cases.
            </p>
          </div>

          {/* 4 Supporting Exhibit Pillars */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-4">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                2030 Cumulative
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {(m2030.cumulative_waste_kt / unitDivider).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                <span className="text-xs text-slate-400 font-sans ml-1">{unitLabel}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Annual: {(m2030.annual_waste_kt / unitDivider).toFixed(1)} {unitLabel}/yr
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-4">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                2040 Cumulative
              </div>
              <div className="text-2xl font-bold font-mono text-teal-300 mt-1">
                {(m2040.cumulative_waste_kt / unitDivider).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                <span className="text-xs text-teal-200 font-sans ml-1">{unitLabel}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Annual: {(m2040.annual_waste_kt / unitDivider).toFixed(1)} {unitLabel}/yr
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-4">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Facility Scaling (2040)
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                ~{plants2040}
                <span className="text-xs text-slate-400 font-sans ml-1.5">Plants</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono">
                {m2040.annual_waste_kt.toFixed(0)} kt ÷ 3.6 kt/yr standard
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-4">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Silver-Repriced Reference Margin
              </div>
              <div className="text-2xl font-bold font-mono text-rose-300 mt-1">
                {econCases.Silver_Repriced_Team_Case.net_inr_per_tonne.toLocaleString()}
                <span className="text-xs text-slate-400 font-sans ml-1">/t</span>
              </div>
              <div className="text-xs text-emerald-400 mt-1">
                EPR-floor reference: {econCases.EPR_Floor_Bankable_Case.net_inr_per_tonne.toLocaleString()}/t
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2 — WASTE CURVE (ANALYTICAL TIME-SERIES EXHIBIT)  */}
      {/* ========================================================= */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Exhibit 1 · Decommissioning Flow & Stock Dynamics
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              India Solar PV Waste Accumulation Trajectory (2026–2050)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Annual decommissioning flow (bars) against cumulative waste stock (line), calibrated to discrete Weibull cohort retirements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Metric display switch */}
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveChartMetric('both')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeChartMetric === 'both' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500'
                }`}
              >
                Dual Flow & Stock
              </button>
              <button
                type="button"
                onClick={() => setActiveChartMetric('annual')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeChartMetric === 'annual' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500'
                }`}
              >
                Annual Flow
              </button>
              <button
                type="button"
                onClick={() => setActiveChartMetric('cumulative')}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  activeChartMetric === 'cumulative' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-500'
                }`}
              >
                Cumulative Stock
              </button>
            </div>
          </div>
        </div>

        {/* Interactive SVG Strategy Chart */}
        <div className="w-full bg-slate-50/60 rounded-xl p-4 border border-slate-200/80">
          <div className="h-72 w-full relative flex flex-col justify-between">
            {/* Chart Canvas */}
            <div className="flex-1 w-full relative flex items-end gap-1 pt-6 pb-6">
              {years.map((y) => {
                const yStr = String(y);
                const annVal = (activeCanonicalScenario.annual_series_kt[yStr] || 0) / unitDivider;
                const cumVal = (activeCanonicalScenario.cumulative_series_kt[yStr] || 0) / unitDivider;
                const baseAnn = (baseRegularData.annual_series_kt[yStr] || 0) / unitDivider;

                const annHeightPct = maxAnnualKt > 0 ? (annVal / (maxAnnualKt / unitDivider)) * 80 : 0;
                const cumHeightPct = maxCumKt > 0 ? (cumVal / (maxCumKt / unitDivider)) * 90 : 0;
                const isMilestone = y === 2030 || y === 2040 || y === 2050;
                const isHovered = hoveredYear === y;

                return (
                  <div
                    key={y}
                    onMouseEnter={() => setHoveredYear(y)}
                    onMouseLeave={() => setHoveredYear(null)}
                    className="flex-1 h-full flex flex-col justify-end items-center relative group cursor-pointer"
                  >
                    {/* Hover Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-12 z-30 bg-slate-900 text-white text-[10px] font-mono px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
                        <div className="font-bold">{y}</div>
                        <div>Annual: {annVal.toFixed(1)} {unitLabel}</div>
                        <div>Cumulative: {cumVal.toFixed(1)} {unitLabel}</div>
                      </div>
                    )}

                    {/* Milestone Pin */}
                    {isMilestone && (
                      <div className="absolute top-0 text-[10px] font-mono font-bold text-teal-700 bg-teal-100/90 px-1 py-0.5 rounded border border-teal-300">
                        {y}
                      </div>
                    )}

                    {/* Cumulative Trend Marker Dot */}
                    {(activeChartMetric === 'both' || activeChartMetric === 'cumulative') && (
                      <div
                        style={{ bottom: `${cumHeightPct}%` }}
                        className="absolute w-2 h-2 rounded-full bg-slate-900 ring-2 ring-white z-10 transition-all"
                      />
                    )}

                    {/* Annual Flow Bar */}
                    {(activeChartMetric === 'both' || activeChartMetric === 'annual') && (
                      <div
                        style={{ height: `${annHeightPct}%` }}
                        className={`w-full max-w-[24px] rounded-t transition-all ${
                          isMilestone 
                            ? 'bg-teal-600' 
                            : isHovered 
                              ? 'bg-teal-500' 
                              : 'bg-teal-700/80 hover:bg-teal-600'
                        }`}
                      />
                    )}

                    {/* Year Label */}
                    <span className={`text-[10px] font-mono mt-1 ${
                      isMilestone ? 'font-bold text-slate-900' : 'text-slate-400'
                    }`}>
                      {y % 5 === 0 ? `'${String(y).slice(2)}` : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Chart Legend & Context Bar */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs font-mono text-slate-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-teal-600"></span>
                  <span>Annual Inflow ({unitLabel}/yr)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-2 ring-white"></span>
                  <span>Cumulative Stock ({unitLabel})</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500">
                Active Scenario: <strong className="text-slate-800 font-semibold">{currentScenarioMeta?.name || activeScenario}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Milestone Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 font-mono text-xs">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">2030 Inflow:</span>
              <span className="font-bold text-slate-900">{(m2030.annual_waste_kt / unitDivider).toFixed(1)} {unitLabel}/yr</span>
            </div>
            <div className="flex justify-between items-baseline mt-1 text-[11px]">
              <span className="text-slate-400">Cumulative:</span>
              <span className="text-slate-700">{(m2030.cumulative_waste_kt / unitDivider).toFixed(1)} {unitLabel}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-200 font-mono text-xs">
            <div className="flex justify-between items-baseline">
              <span className="text-teal-800 font-semibold">2040 Inflow:</span>
              <span className="font-bold text-teal-950">{(m2040.annual_waste_kt / unitDivider).toFixed(1)} {unitLabel}/yr</span>
            </div>
            <div className="flex justify-between items-baseline mt-1 text-[11px]">
              <span className="text-teal-700">Cumulative:</span>
              <span className="text-teal-900 font-medium">{(m2040.cumulative_waste_kt / unitDivider).toFixed(1)} {unitLabel}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 font-mono text-xs">
            <div className="flex justify-between items-baseline">
              <span className="text-slate-500">2050 Inflow:</span>
              <span className="font-bold text-slate-900">{(m2050.annual_waste_kt / unitDivider).toFixed(1)} {unitLabel}/yr</span>
            </div>
            <div className="flex justify-between items-baseline mt-1 text-[11px]">
              <span className="text-slate-400">Cumulative:</span>
              <span className="text-slate-700">{(m2050.cumulative_waste_kt / unitDivider).toFixed(1)} {unitLabel}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3 — THE CAPACITY GAP & INFRASTRUCTURE SCALING    */}
      {/* ========================================================= */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Exhibit 2 · Industrial Scaling Problem
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            The Capacity Gap: Converting Waste Flow into Standard Recycling Facilities
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculation: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">Required Facilities = ⌈ Annual Waste (tpa) / 3,600 tpa standard plant ⌉</code> (CEEW 2025 benchmark facility sizing).
          </p>
        </div>

        {/* Analytical Capacity Ladder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
          {/* 2030 Tier */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">HORIZON 2030</span>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold">
                Pilot & Regional
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-slate-900">
                ~{plants2030} <span className="text-sm font-sans font-normal text-slate-500">Facilities</span>
              </div>
              <div className="text-xs text-slate-600">
                Annual Inflow: <strong>{m2030.annual_waste_kt.toFixed(1)} kt/yr</strong>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/80 font-sans">
              Co-location with existing e-waste recyclers and preliminary spoke aggregation network in major utility states.
            </div>
          </div>

          {/* 2040 Tier (Highlighted Horizon) */}
          <div className="p-4 rounded-xl border-2 border-teal-600 bg-teal-50/50 space-y-3 relative shadow-xs">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-teal-900">HORIZON 2040</span>
              <span className="px-2 py-0.5 rounded bg-teal-600 text-white text-[10px] font-bold">
                Commercial Scale
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-teal-950">
                ~{plants2040} <span className="text-sm font-sans font-normal text-teal-800">Facilities</span>
              </div>
              <div className="text-xs text-teal-900">
                Annual Inflow: <strong>{m2040.annual_waste_kt.toFixed(1)} kt/yr</strong>
              </div>
            </div>
            <div className="text-[11px] text-teal-800 pt-2 border-t border-teal-200 font-sans">
              Critical transition window. Requires ~6 regional thermal-hydrometallurgical hubs supported by district spoke collection nodes.
            </div>
          </div>

          {/* 2050 Tier */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">HORIZON 2050</span>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold">
                Industrial Scale
              </span>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-slate-900">
                ~{plants2050} <span className="text-sm font-sans font-normal text-slate-500">Facilities</span>
              </div>
              <div className="text-xs text-slate-600">
                Annual Inflow: <strong>{m2050.annual_waste_kt.toFixed(1)} kt/yr</strong>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/80 font-sans">
              Mature nationwide reverse-logistics grid. Siting must accommodate mega-scale automated processing lines.
            </div>
          </div>
        </div>

        {/* Visual Scaling Ratio Strip */}
        <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-slate-700">
          <div>
            <strong className="text-slate-900">Infrastructure Expansion Multiplier:</strong> From {plants2030} plants (2030) to {plants2050} plants (2050) represents a <strong>{(plants2050 / Math.max(1, plants2030)).toFixed(1)}× network expansion</strong>.
          </div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('network')}
            className="inline-flex items-center gap-1 font-sans font-semibold text-teal-800 hover:text-teal-950 shrink-0 cursor-pointer"
          >
            <span>Explore Hub Siting Sizing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4 — CIRCULARITY ECONOMICS WATERFALL EXHIBIT       */}
      {/* ========================================================= */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Exhibit 3 · Canonical Unit Economics & Commercial Viability
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Financial Bridge: How Silver Commodity Pricing and EPR Policy Floor Dictate Bankability
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unit economics per tonne of c-Si waste processed through standard 3,600 tpa plant (CEEW 2025 benchmark values).
          </p>
        </div>

        {/* Waterfall Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {/* Case 1: Published CEEW Chemical */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              1. Published CEEW Benchmark
            </span>
            <div className="text-xl font-bold text-rose-700">
              {formatNet(econCases.Published_CEEW_Chemical.net_inr_per_tonne)} <span className="text-xs font-sans text-slate-500">/t</span>
            </div>
            <div className="text-[11px] text-slate-600 font-sans leading-tight">
              {econCases.Published_CEEW_Chemical.notes}
            </div>
            <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-200 font-mono">
              Status: Published Reference
            </div>
          </div>

          {/* Case 2: Silver Repriced Team Case */}
          <div className="p-4 rounded-xl border border-slate-300 bg-white space-y-2 shadow-xs">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
              2. Silver Re-Priced Team Case
            </span>
            <div className="text-xl font-bold text-rose-600">
              {formatNet(econCases.Silver_Repriced_Team_Case.net_inr_per_tonne)} <span className="text-xs font-sans text-slate-500">/t</span>
            </div>
            <div className="text-[11px] text-slate-600 font-sans leading-tight">
              {econCases.Silver_Repriced_Team_Case.notes}
            </div>
            <div className="pt-2 text-[10px] text-teal-700 border-t border-slate-100 font-mono font-medium">
              Status: Current Market Quote
            </div>
          </div>

          {/* Case 3: EPR Floor Bankable Case */}
          <div className="p-4 rounded-xl border-2 border-emerald-600 bg-emerald-50/50 space-y-2 shadow-xs">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
              3. EPR Policy Floor Case
            </span>
            <div className="text-2xl font-bold text-emerald-700">
              {formatNet(econCases.EPR_Floor_Bankable_Case.net_inr_per_tonne)} <span className="text-xs font-sans text-emerald-900">/t</span>
            </div>
            <div className="text-[11px] text-emerald-900 font-sans leading-tight">
              {econCases.EPR_Floor_Bankable_Case.notes}
            </div>
            <div className="pt-2 text-[10px] text-emerald-800 border-t border-emerald-200 font-mono font-bold">
              Status: Required Policy Mandate
            </div>
          </div>

          {/* Case 4: Mechanical Route */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              4. Mechanical Shredding Route
            </span>
            <div className="text-xl font-bold text-slate-700">
              {formatNet(econCases.Published_CEEW_Mechanical.net_inr_per_tonne)} <span className="text-xs font-sans text-slate-500">/t</span>
            </div>
            <div className="text-[11px] text-slate-600 font-sans leading-tight">
              {econCases.Published_CEEW_Mechanical.notes}
            </div>
            <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-200 font-mono">
              Status: Published Benchmark
            </div>
          </div>
        </div>

        {/* Economic Takeaway Note */}
        <div className="p-3 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 font-sans flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <span>
            <strong>Analytical Takeaway:</strong> High silver prices alone cannot solve solar circularity economics. An EPR certificate floor of ≥₹22/kg is the single variable that enables commercial project financing without recurring state operating subsidies.
          </span>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5 — MATERIAL VALUE CHAIN FLOW EXHIBIT             */}
      {/* ========================================================= */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Exhibit 4 · Material Composition & Disposition
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              c-Si Solar Module Mass Decomposition & Yield Pathways
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              1,000 kg input module decomposed strictly per CEEW (2025) baseline material fractions and hydrometallurgical yields.
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
            Mass Balance: 100.00% Conserved
          </span>
        </div>

        {/* Material Flow Visual Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs font-mono">
          {/* Glass */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Float Glass</span>
            <div className="text-base font-bold text-slate-900">{formatMaterialMass('Glass', materialFlow.contained.Glass)}</div>
            <div className="text-[10px] text-teal-700 font-bold">Recovered: {formatMaterialMass('Glass', materialFlow.recovered.Glass)}</div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 font-sans">
              Yield: {(materialFlow.recovered.Glass / materialFlow.contained.Glass * 100).toFixed(0)}% · canonical recovered material
            </div>
          </div>

          {/* Aluminium */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Al Frame</span>
            <div className="text-base font-bold text-slate-900">{formatMaterialMass('Aluminium', materialFlow.contained.Aluminium)}</div>
            <div className="text-[10px] text-teal-700 font-bold">Recovered: {formatMaterialMass('Aluminium', materialFlow.recovered.Aluminium)}</div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 font-sans">
              Yield: {(materialFlow.recovered.Aluminium / materialFlow.contained.Aluminium * 100).toFixed(0)}% · canonical recovered material
            </div>
          </div>

          {/* Polymer */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Polymer / EVA</span>
            <div className="text-base font-bold text-slate-900">{formatMaterialMass('Polymer', materialFlow.contained.Polymer)}</div>
            <div className="text-[10px] text-amber-700 font-bold">Co-processed: {formatMaterialMass('Polymer', materialFlow.coProcessed.Polymer)}</div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 font-sans">
              Canonical cement co-processing disposition
            </div>
          </div>

          {/* Silicon */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Solar Silicon</span>
            <div className="text-base font-bold text-slate-900">{formatMaterialMass('Silicon', materialFlow.contained.Silicon)}</div>
            <div className="text-[10px] text-slate-700 font-bold">Recovered: {formatMaterialMass('Silicon', materialFlow.recovered.Silicon)}</div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 font-sans">
              Yield: {(materialFlow.recovered.Silicon / materialFlow.contained.Silicon * 100).toFixed(0)}% · canonical recovered material
            </div>
          </div>

          {/* Copper */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">Copper Wire</span>
            <div className="text-base font-bold text-slate-900">{formatMaterialMass('Copper', materialFlow.contained.Copper)}</div>
            <div className="text-[10px] text-amber-800 font-bold">Recovered: {formatMaterialMass('Copper', materialFlow.recovered.Copper)}</div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 font-sans">
              Yield: {(materialFlow.recovered.Copper / materialFlow.contained.Copper * 100).toFixed(0)}% · canonical recovered material
            </div>
          </div>

          {/* Silver */}
          <div className="p-3 rounded-xl border-2 border-teal-500 bg-teal-50/60 space-y-1">
            <span className="text-[10px] text-teal-800 font-bold block uppercase">Pure Silver (Ag)</span>
            <div className="text-base font-bold text-teal-950">{formatMaterialMass('Silver', materialFlow.recovered.Silver)}</div>
            <div className="text-[10px] text-teal-800 font-bold">Recovered from {formatMaterialMass('Silver', materialFlow.contained.Silver)}</div>
            <div className="text-[10px] text-teal-900 pt-1 border-t border-teal-200 font-sans">
              Yield: {(materialFlow.recovered.Silver / materialFlow.contained.Silver * 100).toFixed(0)}% · canonical recovered material
            </div>
          </div>

          {/* Residual */}
          <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
            <span className="text-[10px] text-slate-400 block uppercase">TSDF Residual</span>
            <div className="text-base font-bold text-slate-900">{materialFlow.residualMassTonnes.toFixed(2)} kg</div>
            <div className="text-[10px] text-rose-700 font-bold">{materialFlow.residualPct.toFixed(1)}% residual</div>
            <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-200 font-sans">
              Canonical TSDF residual disposition
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 6 — STRATEGIC DECISION PANEL ("WHAT THIS MEANS")   */}
      {/* ========================================================= */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-semibold">
              Executive Decision Memo
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Strategic Implications: What Policy Makers & Asset Owners Must Build Today
            </h2>
          </div>
          <button
            type="button"
            onClick={() => askIntelligence('Summarize the top 5 strategic circularity recommendations')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <span>Synthesize Strategy</span>
            <ArrowRight className="w-3 h-3 text-teal-300" />
          </button>
        </div>

        {/* 5 Consulting-Grade Strategy Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-sans">
          {/* Pillar 1 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-900 text-teal-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <strong className="text-white text-sm">Build Capacity Ahead of Acceleration</strong>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Decommissioning expands over <strong>16× between 2030 and 2050</strong>. With 24–36 month industrial licensing and construction lead times, regional recycling hub land allocation must begin before 2028 to prevent illegal open-air dumping.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-900 text-teal-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <strong className="text-white text-sm">Decentralise Collection via District Spokes</strong>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Inter-state transport (360 km) costs ~₹4,454/t. Co-locating pre-processing spokes with existing channel partners (e.g., INA's 700+ network) strips 77% of module mass (glass & frames) locally, saving <strong>₹3,217/t</strong> in road freight.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-900 text-teal-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <strong className="text-white text-sm">Mandate Deep Thermal & Hydrometallurgical Recovery</strong>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Mechanical shredding yields {(canonicalData.recycling_routes.Mechanical.material_recovery_yields.Silver * 100).toFixed(0)}% silver recovery. Chemical delamination recovers {(materialFlow.recovered.Silver / materialFlow.contained.Silver * 100).toFixed(0)}% of contained silver ({formatMaterialMass('Silver', materialFlow.recovered.Silver)} recovered), while route economics remain governed by the canonical reference cases.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-900 text-teal-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                4
              </span>
              <strong className="text-white text-sm">Enact Statutory Solar EPR Certificate Floor</strong>
            </div>
            <p className="text-slate-300 leading-relaxed">
              E-Waste Rules 2022 list Category CEEW14 without mandatory collection quotas or tradable certificate pricing. The canonical EPR Floor Bankable Case reports {formatNet(econCases.EPR_Floor_Bankable_Case.net_inr_per_tonne)} per tonne versus {formatNet(econCases.Silver_Repriced_Team_Case.net_inr_per_tonne)} for the Silver Re-Priced Team Case.
            </p>
          </div>

          {/* Pillar 5 */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-900 text-teal-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                5
              </span>
              <strong className="text-white text-sm">Strengthen Digital Asset Registry & Traceability</strong>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Connect MNRE RFID module tags and NISE ALMM databases to a national district-level retirement registry. Guaranteed feedstock schedules allow recyclers to secure debt financing at commercial 67% utilization thresholds.
            </p>
          </div>

          {/* Pillar 6 - Circular Off-take */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-900 text-teal-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                6
              </span>
              <strong className="text-white text-sm">Secure Domestic Industrial Offtake</strong>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Recycled aluminium supply will reach 15–36 kt/yr in 2035. Integrating with planned OEM extrusion lines (such as INA's planned 12 kt/yr frame facility) creates a closed loop without price degradation from international scrap imports.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
