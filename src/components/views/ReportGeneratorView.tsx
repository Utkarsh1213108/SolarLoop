import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { generate_management_summary } from '../../models/coreCalculations';
import { PUBLISHED_EXTERNAL_CO2E_REFERENCE } from '../../models/coreCalculations';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { Printer, Copy, Check, FileText, Sparkles } from 'lucide-react';

export const ReportGeneratorView: React.FC = () => {
  const { 
    activeScenario, 
    simulationResult, 
    scenarioParams, 
    inaNetworkMode,
    askIntelligence
  } = useScenario();

  const [copied, setCopied] = useState(false);

  if (!simulationResult) {
  return (
    <div className="p-6 text-sm text-slate-500">
      Loading canonical scenario data...
    </div>
  );
}
  const managementSummary = generate_management_summary(
    activeScenario,
    simulationResult.milestones,
    simulationResult.economics,
    simulationResult.environmental
  );

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const reportText = `# SOLARLOOP — Solar Circularity Intelligence Report
Generated: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
Scenario: ${activeScenario.toUpperCase()}

## 1. Executive Summary (2-Minute Briefing)
${managementSummary}

## 2. Key Findings
• Inflection Window: Solar waste volume accelerates past 2038 as 2015–2020 additions reach retirement.
• Regional Clustering: Six states (Rajasthan, Gujarat, Karnataka, Tamil Nadu, Maharashtra, Andhra Pradesh) represent >68% of cumulative national waste.
• Economic Underpin: Recovered Aluminium frames (~10.3% of mass) and Silver paste (~0.006% of mass) generate >85% of total gross reclamation revenue.
• Logistics Imperative: Spoke aggregation within 300 km is required to keep freight costs under ₹1,500/t.

## 3. Waste Forecast
• 2030 Cumulative: ${simulationResult.milestones.cumulative2030Kt.toLocaleString()} kt
• 2040 Cumulative: ${simulationResult.milestones.cumulative2040Kt.toLocaleString()} kt
• 2050 Cumulative: ${simulationResult.milestones.cumulative2050Kt.toLocaleString()} kt
• 2040 Inflow Rate: ${simulationResult.milestones.annualFlow2040Kt.toLocaleString()} kt/year

## 4. Infrastructure Requirement
• 2040 Required Capacity: ${simulationResult.infrastructure.requiredCapacity2040KtYr.toLocaleString()} kt/year
• Required Facilities: ~${simulationResult.infrastructure.requiredPlants2040} plants (@${(scenarioParams.plantCapacityTonnesYr / 1000).toLocaleString()} kt/yr)
• Mega Hubs: ~${simulationResult.infrastructure.megaHubs2040} hubs
• Spoke Depots: ~${simulationResult.infrastructure.regionalSpokes2040} aggregation nodes

## 5. Logistics Pipeline
• Topology: Solar Asset → Collection Spoke → Regional Aggregation Yard → Recovery Facility
• Average Haul Distance: ${scenarioParams.avgTransportDistanceKm} km
• Logistics Freight Cost: ₹${simulationResult.economics.logisticsCostPerTonneINR.toLocaleString()} / tonne
• INA Partner Integration: ${inaNetworkMode ? '700+ verified channel partner spokes active' : 'Standard regional hubs'}

## 6. Technology Pathway
• Selected Technology: ${scenarioParams.technologyPathway.toUpperCase()}
• Processing OPEX: ₹${simulationResult.economics.processingCostPerTonneINR.toLocaleString()} / tonne
• Recovery Efficiency: ${scenarioParams.recoveryEfficiencyPct}% target reclamation

## 7. Material Recovery
• Glass: 74.2% (Float cullet furnace feed)
• Aluminium: 10.3% (Billet remelting into new mounting frames)
• Polymer: 11.3% (Controlled cement kiln co-processing)
• Silicon: 3.35% (Metallurgical 4N-5N solar cell feed)
• Copper: 0.57% (Cathode A copper smelting)
• Silver: 0.006% (Hydrometallurgical bullion refining)

## 8. Economics
• Potential Material Value: ₹${simulationResult.economics.grossRecoveredValuePerTonneINR.toLocaleString()} / tonne
• Processing OPEX: -₹${simulationResult.economics.processingCostPerTonneINR.toLocaleString()} / tonne
• Logistics Freight: -₹${simulationResult.economics.logisticsCostPerTonneINR.toLocaleString()} / tonne
• Feedstock Gate Price: -₹${simulationResult.economics.feedstockCostPerTonneINR.toLocaleString()} / tonne
• EPR Policy Credit: +₹${simulationResult.economics.eprContributionPerTonneINR.toLocaleString()} / tonne
• Net Operating Margin: ₹${simulationResult.economics.netMarginPerTonneINR.toLocaleString()} / tonne
• Break-Even Feedstock Price: ₹${simulationResult.economics.breakEvenFeedstockPricePerTonneINR.toLocaleString()} / tonne
• Estimated Project IRR: ${simulationResult.economics.projectIRRPct}%

## 9. Environmental Impact
• Published External Reference: ~${PUBLISHED_EXTERNAL_CO2E_REFERENCE.valueMt} Mt CO2e by ${PUBLISHED_EXTERNAL_CO2E_REFERENCE.horizonYear}; not a SolarLoop runtime calculation
• Cumulative Diverted Landfill Mass: ${simulationResult.environmental.wasteDivertedFromLandfillKt.toLocaleString()} kt
• Canonical Co-Processed Mass: ${simulationResult.environmental.coProcessedMassKt.toLocaleString()} kt
• Canonical Residual Mass: ${simulationResult.environmental.residualMassKt.toLocaleString()} kt
• Virgin Bauxite Ore Spared: Unavailable — evidence required
• Heavy Metal Safe Containment: Unavailable — evidence required

## 10. Policy & Compliance
• Current Law: E-Waste Management Rules 2022 (Generic producer registration)
• Recommended EPR Policy: 70% mandatory take-back quota by 2030; ₹2,400/t take-back incentive
• Downcycling Prevention: Mandatory glass cullet purity standard

## 11. Implementation Roadmap
• Phase 1 (2026–28): Spoke Aggregation & Mechanical Delamination Foundation
• Phase 2 (2028–32): Scale-Up with Thermal Delamination & First 8 Regional Hubs
• Phase 3 (2032–40): Industrial Hydrometallurgy & 5N Silicon Refining
• Phase 4 (2040–50): Giga-Circularity for 500 GW Net-Zero Fleet Wave

## 12. Assumptions
• Annual Solar Additions: ${scenarioParams.annualSolarAdditionsGW} GW/yr
• Module Mass Basis: ${scenarioParams.moduleMassKg} kg/module
• Early-Loss Attrition: ${scenarioParams.earlyLossRatePct}%
• Silver Market Price: ₹${scenarioParams.silverPriceINR_per_kg.toLocaleString()} / kg
• Aluminium Market Price: ₹${scenarioParams.aluminiumPriceINR_per_kg} / kg

## 13. Sources
• Central Electricity Authority (CEA) Solar Project Registry (2024)
• Ministry of New & Renewable Energy (MNRE) Capacity Additions Reports
• Research Dossier on India Solar PV End-of-Life Management (2024-2026)
• CPCB E-Waste Management Rules (2022) & Draft Solar EPR Guidance
`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 no-print">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Decision-Ready Circularity Dossier
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Executive report structured in 13 chapters for board, investor, and regulatory presentation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => askIntelligence('Summarise this analysis')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>AI Executive Briefing</span>
          </button>
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Structured Markdown'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-6 text-slate-800 text-xs leading-relaxed">
        {/* Report Top Header */}
        <div className="border-b-2 border-slate-900 pb-5 flex justify-between items-start">
          <div>
            <div className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-teal-700"></span>
              SOLARLOOP CIRCULARITY REPORT
            </div>
            <div className="text-xs text-slate-500 font-mono mt-1">
              National Solar PV Circularity, Infrastructure & Economic Assessment
            </div>
          </div>
          <div className="text-right text-[11px] font-mono text-slate-500">
            <div>Report Ref: SL-REP-2026-Q3</div>
            <div>Date: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div className="text-teal-800 font-semibold uppercase">Scenario: {activeScenario}</div>
          </div>
        </div>

        {/* Section 1: Executive Summary (<2 minutes reading time) */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            01. Executive Summary (2-Minute Briefing)
          </h2>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 leading-relaxed whitespace-pre-wrap text-[11px]">
            {managementSummary}
          </div>
        </div>

        {/* Section 2: Key Findings */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            02. Key Strategic Findings
          </h2>
          <ul className="space-y-1.5 list-disc list-inside text-slate-700">
            <li><strong>Inflection Point:</strong> Annual decommissioned PV volume surges exponentially after 2038 as earlier 2014–2020 cohorts enter design life expiry.</li>
            <li><strong>Geographic Concentration:</strong> 6 states (RJ, GJ, KA, TN, MH, AP) generate &gt;68% of cumulative volume, indicating clear sites for first-wave regional recovery hubs.</li>
            <li><strong>Value Drivers:</strong> Aluminium frames (~10.3% of mass) and Silver paste (~0.006% of mass) account for &gt;85% of total gross recovered revenue.</li>
            <li><strong>Logistics Hurdle:</strong> Transport beyond 350 km erodes margins; reverse logistics networks (such as INA's 700+ partner depots) are vital for rural and distributed assets.</li>
          </ul>
        </div>

        {/* Section 3 & 4: Waste Projections & Infrastructure Sizing */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            03. Waste Projections & Plant Sizing
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono tabular-nums">
            <div className="p-3 border border-slate-200 rounded bg-slate-50/50">
              <div className="text-slate-500 text-[10px]">2030 Cumulative</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {simulationResult.milestones.cumulative2030Kt.toLocaleString()} kt
              </div>
            </div>
            <div className="p-3 border border-slate-200 rounded bg-slate-50/50">
              <div className="text-slate-500 text-[10px]">2040 Cumulative</div>
              <div className="text-sm font-bold text-teal-800 mt-0.5">
                {simulationResult.milestones.cumulative2040Kt.toLocaleString()} kt
              </div>
            </div>
            <div className="p-3 border border-slate-200 rounded bg-slate-50/50">
              <div className="text-slate-500 text-[10px]">2040 Annual Inflow</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {simulationResult.milestones.annualFlow2040Kt.toLocaleString()} kt/yr
              </div>
            </div>
            <div className="p-3 border border-slate-200 rounded bg-slate-50/50">
              <div className="text-slate-500 text-[10px]">2040 Facilities Required</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                ~{simulationResult.infrastructure.requiredPlants2040} Plants
              </div>
            </div>
          </div>
        </div>

        {/* Section 8: Unit Economics */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            04. Unit Economics Waterfall Breakdown (₹/tonne)
          </h2>
          <table className="w-full text-left font-mono tabular-nums border border-slate-200 rounded">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-2">Financial Dimension</th>
                <th className="p-2 text-right">Value (₹/t)</th>
                <th className="p-2">Underlying Model Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-2 text-slate-800 font-sans">Gross Recovered Mineral Value</td>
                <td className="p-2 text-right font-bold text-emerald-700">
                  +₹{simulationResult.economics.grossRecoveredValuePerTonneINR.toLocaleString()}
                </td>
                <td className="p-2 text-slate-500 font-sans text-[11px]">
                  Aluminium frames (₹{scenarioParams.aluminiumPriceINR_per_kg}/kg) + Silver (₹{scenarioParams.silverPriceINR_per_kg.toLocaleString()}/kg)
                </td>
              </tr>
              <tr>
                <td className="p-2 text-slate-800 font-sans">EPR Incentive Contribution</td>
                <td className="p-2 text-right font-semibold text-teal-700">
                  +₹{simulationResult.economics.eprContributionPerTonneINR.toLocaleString()}
                </td>
                <td className="p-2 text-slate-500 font-sans text-[11px]">
                  Model scenario EPR credit contribution
                </td>
              </tr>
              <tr>
                <td className="p-2 text-slate-800 font-sans">Reverse Logistics Freight</td>
                <td className="p-2 text-right text-rose-700">
                  -₹{simulationResult.economics.logisticsCostPerTonneINR.toLocaleString()}
                </td>
                <td className="p-2 text-slate-500 font-sans text-[11px]">
                  {scenarioParams.avgTransportDistanceKm} km haul @ ₹{scenarioParams.reverseLogisticsFreightINR_per_tkm}/t-km + handling
                </td>
              </tr>
              <tr>
                <td className="p-2 text-slate-800 font-sans">Delamination & Refining OPEX</td>
                <td className="p-2 text-right text-rose-700">
                  -₹{simulationResult.economics.processingCostPerTonneINR.toLocaleString()}
                </td>
                <td className="p-2 text-slate-500 font-sans text-[11px]">
                  {scenarioParams.technologyPathway} operating expenditure
                </td>
              </tr>
              <tr className="bg-slate-50/80 font-bold border-t border-slate-300">
                <td className="p-2 text-slate-900 font-sans">Net Operating Margin / Tonne</td>
                <td className="p-2 text-right text-teal-900">
                  ₹{simulationResult.economics.netMarginPerTonneINR.toLocaleString()}
                </td>
                <td className="p-2 text-teal-800 font-sans text-[11px]">
                  Estimated Project IRR: {simulationResult.economics.projectIRRPct}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 12 & 13: Assumptions & Sources */}
        <div className="space-y-2 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            05. Core Assumptions & Verified Citations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="font-semibold text-slate-900 font-sans block mb-1">Scenario Parameters:</span>
              <ul className="space-y-0.5 text-slate-600 font-mono">
                <li>Annual Solar Additions: {scenarioParams.annualSolarAdditionsGW} GW/yr</li>
                <li>Module Mass: {scenarioParams.moduleMassKg} kg/module</li>
                <li>Early-Loss Rate: {scenarioParams.earlyLossRatePct}%</li>
                <li>Facility Throughput: {scenarioParams.plantCapacityTonnesYr.toLocaleString()} t/yr</li>
              </ul>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <span className="font-semibold text-slate-900 font-sans block mb-1">Source Provenance:</span>
              <ul className="space-y-0.5 text-slate-600 font-mono">
                <li>Research Dossier on India Solar PV End-of-Life (2024-2026)</li>
                <li>Central Electricity Authority (CEA) Solar Capacity Tracking</li>
                <li>CPCB E-Waste Management Rules (2022)</li>
                <li>INA Solar: 700+ verified channel partner reverse network</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono">
          <span>CONFIDENTIAL · GENERATED VIA SOLARLOOP SAAS</span>
          <span>PAGE 1 OF 1</span>
        </div>
      </div>
    </div>
  );
};
