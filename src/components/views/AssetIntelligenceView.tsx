import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { SolarAsset, AssetCategory, TechnologyType } from '../../types';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { Plus, Search, Filter, Layers, MapPin, Calendar, CheckCircle2, ChevronRight, X } from 'lucide-react';

export const AssetIntelligenceView: React.FC = () => {
  const { assets, addAsset, selectedState } = useScenario();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<SolarAsset | null>(assets[0] || null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Form State for new asset
  const [formData, setFormData] = useState({
    name: '',
    category: 'utility_scale' as AssetCategory,
    capacityMW: 100,
    technology: 'mono_perc' as TechnologyType,
    installationYear: 2021,
    moduleMassKg: 22.0,
    moduleWattageW: 400,
    state: 'Rajasthan',
    district: 'Jodhpur'
  });

  // Filter assets
  const filteredAssets = assets.filter(a => {
    const matchState = selectedState === 'ALL' || a.state.toLowerCase().includes(selectedState.toLowerCase());
    const matchCat = categoryFilter === 'all' || a.category === categoryFilter;
    const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        a.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        a.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchState && matchCat && matchSearch;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const count = Math.round((formData.capacityMW * 1000000) / formData.moduleWattageW);
    const massT = Math.round((count * formData.moduleMassKg) / 1000);
    const retirementYr = formData.installationYear + 25;

    const newAsset: SolarAsset = {
      id: `AST-IN-${formData.state.slice(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name || `${formData.district} ${formData.capacityMW}MW Solar Array`,
      category: formData.category,
      capacityMW: Number(formData.capacityMW),
      technology: formData.technology,
      installationYear: Number(formData.installationYear),
      moduleMassKg: Number(formData.moduleMassKg),
      moduleWattageW: Number(formData.moduleWattageW),
      state: formData.state,
      district: formData.district,
      status: 'Operational',
      estimatedModuleCount: count,
      totalMassTonnes: massT,
      expectedRetirementYear: retirementYr,
      coordinates: [26.0, 73.0]
    };

    addAsset(newAsset);
    setSelectedAsset(newAsset);
    setIsRegisterOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Asset Intelligence & Module Population Profiles
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Registry of utility, C&I, and distributed solar installations. Computes module counts, elemental bill-of-materials mass, and Weibull end-of-life windows.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded">
            Demo scenario · Illustrative data
          </span>
          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* Demo Data Notice Banner */}
      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-950 flex items-center justify-between">
        <span>
          <strong>Illustrative asset portfolio:</strong> Displayed solar installation records are representative demo assets configured for circularity and end-of-life modeling.
        </span>
        <span className="text-[10px] font-mono font-bold text-amber-800 uppercase">
          Demo scenario
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search assets, districts, or IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                categoryFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('utility_scale')}
              className={`px-2.5 py-1 rounded transition-colors ${
                categoryFilter === 'utility_scale' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Utility
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('rooftop_commercial')}
              className={`px-2.5 py-1 rounded transition-colors ${
                categoryFilter === 'rooftop_commercial' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              C&I Rooftop
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing <span className="font-semibold text-slate-900">{filteredAssets.length}</span> registered assets
        </div>
      </div>

      {/* Grid: Asset Table & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table Column */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Asset ID / Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Capacity</th>
                  <th className="py-2.5 px-3">Technology</th>
                  <th className="py-2.5 px-3 text-right">Commissioned</th>
                  <th className="py-2.5 px-3 text-right">Mass (t)</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;
                  return (
                    <tr
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-teal-50/70 border-l-4 border-l-teal-700' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-medium text-slate-900 font-sans">
                        <div className="font-semibold text-slate-900 truncate max-w-[200px]">{asset.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{asset.id} · {asset.district}, {asset.state}</div>
                      </td>
                      <td className="py-2.5 px-3 font-sans capitalize text-slate-600 text-[11px]">
                        {asset.category.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {asset.capacityMW} MW
                      </td>
                      <td className="py-2.5 px-3 uppercase text-[10px] text-slate-600">
                        {asset.technology.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-700">
                        {asset.installationYear}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-teal-800">
                        {asset.totalMassTonnes.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="text-slate-700 font-medium text-[11px]">{asset.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Asset Telemetry & Material Dissection */}
        <div className="lg:col-span-4 space-y-4">
          {selectedAsset ? (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-mono text-teal-700 font-semibold uppercase tracking-wider">
                  Asset Profile Inspection
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedAsset.name}</h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  {selectedAsset.id} · {selectedAsset.district}, {selectedAsset.state}
                </div>
              </div>

              {/* Core Computed Metrics */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono tabular-nums">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[10px]">Module Count</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">
                    {selectedAsset.estimatedModuleCount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500">@{selectedAsset.moduleWattageW}W rating</div>
                </div>

                <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                  <div className="text-slate-400 text-[10px]">Total Physical Mass</div>
                  <div className="font-bold text-teal-800 text-sm mt-0.5">
                    {selectedAsset.totalMassTonnes.toLocaleString()} t
                  </div>
                  <div className="text-[10px] text-slate-500">@{selectedAsset.moduleMassKg} kg/module</div>
                </div>
              </div>

              {/* Expected Retirement Horizon */}
              <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-lg text-xs">
                <div className="flex items-center justify-between font-semibold text-amber-900">
                  <span>Scheduled EoL Window</span>
                  <span className="font-mono">{selectedAsset.expectedRetirementYear}</span>
                </div>
                <div className="text-[11px] text-amber-950/80 mt-1">
                  Based on 25-year operational lifecycle. Early-loss attrition estimated at ~0.5% per annum beginning Year 4.
                </div>
              </div>

              {/* Elemental Bill of Materials for this Asset */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Elemental Mass Breakdown (Estimated)
                </h4>
                <div className="space-y-1.5 text-xs font-mono tabular-nums">
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-sans">Glass (74.2%):</span>
                    <span className="font-semibold text-slate-900">
                      {Math.round(selectedAsset.totalMassTonnes * 0.742).toLocaleString()} t
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-sans">Aluminium Frames (10.3%):</span>
                    <span className="font-semibold text-teal-800">
                      {Math.round(selectedAsset.totalMassTonnes * 0.103).toLocaleString()} t
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-sans">Silicon Metallurgical (3.35%):</span>
                    <span className="font-semibold text-slate-900">
                      {Math.round(selectedAsset.totalMassTonnes * 0.0335).toLocaleString()} t
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-100">
                    <span className="text-slate-600 font-sans">Copper Ribbon (0.57%):</span>
                    <span className="font-semibold text-slate-900">
                      {(selectedAsset.totalMassTonnes * 0.0057).toFixed(1)} t
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600 font-sans">Silver (0.006% / 60 ppm):</span>
                    <span className="font-semibold text-teal-700">
                      {Math.round(selectedAsset.totalMassTonnes * 0.00006 * 1000).toLocaleString()} kg
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
              Select an asset from the table to inspect circularity profile.
            </div>
          )}
        </div>
      </div>

      {/* Asset Registration Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Register Solar PV Asset</h3>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Asset / Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jodhpur Phase III Solar Park"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Capacity (MW)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.capacityMW}
                    onChange={(e) => setFormData({ ...formData, capacityMW: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Commissioning Year</label>
                  <input
                    type="number"
                    min="2010"
                    max="2030"
                    required
                    value={formData.installationYear}
                    onChange={(e) => setFormData({ ...formData, installationYear: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Module Rating (Watt)</label>
                  <input
                    type="number"
                    min="200"
                    max="750"
                    value={formData.moduleWattageW}
                    onChange={(e) => setFormData({ ...formData, moduleWattageW: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Module Mass (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="15"
                    max="35"
                    value={formData.moduleMassKg}
                    onChange={(e) => setFormData({ ...formData, moduleMassKg: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 text-xs"
                  >
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold"
                >
                  Save & Ingest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
