import React, { useState } from 'react';
import { IMPLEMENTATION_ROADMAP_PHASES } from '../../data/researchBaseline';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { Milestone, CheckCircle2, ArrowRight, Layers, Cpu, FileText, Database, ShieldCheck } from 'lucide-react';

export const RoadmapView: React.FC = () => {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const activePhase = IMPLEMENTATION_ROADMAP_PHASES[activePhaseIndex];

  // Professional KPI System Framework
  const kpiFramework = [
    {
      kpi: 'National Collection Rate',
      target: '> 70% by 2030, > 85% by 2040',
      category: 'Reverse Logistics',
      status: 'Watch',
      statusNote: 'Informal scrap leakages in commercial rooftop segment'
    },
    {
      kpi: 'Material Mass Recovery Rate',
      target: '> 85% mass reclamation',
      category: 'Processing Technology',
      status: 'On track',
      statusNote: 'Aluminium and coarse glass exceed 85% in mechanical trials'
    },
    {
      kpi: 'Float-Grade Glass Cullet Purity',
      target: '< 50 ppm polymer cross-contamination',
      category: 'Quality & Downcycle Prevention',
      status: 'Attention',
      statusNote: 'Thermal delamination needed to replace destructive shredders'
    },
    {
      kpi: 'Average Processing OPEX',
      target: '< ₹6,500 / tonne at scale',
      category: 'Plant Economics',
      status: 'On track',
      statusNote: 'Amortises with >25kt/yr regional hub throughput'
    },
    {
      kpi: 'Reverse Haul Cost Threshold',
      target: '< ₹1,500 / tonne (<350 km radius)',
      category: 'Logistics Freight',
      status: 'Watch',
      statusNote: 'Requires channel partner aggregation spokes (e.g. INA network)'
    },
    {
      kpi: 'Digital Chain-of-Custody Manifests',
      target: '100% electronic Form-6 completion',
      category: 'Governance & EPR',
      status: 'Attention',
      statusNote: 'CPCB national portal integration pending final API specs'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            National Implementation Roadmap & Circularity KPI Framework
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Four-phase operational transition from initial take-back pilots to giga-scale circularity infrastructure for India's 2050 solar lifecycle wave.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DataProvenanceBadge tier="MODEL OUTPUT" sourceText="Research Dossier Implementation Strategy" />
        </div>
      </div>

      {/* Four-Phase Timeline Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {IMPLEMENTATION_ROADMAP_PHASES.map((p, idx) => {
          const isSelected = activePhaseIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => setActivePhaseIndex(idx)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'border-teal-700 bg-teal-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-teal-800">{p.period}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                  isSelected ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  Phase {idx + 1}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-2 font-sans">{p.phase.split(':')[1]}</h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                {p.headline}
              </p>
            </div>
          );
        })}
      </div>

      {/* Selected Phase Detailed Pillars */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-semibold">
              Implementation Blueprint · {activePhase.period}
            </span>
            <h2 className="text-base font-bold text-slate-900 mt-0.5">{activePhase.phase}</h2>
            <div className="text-xs text-slate-500">{activePhase.headline}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Pillar 1: Infrastructure */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-700" />
              <span>Infrastructure Deployment</span>
            </div>
            <p className="text-slate-600 leading-relaxed">{activePhase.infrastructure}</p>
          </div>

          {/* Pillar 2: Technology */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-700" />
              <span>Technology & Processing Pathways</span>
            </div>
            <p className="text-slate-600 leading-relaxed">{activePhase.technology}</p>
          </div>

          {/* Pillar 3: Policy & EPR */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-700" />
              <span>Regulatory & EPR Enactments</span>
            </div>
            <p className="text-slate-600 leading-relaxed">{activePhase.policy}</p>
          </div>

          {/* Pillar 4: Digital Architecture */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5">
            <div className="font-semibold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-teal-700" />
              <span>Digital Manifests & Telemetry Systems</span>
            </div>
            <p className="text-slate-600 leading-relaxed">{activePhase.digital}</p>
          </div>
        </div>

        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs font-mono text-teal-900">
          <strong>Key Phase Milestone:</strong> {activePhase.kpis}
        </div>
      </div>

      {/* Operational KPI System Framework */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Operational KPI Monitoring Framework
            </h3>
            <div className="text-xs text-slate-500 font-mono">
              Status classifications: On Track · Watch · Attention (No fabricated values)
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Performance Dimension</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">National Target Threshold</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Field Operational Assessment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
              {kpiFramework.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 font-sans">{item.kpi}</td>
                  <td className="py-2.5 px-3 text-slate-500 font-sans">{item.category}</td>
                  <td className="py-2.5 px-3 text-slate-800">{item.target}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <span className={`px-2 py-0.5 text-[11px] rounded font-semibold ${
                      item.status === 'On track'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : item.status === 'Watch'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-sans text-[11px]">
                    {item.statusNote}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
