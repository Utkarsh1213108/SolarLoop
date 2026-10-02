import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { TimeSeriesChart } from '../common/TimeSeriesChart';
import { IndiaMap } from '../common/IndiaMap';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { QuickAnalysisWorkflow } from '../common/QuickAnalysisWorkflow';
import { 
  TrendingUp, 
  Factory, 
  Coins, 
  Leaf, 
  SunMedium, 
  ArrowRight, 
  Truck, 
  Atom, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sliders,
  ShieldCheck
} from 'lucide-react';

export const OverviewView: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { 
    unit, 
    activeScenario, 
    setActiveScenario,
    simulationResult, 
    inaNetworkMode,
    askIntelligence,
    scenarioParams
  } = useScenario();

  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);

  const unitDivider = unit === 'Mt' ? 1000 : 1;
  const unitLabel = unit === 'Mt' ? 'Mt' : 'kt';

  const m2030 = (simulationResult.milestones.cumulative2030Kt / unitDivider).toLocaleString();
  const m2040 = (simulationResult.milestones.cumulative2040Kt / unitDivider).toLocaleString();
  const m2050 = (simulationResult.milestones.cumulative2050Kt / unitDivider).toLocaleString();

  // 5 Main Actions as strictly requested in Section 9
  const mainActions = [
    {
      id: 'forecast',
      label: 'Forecast Waste',
      question: 'When will panels retire?',
      metric: `${m2040} ${unitLabel} by 2040`,
      icon: TrendingUp
    },
    {
      id: 'network',
      label: 'Plan Capacity',
      question: 'Where are facilities needed?',
      metric: `~${simulationResult.infrastructure.requiredPlants2040} Regional Plants`,
      icon: Factory
    },
    {
      id: 'economics',
      label: 'Economics',
      question: 'Is recycling viable?',
      metric: `₹${simulationResult.economics.netMarginPerTonneINR.toLocaleString()}/t net margin`,
      icon: Coins
    },
    {
      id: 'logistics',
      label: 'Logistics',
      question: 'How do modules move?',
      metric: `${inaNetworkMode ? '700+ INA Nodes' : '6 Regional Hubs'}`,
      icon: Truck
    },
    {
      id: 'materials',
      label: 'Circularity',
      question: 'What is recovered?',
      metric: 'Al, Ag, Si & Float Glass',
      icon: Atom
    }
  ];

  const scenarioNames: Record<string, string> = {
    base_regular: 'Base Regular (25-year Weibull EoL)',
    base_early_loss: 'Base Early-Loss (Defects & Attrition)',
    conservative_regular: 'Conservative Regular (Extended 28y Life)',
    conservative_early_loss: 'Conservative Early-Loss',
    custom_scenario: 'Custom Scenario Lab Configuration'
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. WHAT WOULD YOU LIKE TO ANALYSE? (Section 9 Requirement) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-bold">
              Action Center
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              What would you like to analyse?
            </h2>
          </div>
          <button
            type="button"
            onClick={() => askIntelligence('Summarise this analysis')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors w-fit cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>Summarise this analysis</span>
          </button>
        </div>

        {/* 5 Distinct Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-3">
          {mainActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onNavigate(action.id)}
                className="p-3.5 text-left rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-600 hover:shadow-xs transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 group-hover:text-teal-700 group-hover:border-teal-300 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-2.5 font-sans">
                    {action.label}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {action.question}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] font-mono text-teal-800 font-semibold flex items-center justify-between">
                  <span>{action.metric}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CURRENT SCENARIO BRIEFING & DYNAMIC SOLARLOOP RECOMMENDS (Phases 18 & 19) */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-semibold">
                Current Scenario:
              </span>
              <span className="text-xs font-bold font-mono text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                {scenarioNames[activeScenario] || activeScenario}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                {simulationResult.economics.financialAnalysis.viabilityVerdict}
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight mt-1">
              National Solar Circularity Decision Engine
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => askIntelligence('Explain this recommendation')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Executive Briefing</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('scenariolab')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Adjust Scenario</span>
            </button>
          </div>
        </div>

        {/* DYNAMIC SOLARLOOP OPERATIONAL RECOMMENDATION PANEL (Phase 18) */}
        <div className="p-4 bg-teal-950/60 border border-teal-800/80 rounded-xl space-y-3">
          <div className="flex items-center justify-between border-b border-teal-800/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300 font-mono">
                SolarLoop Recommends (Dynamic Model Synthesis)
              </span>
            </div>
            <span className="text-[10px] font-mono text-teal-200">
              Horizon: 2040 Decommissioning Wave
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded bg-slate-900/70 border border-teal-800/40">
              <span className="text-[10px] text-slate-400 font-mono">1. Infrastructure Target</span>
              <div className="font-bold text-white text-sm mt-0.5">
                ~{simulationResult.recommendation.recommendedFacilityCount} Regional Facilities
              </div>
              <p className="text-[11px] text-teal-300 mt-0.5">
                {simulationResult.recommendation.requiredRecyclingCapacityKtYr} kt/yr capacity ({simulationResult.recommendation.recommendedFacilityTier} tier)
              </p>
            </div>

            <div className="p-2.5 rounded bg-slate-900/70 border border-teal-800/40">
              <span className="text-[10px] text-slate-400 font-mono">2. Technology Pathway</span>
              <div className="font-bold text-teal-200 text-sm mt-0.5">
                {simulationResult.recommendation.technologyName.split(' ')[0]} Hybrid Line
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Al frame + intact glass + 94% silver recovery
              </p>
            </div>

            <div className="p-2.5 rounded bg-slate-900/70 border border-teal-800/40">
              <span className="text-[10px] text-slate-400 font-mono">3. Financial Bankability</span>
              <div className="font-bold text-emerald-300 text-sm mt-0.5">
                True DCF IRR: {simulationResult.recommendation.projectIRRPct !== null ? `${simulationResult.recommendation.projectIRRPct}%` : 'Sub-hurdle'}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                NPV +₹{simulationResult.recommendation.projectNPV_Cr} Cr · ₹{simulationResult.recommendation.netMarginPerTonneINR.toLocaleString()}/t margin
              </p>
            </div>

            <div className="p-2.5 rounded bg-slate-900/70 border border-teal-800/40">
              <span className="text-[10px] text-slate-400 font-mono">4. Strategic Logistics</span>
              <div className="font-bold text-white text-sm mt-0.5">
                Hub-and-Spoke Topology
              </div>
              <p className="text-[11px] text-teal-300 mt-0.5">
                Avg haul {simulationResult.recommendation.avgTransportHaulKm} km · INA 700+ partner network
              </p>
            </div>
          </div>

          {/* Bulleted synthesis */}
          <div className="pt-2 border-t border-teal-800/40 text-[11px] text-slate-200 space-y-1 font-sans">
            {simulationResult.recommendation.executiveSummaryBullets.slice(0, 3).map((b, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-teal-400 font-bold shrink-0">•</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FLEET MASS CONSERVATION IDENTITY & 4 KPIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono tabular-nums">
          <div className="p-3 rounded bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 text-[10px] block">Fleet Stock-Flow Balance:</span>
            <div className="text-sm font-bold text-teal-300 mt-0.5">
              {simulationResult.reconciliation.activeOperatingFleetGW.toFixed(1)} GW Active
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              {simulationResult.reconciliation.totalInstalledToDateGW.toFixed(1)} GW Installed ({simulationResult.reconciliation.isBalanced ? 'Balanced ✓' : 'Discrepancy'})
            </div>
          </div>

          <div className="p-3 rounded bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 text-[10px] block">2040 Cumulative Waste:</span>
            <div className="text-sm font-bold text-white mt-0.5">{m2040} {unitLabel}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">2030: {m2030} · 2050: {m2050}</div>
          </div>

          <div className="p-3 rounded bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 text-[10px] block">Facility Demand (2040):</span>
            <div className="text-sm font-bold text-white mt-0.5">
              ~{simulationResult.infrastructure.requiredPlants2040} Regional Plants
            </div>
            <div className="text-[10px] text-teal-300 mt-0.5">
              Indicative planning estimate
            </div>
          </div>

          <div className="p-3 rounded bg-slate-800/60 border border-slate-700/60">
            <span className="text-slate-400 text-[10px] block">DCF Net Economics:</span>
            <div className="text-sm font-bold text-emerald-300 mt-0.5">
              ₹{simulationResult.economics.netMarginPerTonneINR.toLocaleString()}/t
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Payback: ~{simulationResult.economics.paybackPeriodYears !== null ? `${simulationResult.economics.paybackPeriodYears}y` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Technical Stock-Flow Conservation Badge */}
        <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-teal-400 font-bold uppercase text-[9px] bg-slate-900 px-1.5 py-0.5 rounded border border-teal-800">
              Stock-Flow Reconciliation
            </span>
            <span>
              {simulationResult.reconciliation.reconciliationIdentityFormula}
            </span>
          </div>
          <span className="text-teal-300 text-[10px]">
            Damage evaluated strictly on active operating fleet
          </span>
        </div>
      </div>

      {/* 3. EXPLORE DETAILED ANALYSIS (Section 9 Requirement) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Deep-Dive Modules
            </span>
            <h3 className="text-sm font-bold text-slate-900 mt-0.5">
              Explore Detailed Analysis
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            6 Specialized Intelligence Consoles
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div 
            onClick={() => onNavigate('forecast')}
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-600 hover:shadow-xs transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 group-hover:text-teal-700 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                <span>Waste Forecast Engine</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Discrete Weibull cohort retirement curves from 2025 through 2050 with baseline scenario comparison.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('network')}
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-600 hover:shadow-xs transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 group-hover:text-indigo-700 flex items-center gap-1.5">
                <Factory className="w-3.5 h-3.5 text-indigo-600" />
                <span>Network & Facility Planning</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-700 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Regional hub capacity sizing (3.6k, 10k, 30k, 60k t/yr) and geospatial India collection topology.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('economics')}
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-600 hover:shadow-xs transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 group-hover:text-emerald-700 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                <span>Circularity Economics</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Interactive waterfall breakdown of recovered mineral revenues, logistics tariffs, processing OpEx, and IRR.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('materials')}
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-amber-600 hover:shadow-xs transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 group-hover:text-amber-700 flex items-center gap-1.5">
                <Atom className="w-3.5 h-3.5 text-amber-600" />
                <span>Material Recovery Pathways</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Elemental reclamation yields (Glass, Al, Ag, Si, Cu), purity thresholds, and downcycling risk prevention.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('logistics')}
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-sky-600 hover:shadow-xs transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 group-hover:text-sky-700 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-sky-600" />
                <span>Reverse Logistics Console</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-700 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Consignment dispatch, electronic manifests, and INA 700+ partner spoke aggregation network.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('policy')}
            className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-800 hover:shadow-xs transition-all cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 group-hover:text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>Policy & Compliance</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Strict provenance comparison: Enacted E-Waste Rules 2022 vs SolarLoop EPR proposals vs simulation scenarios.
            </p>
          </div>
        </div>

        {/* Collapsible Underlying Assumptions & Calibration */}
        <div className="border border-slate-200 rounded-lg overflow-hidden mt-4">
          <button
            type="button"
            onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
            className="w-full px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-teal-700" />
              <span>Underlying Model Assumptions & Research Calibration</span>
            </div>
            {showAdvancedDetails ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {showAdvancedDetails && (
            <div className="px-4 pb-4 pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-3 font-mono text-[11px]">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-teal-800 block">Calibration Status:</span>
                <p className="text-slate-700 font-sans text-xs mt-0.5">
                  {simulationResult.calibration.calibrationNote}
                </p>
                <div className="flex gap-4 mt-2 text-[10px] text-slate-500">
                  <span>Research 2040 Benchmark: {simulationResult.calibration.ref2040} kt</span>
                  <span>Model Active Output: {simulationResult.milestones.cumulative2040Kt} kt</span>
                  <span>Delta: {simulationResult.calibration.diffPct > 0 ? `+${simulationResult.calibration.diffPct}%` : `${simulationResult.calibration.diffPct}%`}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-[10px]">Annual Additions:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{scenarioParams.annualSolarAdditionsGW} GW/year</div>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-[10px]">Module Mass:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{scenarioParams.moduleMassKg} kg / module</div>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-[10px]">Design Life & Shape:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{scenarioParams.designLifeYears} yrs (Weibull β={scenarioParams.weibullBeta})</div>
                </div>
                <div className="p-2 rounded bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 text-[10px]">Early Loss Rate:</span>
                  <div className="font-bold text-slate-900 mt-0.5">{scenarioParams.earlyLossRatePct}% total attrition</div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 font-sans italic pt-1">
                Deterministic mathematical engine. Research baseline citations: CEEW, MNRE, and National E-Waste Rules 2022.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
