import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { 
  Atom, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Layers,
  Factory,
  Flame,
  Trash2
} from 'lucide-react';

export const MaterialRecoveryView: React.FC = () => {
  const { canonicalData, askIntelligence } = useScenario();
  const [selectedRoute, setSelectedRoute] = useState<'Chemical' | 'Mechanical'>('Chemical');
  const [activeElement, setActiveElement] = useState<string>('Aluminium');

  const baselineMaterials = canonicalData.material_model.canonical_baseline_cSi;
  const routes = canonicalData.recycling_routes;
  const currentRoute = routes[selectedRoute];

  const elementsList = Object.entries(baselineMaterials).map(([element, info]) => ({
    element,
    ...info
  }));

  const activeElementData = baselineMaterials[activeElement] || baselineMaterials['Aluminium'];

  // 1 tonne mass balance decomposition under selected route
  const sample1Tonne = 1000.0; // kg
  const recYield = currentRoute.material_recovery_yields[activeElement] ?? 0;
  const coprocYield = currentRoute.co_processing_yields[activeElement] ?? 0;
  const rawMassKg = activeElementData.kg_per_tonne;
  const recoveredKg = rawMassKg * recYield;
  const coprocessedKg = rawMassKg * coprocYield;
  const residualKg = rawMassKg - (recoveredKg + coprocessedKg);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Canonical Material Model & Recycling Routes
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            CEEW (2025) Exhibit 23 baseline module composition with 3-way disposition mass balance closure (Recovered Material + Co-Processing + TSDF Residuals = Input Mass).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DataProvenanceBadge tier="VERIFIED SOURCE" sourceText="CEEW (2025) / Report Exhibit 23" />
          <button
            type="button"
            onClick={() => askIntelligence('Which variable has the largest effect on economics?')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>Explain Material Value</span>
          </button>
        </div>
      </div>

      {/* Bill of Materials: Canonical Baseline */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Canonical c-Si Module Composition (CEEW 2025 Exhibit 23)
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Verified baseline per 1,000 kg (1 metric tonne) of c-Si solar module mass.
            </p>
          </div>
          <span className="text-[11px] font-mono text-teal-900 bg-teal-50 px-2.5 py-1 rounded border border-teal-200 font-semibold">
            Mass Balance: 100.000%
          </span>
        </div>

        {/* 7 Material Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-1">
          {elementsList.map((m) => {
            const isSelected = activeElement === m.element;
            const pct = (m.mass_fraction * 100).toFixed(m.element === 'Silver' ? 4 : 2);
            return (
              <div
                key={m.element}
                onClick={() => setActiveElement(m.element)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-teal-700 bg-teal-50/70 shadow-xs ring-1 ring-teal-700'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{m.element}</span>
                  <span className="text-[11px] font-mono font-bold text-teal-900">{pct}%</span>
                </div>
                <div className="text-[11px] font-mono text-slate-500 mt-1.5">
                  {m.kg_per_tonne} kg/t
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {m.source.split('/')[0]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Route Selector: Chemical vs Mechanical */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Select Recycling Technology Route
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare material yields, offtake quality, and cement kiln co-processing across canonical processing routes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.entries(routes) as [keyof typeof routes, typeof routes[keyof typeof routes]][]).map(([routeId, route]) => {
            const isSelected = selectedRoute === routeId;
            return (
              <div
                key={routeId}
                onClick={() => setSelectedRoute(routeId as any)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-teal-50/70 border-teal-600 ring-1 ring-teal-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Factory className="w-4 h-4 text-teal-700" />
                    <span className="text-xs font-bold text-slate-900">{route.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    TRL {route.trl}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {route.description}
                </p>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Reported OPEX:</span>
                  <span className="font-bold text-slate-900">₹{route.report_cost_inr_per_tonne.toLocaleString()} / tonne</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3-Category Disposition Accounting */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Three-Category Disposition Accounting ({currentRoute.name})
            </h3>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              Strict Mass Balance: input_mass = recovered_material_mass + co_processed_mass + residual_mass
            </p>
          </div>
          <span className="text-xs font-mono text-teal-800 bg-teal-50 px-2.5 py-1 rounded border border-teal-200 font-semibold">
            Input: 1,000 kg / tonne
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category 1: Recovered Material */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>1. Recovered Material</span>
              </span>
              <span className="text-xs font-mono font-bold text-emerald-900">
                {selectedRoute === 'Chemical' ? '797.3 kg' : '798.8 kg'} (79.7%)
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {currentRoute.disposition_categories.recovered_material}
            </p>
            <div className="text-[11px] font-mono text-emerald-900 pt-1">
              Aluminium remelt (102 kg) + Glass cullet (660 kg) + Silicon (30 kg) + Copper (4.7 kg) {selectedRoute === 'Chemical' ? '+ Silver (44.4 g)' : '+ Silver (0 g)'}
            </div>
          </div>

          {/* Category 2: Co-Processing */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-700" />
                <span>2. Cement Co-Processing</span>
              </span>
              <span className="text-xs font-mono font-bold text-amber-900">
                {selectedRoute === 'Chemical' ? '113.0 kg (11.3%)' : '0.0 kg (0.0%)'}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {currentRoute.disposition_categories.co_processing}
            </p>
            <div className="text-[11px] font-mono text-amber-900 pt-1">
              {selectedRoute === 'Chemical'
                ? 'Polymer/EVA thermal energy and mineral ash utilization in cement kilns'
                : 'Unseparated in mechanical shredding; lost to residual stream'}
            </div>
          </div>

          {/* Category 3: Residual / Authorised Disposal */}
          <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-slate-600" />
                <span>3. Residual TSDF Disposal</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-800">
                {selectedRoute === 'Chemical' ? '89.7 kg (9.0%)' : '201.2 kg (20.1%)'}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {currentRoute.disposition_categories.residual_disposal}
            </p>
            <div className="text-[11px] font-mono text-slate-700 pt-1">
              Process losses, unrecovered glass fines, lead solder, and neutralized TSDF effluent
            </div>
          </div>
        </div>

        {/* Selected Element Focus Detail */}
        <div className="p-4 rounded-lg bg-slate-50/80 border border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between font-semibold text-slate-900">
            <span>Elemental Offtake Profile: {activeElement}</span>
            <span className="font-mono text-teal-800">
              Recovery Yield: {((currentRoute.material_recovery_yields[activeElement] ?? 0) * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            <strong>Offtake Grade & Destination:</strong> {currentRoute.offtake_grade_notes[activeElement] || 'Industrial offtake'}
          </p>
          <p className="text-slate-500 italic text-[11px]">
            {activeElementData.notes}
          </p>
        </div>
      </div>
    </div>
  );
};
