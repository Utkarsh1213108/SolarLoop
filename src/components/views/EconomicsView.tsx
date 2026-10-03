import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
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
  Sliders,
  Building2,
  Scale
} from 'lucide-react';

export const EconomicsView: React.FC = () => {
  const { 
    canonicalData,
    scenarioParams, 
    updateScenarioParam, 
    resetScenarioParams,
    canonicalEconomics,
    askIntelligence
  } = useScenario();

  const [selectedCase, setSelectedCase] = useState<'Silver_Repriced_Team_Case' | 'Published_CEEW_Chemical' | 'EPR_Floor_Bankable_Case' | 'Published_CEEW_Mechanical'>('Silver_Repriced_Team_Case');
  const [showDetailedEconomics, setShowDetailedEconomics] = useState(false);

  const econRef = canonicalData.economics_reference;
  const currentCase = econRef[selectedCase];

  // Canonical waterfall data mapped to EconomicModelOutputs interface
  const waterfallEconomics = {
    grossRecoveredValuePerTonneINR: 36759,
    logisticsCostPerTonneINR: scenarioParams.avgTransportDistanceKm * 12.0,
    processingCostPerTonneINR: selectedCase === 'Published_CEEW_Mechanical' ? 40100 : 49100,
    feedstockCostPerTonneINR: 27300,
    eprContributionPerTonneINR: selectedCase === 'EPR_Floor_Bankable_Case' ? 22000 : scenarioParams.eprFeePerTonneINR,
    netMarginPerTonneINR: currentCase.net_inr_per_tonne,
    breakEvenFeedstockPricePerTonneINR: 14959,
    annualPlantEBITDA_INR_Cr: selectedCase === 'EPR_Floor_Bankable_Case' ? 3.87 : -2.14,
    projectIRRPct: selectedCase === 'EPR_Floor_Bankable_Case' ? 18.4 : null,
    projectNPV_Cr: selectedCase === 'EPR_Floor_Bankable_Case' ? 8.4 : -15.8,
    paybackPeriodYears: selectedCase === 'EPR_Floor_Bankable_Case' ? 4.8 : null,
    ebitdaMarginPct: selectedCase === 'EPR_Floor_Bankable_Case' ? 26.5 : -12.1,
    financialAnalysis: {
      isEconomicallyAttractive: selectedCase === 'EPR_Floor_Bankable_Case',
      viabilityVerdict: selectedCase === 'EPR_Floor_Bankable_Case' ? ('COMMERCIALLY VIABLE' as const) : ('NOT ECONOMICALLY VIABLE' as const),
      attractivenessReasoning: currentCase.notes,
      projectNPV_Cr: selectedCase === 'EPR_Floor_Bankable_Case' ? 8.4 : -15.8,
      projectIRRPct: selectedCase === 'EPR_Floor_Bankable_Case' ? 18.4 : null,
      paybackPeriodYears: selectedCase === 'EPR_Floor_Bankable_Case' ? 4.8 : null,
      discountedPaybackPeriodYears: selectedCase === 'EPR_Floor_Bankable_Case' ? 5.6 : null,
      terminalValueCr: 0,
      breakEvenFeedstockINR_per_tonne: 14959,
      breakEvenEprINR_per_tonne: 5938,
      ebitdaAnnualCr: selectedCase === 'EPR_Floor_Bankable_Case' ? 3.87 : -2.14,
      ebitdaMarginPct: selectedCase === 'EPR_Floor_Bankable_Case' ? 26.5 : -12.1,
      totalCapitalInvestmentCr: 14.4,
      plantCapexCr: 14.4,
      projectLifeYears: 10,
      discountRatePct: 10.0,
      capacityUtilizationPct: 67.0,
      annualThroughputTonnes: 2412,
      dcfSchedule: []
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Circularity Economics & Policy Bankability
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Authoritative unit economics per metric tonne of solar PV waste grounded on CEEW (2025) Exhibit 25 and parametric silver sensitivity modeling.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DataProvenanceBadge tier="VERIFIED SOURCE" sourceText="CEEW (2025) / Report Exhibit 25" />
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

      {/* Case Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {(Object.entries(econRef) as [keyof typeof econRef, typeof econRef[keyof typeof econRef]][]).map(([key, item]) => {
          const isSelected = selectedCase === key;
          const isPositive = item.net_inr_per_tonne > 0;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedCase(key as any)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-teal-50/80 border-teal-600 ring-1 ring-teal-600 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-500">
                  {item.classification}
                </span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />}
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                {item.label}
              </div>
              <div className={`mt-2 text-xl font-bold font-mono tabular-nums ${
                isPositive ? 'text-teal-900' : 'text-rose-700'
              }`}>
                {item.net_inr_per_tonne > 0 ? '+' : ''}₹{item.net_inr_per_tonne.toLocaleString()}
                <span className="text-xs font-sans font-normal text-slate-500"> / t</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2">
                {item.notes}
              </p>
            </button>
          );
        })}
      </div>

      {/* Primary 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Gross Recovered Material Value */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Contained Gross Value</div>
          <div className="mt-2 text-2xl font-bold text-emerald-800 font-mono tabular-nums">
            ₹36,759
            <span className="text-xs font-sans font-normal text-slate-500"> / t</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            Aluminium + Silver + Copper + Silicon
          </div>
        </div>

        {/* Stat 2: Processing OPEX */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Processing Cost (OPEX)</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ₹{selectedCase === 'Published_CEEW_Mechanical' ? '40,100' : '49,100'}
            <span className="text-xs font-sans font-normal text-slate-500"> / t</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            {selectedCase === 'Published_CEEW_Mechanical' ? 'Mechanical shredding' : 'Thermal & hydromet route'}
          </div>
        </div>

        {/* Stat 3: Feedstock Acquisition */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Feedstock Cost</div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ₹27,300
            <span className="text-xs font-sans font-normal text-slate-500"> / t</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            45.45 modules/t @ ₹600/module
          </div>
        </div>

        {/* Stat 4: Net Processing Margin */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-slate-500 text-xs font-medium">Net Operating Margin</div>
          <div className={`mt-2 text-2xl font-bold font-mono tabular-nums ${
            currentCase.net_inr_per_tonne > 0 ? 'text-teal-900' : 'text-rose-700'
          }`}>
            {currentCase.net_inr_per_tonne > 0 ? '+' : ''}₹{currentCase.net_inr_per_tonne.toLocaleString()}
            <span className="text-xs font-sans font-normal text-slate-500"> / t</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            {selectedCase === 'EPR_Floor_Bankable_Case' ? 'Includes ₹22/kg EPR support' : 'Unsubsidised market margin'}
          </div>
        </div>
      </div>

      {/* Viability Status Banner */}
      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        currentCase.net_inr_per_tonne > 0
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          : 'bg-rose-50/80 border-rose-200 text-rose-950'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm">
            {currentCase.net_inr_per_tonne > 0 ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-700" />
            )}
            <span>
              {currentCase.net_inr_per_tonne > 0
                ? 'Commercial Bankability Achieved via EPR Policy Intervention'
                : 'Commercial Deficit — Unviable without Statutory Policy or Free Feedstock'}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
            {currentCase.notes}
          </p>
        </div>

        <button
          type="button"
          onClick={() => askIntelligence('What changes under an EPR scenario?')}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 shadow-xs shrink-0 cursor-pointer"
        >
          Inspect EPR Mechanism
        </button>
      </div>

      {/* Waterfall Visualizer */}
      <WaterfallChart economics={waterfallEconomics} title={`Per-Tonne Recycling Financial Waterfall (${currentCase.label})`} />

      {/* Capex Benchmark Panel from CEEW Exhibit 25 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Plant Capex Benchmarks (CEEW 2025 Exhibit 25)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">Standard 3,600 tpa Plant</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[10px] block">Land Acquisition (1.5 acres)</span>
            <span className="text-sm font-bold font-mono text-slate-900">₹4.75 Cr</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[10px] block">Factory Construction</span>
            <span className="text-sm font-bold font-mono text-slate-900">₹2.30 Cr</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[10px] block">Thermal/Hydromet Machinery</span>
            <span className="text-sm font-bold font-mono text-slate-900">₹7.13 Cr</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[10px] block">TSDF / Environmental Compliance</span>
            <span className="text-sm font-bold font-mono text-slate-900">₹0.20 Cr</span>
          </div>
        </div>

        <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg text-xs text-slate-700 leading-relaxed">
          <strong>National Capital Scaling:</strong> Sizing standard 3,600 tpa plants nationally implies an aggregate capital requirement of <strong>₹4,274 Cr</strong> across 299 plants at peak 2040–2050 volumes. Indigenisation of delamination autoclaves and leaching tanks offers a potential ~43% capex reduction on the machinery component.
        </div>
      </div>
    </div>
  );
};
