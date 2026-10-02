import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Scale, 
  Info,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const PolicyComplianceView: React.FC = () => {
  const { setIsMethodologyOpen, askIntelligence } = useScenario();
  const [selectedRegime, setSelectedRegime] = useState<'current' | 'proposed' | 'scenario'>('proposed');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Policy, Compliance & Regulatory Architecture
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Distinguishing currently enacted statutory rules from proposed EPR mandates and scenario simulation assumptions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => askIntelligence('What changes under an EPR scenario?')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>Explain EPR Impact</span>
          </button>
        </div>
      </div>

      {/* THREE-TIER REGIME CARD SELECTOR (Section 15 Mandatory Requirement) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1: Current Policy */}
        <div
          onClick={() => setSelectedRegime('current')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedRegime === 'current'
              ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
              CURRENT POLICY · VERIFIED SOURCE
            </span>
            {selectedRegime === 'current' && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
          </div>
          <h3 className="text-sm font-bold text-slate-900 font-sans">
            E-Waste Management Rules 2022
          </h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Statutory baseline enacted by MoEFCC. Solar PV included in Schedule I. Producers must register, but module-specific recovery quotas remain unenforced.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] font-mono text-emerald-900 font-semibold">
            Status: Currently Enacted Law
          </div>
        </div>

        {/* Tier 2: SolarLoop Proposal */}
        <div
          onClick={() => setSelectedRegime('proposed')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedRegime === 'proposed'
              ? 'border-teal-700 bg-teal-50/50 shadow-xs'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-900 bg-teal-100 px-2 py-0.5 rounded border border-teal-300">
              SOLARLOOP PROPOSAL · RECOMMENDED FUTURE POLICY
            </span>
            {selectedRegime === 'proposed' && <CheckCircle2 className="w-4 h-4 text-teal-700" />}
          </div>
          <h3 className="text-sm font-bold text-slate-900 font-sans">
            Dedicated Solar Module EPR Mandate
          </h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            SolarLoop recommended policy: Mandatory 70% take-back quota by 2030, tiered EPR fee (₹2,400/t), and closed-loop glass and aluminium recovery obligations.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] font-mono text-teal-900 font-semibold">
            Status: SolarLoop strategic proposal
          </div>
        </div>

        {/* Tier 3: Scenario Assumption */}
        <div
          onClick={() => setSelectedRegime('scenario')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedRegime === 'scenario'
              ? 'border-amber-600 bg-amber-50/50 shadow-xs'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              SCENARIO ASSUMPTION · USER/MODEL INPUT
            </span>
            {selectedRegime === 'scenario' && <CheckCircle2 className="w-4 h-4 text-amber-700" />}
          </div>
          <h3 className="text-sm font-bold text-slate-900 font-sans">
            Material-Specific High-Purity Framework
          </h3>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Sensitivity modeling regime enforcing strict element-level recovery targets (80% Float Glass, 90% Silver) with variable EPR fees (₹0 – ₹5,000/t).
          </p>
          <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px] font-mono text-amber-900 font-semibold">
            Status: Scenario assumption · Model sensitivity testing
          </div>
        </div>
      </div>

      {/* Detailed Regime Telemetry View */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Regulatory Deep Dive
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">
              {selectedRegime === 'current' && 'Current Statutory Obligations (E-Waste Rules 2022)'}
              {selectedRegime === 'proposed' && 'SolarLoop Proposed EPR Architecture'}
              {selectedRegime === 'scenario' && 'Material-Specific Scenario Assumptions'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsMethodologyOpen(true)}
            className="text-xs text-teal-800 font-mono hover:underline cursor-pointer"
          >
            Review Legal Methodology
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Column 1: Take-back & Collection Obligations */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-700" />
              <span>Collection & Take-back Obligations</span>
            </div>
            {selectedRegime === 'current' ? (
              <p className="text-slate-600 leading-relaxed">
                Solar PV cells and panels are listed under Category CEEW5 of E-Waste Management Rules 2022. Producers must provide collection systems and register on the CPCB portal, but no quantitative annual take-back percentages are currently audited or penalized.
              </p>
            ) : selectedRegime === 'proposed' ? (
              <p className="text-slate-600 leading-relaxed">
                Mandatory annual collection quota starting at 60% of end-of-life generation in 2028, rising to 85% by 2035. Implements tradable EPR certificates on the CPCB portal to incentivize formal regional collection networks.
              </p>
            ) : (
              <p className="text-slate-600 leading-relaxed">
                Assumes a strict 85% mandatory take-back quota backed by an EPR fee credit of ₹2,400/t (adjustable in Scenario Lab). Simulates financial resilience if producers are held liable for 100% of recycling logistics costs.
              </p>
            )}
          </div>

          {/* Column 2: Material Recovery & Purity Requirements */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Material Recovery & Downcycling Rules</span>
            </div>
            {selectedRegime === 'current' ? (
              <p className="text-slate-600 leading-relaxed">
                No purity standards or elemental quotas are specified. Downcycling into construction aggregates or road base is legally permissible under current rules, leading to permanent loss of silver and solar-grade glass.
              </p>
            ) : selectedRegime === 'proposed' ? (
              <p className="text-slate-600 leading-relaxed">
                Mandates 75% minimum mass recovery. Prohibits crushing solar glass into road base; requires high-grade cullet reintroduction into float glass furnaces or thermal insulation. Requires certified reporting of silver extraction.
              </p>
            ) : (
              <p className="text-slate-600 leading-relaxed">
                Specifies individual minimum elemental recovery rates: 80% Float Glass, 90% Aluminium, 70% Silicon, and 90% Silver. Rewards recyclers with tiered premium EPR credits for high-purity metallurgical outputs.
              </p>
            )}
          </div>
        </div>

        {/* Clear Notice to Prevent Misunderstanding (Section 15 Requirement) */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center gap-3">
          <Info className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-slate-600 leading-relaxed">
            <strong>Transparency Notice:</strong> SolarLoop clearly separates enacted statutory law from forward-looking policy proposals. Proposed EPR fees and quotas are simulation tools for asset managers and policymakers preparing for upcoming regulatory tightening.
          </span>
        </div>
      </div>
    </div>
  );
};
