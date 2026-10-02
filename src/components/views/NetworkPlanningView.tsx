import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { IndiaMap } from '../common/IndiaMap';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { STATE_SOLAR_PROFILES } from '../../data/researchBaseline';
import { calculate_required_plants, calculate_transport_cost, PLANT_CAPACITY_TIERS } from '../../models/coreCalculations';
import { PlantCapacityTier } from '../../types';
import { 
  Network, 
  Truck, 
  ShieldCheck, 
  Factory, 
  ArrowRight, 
  Sliders, 
  MapPin, 
  Info,
  Sparkles
} from 'lucide-react';

export const NetworkPlanningView: React.FC = () => {
  const { 
    inaNetworkMode, 
    setInaNetworkMode, 
    simulationResult, 
    scenarioParams, 
    updateScenarioParam,
    askIntelligence 
  } = useScenario();

  const [selectedHubCode, setSelectedHubCode] = useState<string>('RJ');
  const [capacityTier, setCapacityTier] = useState<PlantCapacityTier>('regional');

  const handleSelectTier = (tier: PlantCapacityTier) => {
    setCapacityTier(tier);
    updateScenarioParam('plantCapacityTonnesYr', PLANT_CAPACITY_TIERS[tier].capacityTonnes);
  };

  const requiredCapacityKt = simulationResult.infrastructure.requiredCapacity2040KtYr;
  const plantSizing = calculate_required_plants(requiredCapacityKt, scenarioParams.plantCapacityTonnesYr);
  const transportMetrics = calculate_transport_cost(scenarioParams.avgTransportDistanceKm, scenarioParams.reverseLogisticsFreightINR_per_tkm);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Network Planning & Recycling Capacity
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Evaluate regional facility counts, hub-and-spoke collection topology, and reverse logistics transport corridors.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DataProvenanceBadge tier="MODEL OUTPUT" sourceText="Hub-and-Spoke Logistics Optimization Model" />
          <button
            type="button"
            onClick={() => askIntelligence('What is driving recycling capacity requirements?')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>Explain Capacity Drivers</span>
          </button>
        </div>
      </div>

      {/* ONE-GLANCE REVERSE LOGISTICS PIPELINE (Section 12 Requirement) */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-semibold">
            One-Glance Reverse Logistics Pipeline
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Illustrative network design
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-mono">1. Waste Source</span>
              <div className="font-bold text-white mt-1">Solar PV Assets</div>
              <p className="text-[11px] text-slate-300 mt-0.5">Utility arrays & C&I rooftops</p>
            </div>
            <div className="text-[10px] text-teal-300 font-mono mt-2 pt-2 border-t border-slate-700/60">
              Avg haul: ~{scenarioParams.avgTransportDistanceKm} km
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-teal-400 font-mono">2. Collection</span>
              <div className="font-bold text-teal-300 mt-1">Local Aggregation Spokes</div>
              <p className="text-[11px] text-slate-300 mt-0.5">{inaNetworkMode ? '700+ INA Partner Depots' : 'District staging yards'}</p>
            </div>
            <div className="text-[10px] text-teal-300 font-mono mt-2 pt-2 border-t border-slate-700/60">
              Freight: ₹{transportMetrics.freightPerTonneINR}/t
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-mono">3. Regional Hub</span>
              <div className="font-bold text-white mt-1">Delamination Centers</div>
              <p className="text-[11px] text-slate-300 mt-0.5">6 Core Solar Clusters (RJ, GJ, KA, etc.)</p>
            </div>
            <div className="text-[10px] text-teal-300 font-mono mt-2 pt-2 border-t border-slate-700/60">
              Mechanical de-framing
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-mono">4. Recovery Facility</span>
              <div className="font-bold text-white mt-1">Material Refining</div>
              <p className="text-[11px] text-slate-300 mt-0.5">Al billet casting & glass float lines</p>
            </div>
            <div className="text-[10px] text-teal-300 font-mono mt-2 pt-2 border-t border-slate-700/60">
              Secondary supply loop
            </div>
          </div>
        </div>
      </div>

      {/* PLANT CAPACITY TRANSPARENCY SECTION (Section 8 Requirement) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Recycling Plant Capacity Sizing & Facility Count
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Research scenario assumption: transparent capacity calculation without hidden multipliers
            </p>
          </div>
          <span className="text-[11px] font-mono text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
            Research scenario assumption
          </span>
        </div>

        {/* 4 Facility Scale Selector Buttons (Section 4 Requirement) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Select Facility Scale:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(['pilot', 'small', 'regional', 'large'] as const).map((tierKey) => {
              const t = PLANT_CAPACITY_TIERS[tierKey];
              const isSelected = capacityTier === tierKey;
              return (
                <div
                  key={tierKey}
                  onClick={() => handleSelectTier(tierKey)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-teal-700 bg-teal-50/50 shadow-xs'
                      : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{t.name}</span>
                    <span className="text-[11px] font-mono font-semibold text-teal-800">
                      {t.capacityKt} kt/yr
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{t.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transparent Calculation Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono tabular-nums">
          <div>
            <span className="text-slate-400 text-[10px] uppercase">Selected Facility Size:</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              {plantSizing.plantCapacityTonnesYr.toLocaleString()} tonnes / year
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">({plantSizing.plantCapacityKtYr} kt/year scale)</div>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] uppercase">2040 Required Capacity:</span>
            <div className="text-base font-bold text-teal-900 mt-0.5">
              {plantSizing.requiredCapacityTonnesYr.toLocaleString()} tonnes / year
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">({requiredCapacityKt} kt/year annual waste inflow)</div>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] uppercase">Indicative Facility Count:</span>
            <div className="text-base font-bold text-slate-900 mt-0.5">
              ~{plantSizing.totalPlants} Facilities
            </div>
            <div className="text-[10px] text-teal-700 mt-0.5 font-semibold">
              {plantSizing.resultLabel}
            </div>
          </div>
        </div>

        {/* Formula Explanation (Section 4 Requirement) */}
        <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-lg text-xs font-mono text-teal-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-700 shrink-0" />
            <span>
              <strong>Formula:</strong> {plantSizing.formulaExplanation}
            </span>
          </div>
          <span className="text-[11px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded border border-teal-300">
            {plantSizing.resultLabel}
          </span>
        </div>
      </div>

      {/* GEOSPATIAL MAP & INA REVERSE NETWORK OVERLAY */}
      <IndiaMap onSelectState={(code) => setSelectedHubCode(code === 'ALL' ? 'RJ' : code)} />

      {/* INA REVERSE NETWORK NOTICE (Section 13 Requirement) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              INA Reverse Network Architecture
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Illustrative network design
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
          INA Solar has <strong>700+ verified channel partners</strong> across tier-1, tier-2, and rural industrial clusters in India. Under this model scenario, partner warehouses function as potential module drop-off and aggregation spokes for rooftop and commercial solar decommissioning, reducing the need for costly greenfield logistics depots.
        </p>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600">
          Flow: Solar Asset → INA Channel Partner Spoke → Regional Aggregation Yard → Regional Recovery Hub
        </div>

        <div className="text-[10px] text-slate-400 font-mono italic">
          Transparency Notice: Channel partner locations and logistics flows represent an illustrative network design for strategic planning. No synthetic partner records or fictional performance data are represented as live operational telemetry.
        </div>
      </div>
    </div>
  );
};
