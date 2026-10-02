import React from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { X, ExternalLink, ShieldCheck, Database, FileSpreadsheet, AlertTriangle, Cpu } from 'lucide-react';

export const MethodologyDrawer: React.FC = () => {
  const { isMethodologyOpen, setIsMethodologyOpen } = useScenario();

  if (!isMethodologyOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end transition-opacity duration-200">
      <div 
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden transform transition-transform duration-300"
        role="dialog"
        aria-modal="true"
        aria-labelledby="methodology-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h2 id="methodology-title" className="text-base font-semibold text-slate-900 tracking-tight">
              Data Provenance & Calculation Methodology
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-mono">
              <span>SolarLoop Engine v2.4.1</span>
              <span aria-hidden="true">·</span>
              <span>Updated October 2026</span>
              <span aria-hidden="true">·</span>
              <span>Deterministic Core</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMethodologyOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Close methodology drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 text-sm text-slate-700">
          {/* Classification Framework */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              01. Information Classification Framework
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-3.5 border border-emerald-200 bg-emerald-50/40 rounded-lg">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-emerald-800 uppercase">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  VERIFIED SOURCE
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Data points drawn directly from peer-reviewed energy research (CEEW, MNRE annual reports, Central Electricity Authority, and the SolarPV Circularity Dossier). Example: INA Solar's 700+ channel partners and aluminium extrusion facilities.
                </p>
              </div>

              <div className="p-3.5 border border-teal-200 bg-teal-50/40 rounded-lg">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-teal-800 uppercase">
                  <Cpu className="w-4 h-4 text-teal-600 shrink-0" />
                  MODEL OUTPUT
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Computed deterministically via SolarLoop's closed-form algorithms using published baseline input assumptions. Never generated via stochastic text models.
                </p>
              </div>

              <div className="p-3.5 border border-amber-200 bg-amber-50/40 rounded-lg">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-amber-800 uppercase">
                  <FileSpreadsheet className="w-4 h-4 text-amber-600 shrink-0" />
                  USER ASSUMPTION / SCENARIO LAB
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Hypothetical parameters adjusted via Scenario Lab controls (e.g. custom EPR fee rates, transport freight index, silver prices) to perform sensitivity testing.
                </p>
              </div>

              <div className="p-3.5 border border-rose-200 bg-rose-50/40 rounded-lg">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-rose-800 uppercase">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  DEMO SCENARIO
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  Synthetic test records generated exclusively to demonstrate operational workflows (such as individual reverse-logistics consignment tracking numbers). Clearly marked so as not to be confused with operational manifests.
                </p>
              </div>
            </div>
          </div>

          {/* Research Baseline Reference Values */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              02. Baseline Waste Model Trajectory
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Horizon</th>
                    <th className="py-2.5 px-3 text-right">Base Regular</th>
                    <th className="py-2.5 px-3 text-right">Base Early-Loss</th>
                    <th className="py-2.5 px-3 text-right">Conservative Reg.</th>
                    <th className="py-2.5 px-3 text-right">Conservative E.L.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-slate-800">2030</td>
                    <td className="py-2 px-3 text-right">503 kt</td>
                    <td className="py-2 px-3 text-right text-teal-700 font-semibold">839 kt</td>
                    <td className="py-2 px-3 text-right text-slate-600">397 kt</td>
                    <td className="py-2 px-3 text-right text-slate-600">727 kt</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-slate-800">2035</td>
                    <td className="py-2 px-3 text-right">1,042 kt</td>
                    <td className="py-2 px-3 text-right text-teal-700 font-semibold">2,169 kt</td>
                    <td className="py-2 px-3 text-right text-slate-600">734 kt</td>
                    <td className="py-2 px-3 text-right text-slate-600">1,739 kt</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-slate-800">2040</td>
                    <td className="py-2 px-3 text-right">2,007 kt</td>
                    <td className="py-2 px-3 text-right text-teal-700 font-semibold">4,833 kt</td>
                    <td className="py-2 px-3 text-right text-slate-600">1,466 kt</td>
                    <td className="py-2 px-3 text-right text-slate-600">3,666 kt</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-slate-800">2047</td>
                    <td className="py-2 px-3 text-right">5,658 kt</td>
                    <td className="py-2 px-3 text-right text-teal-700 font-semibold">12,108 kt</td>
                    <td className="py-2 px-3 text-right text-slate-600">4,360 kt</td>
                    <td className="py-2 px-3 text-right text-slate-600">8,449 kt</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-sans font-medium text-slate-800">2050</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">8,874 kt</td>
                    <td className="py-2 px-3 text-right font-bold text-teal-800">16,768 kt</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-700">6,756 kt</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-700">11,316 kt</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-500 italic">
              Note: Model scenario baseline from research dossier. The dossier notes that some underlying parameters and degradation curves require ongoing empirical field verification across Indian climatic zones.
            </p>
          </div>

          {/* Mathematical Formulations */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              03. Core Financial & Material Formulas
            </h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <div className="text-slate-500 mb-1 font-sans font-medium">Net Unit Processing Margin (₹/tonne):</div>
                <div className="text-slate-900 font-bold">
                  Net = Σ(m_i × η_i × P_i) + EPR_fee - (OPEX_tech + C_freight(d) + C_feedstock)
                </div>
                <div className="text-slate-500 mt-1.5 text-[11px] font-sans">
                  Where m_i is recovered element mass, η_i is technology recovery efficiency, P_i is elemental market price, and C_freight = distance × freight_rate + handling.
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                <div className="text-slate-500 mb-1 font-sans font-medium">Decarbonisation Displacement:</div>
                <div className="text-slate-900 font-bold">
                  CO2e_avoided = TotalRecoveredMass_t × 1.85 tCO2e/t
                </div>
                <div className="text-slate-500 mt-1.5 text-[11px] font-sans">
                  Derived from primary aluminium smelting displacement (approx. 11.5 tCO2e/t Al) plus solar float glass furnace emissions abatement (0.35 tCO2e/t glass).
                </div>
              </div>
            </div>
          </div>

          {/* Uncertainty Disclosures */}
          <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-lg">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              Preserved Uncertainties & Model Boundaries
            </h4>
            <ul className="mt-2 space-y-1.5 text-xs text-amber-950 list-disc list-inside">
              <li>Actual module lifetimes in India may deviate due to high UV exposure, thermal cycling, and dust abrading anti-reflective coatings.</li>
              <li>Silver recovery values fluctuate with global precious metal commodity trading spot prices.</li>
              <li>State transport crossing permits and green corridor regulations for decommissioned solar PV are currently pending final CPCB notification.</li>
              <li>INA Solar channel partner logistics capabilities represent structural network readiness, subject to regional commercial agreements.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
          <button
            type="button"
            onClick={() => setIsMethodologyOpen(false)}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
