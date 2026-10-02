import React, { useState } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { LogisticsBatch, WasteStreamType } from '../../types';
import { DataProvenanceBadge } from '../common/DataProvenanceBadge';
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  ArrowRight, 
  X,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

export const ReverseLogisticsView: React.FC = () => {
  const { batches, addBatch, updateBatchStatus, inaNetworkMode } = useScenario();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<LogisticsBatch | null>(batches[0] || null);
  const [isNewBatchOpen, setIsNewBatchOpen] = useState(false);

  // New batch form state
  const [form, setForm] = useState({
    origin: '',
    originType: 'Asset Site' as LogisticsBatch['originType'],
    state: 'Rajasthan',
    destinationHub: 'Bhadla - Jodhpur Mega Circular Hub',
    moduleQuantity: 1000,
    streamType: 'early_failure' as WasteStreamType,
    carrier: 'EcoFreights Logistics India'
  });

  const stages: LogisticsBatch['status'][] = [
    'Registered',
    'Collected',
    'Aggregated',
    'In Transit',
    'Received',
    'Processed',
    'Materials Recovered'
  ];

  const filteredBatches = batches.filter(b => {
    const matchSearch = b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.destinationHub.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const estMass = Number(((form.moduleQuantity * 22) / 1000).toFixed(1));
    const newB: LogisticsBatch = {
      id: `RLB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      origin: form.origin || 'Decommissioning Substation Yard',
      originType: form.originType,
      state: form.state,
      destinationHub: form.destinationHub,
      moduleQuantity: form.moduleQuantity,
      estimatedMassTonnes: estMass,
      streamType: form.streamType,
      status: 'Registered',
      collectionDate: new Date().toISOString().split('T')[0],
      transportStage: 'Initial electronic manifest generated; consignment awaits carrier pickup',
      carrier: form.carrier,
      trackingNumber: `TRK-SL-${Math.floor(100000 + Math.random() * 900000)}`,
      isDemo: true
    };

    addBatch(newB);
    setSelectedBatch(newB);
    setIsNewBatchOpen(false);
  };

  const advanceStatus = (b: LogisticsBatch) => {
    const currIdx = stages.indexOf(b.status);
    if (currIdx < stages.length - 1) {
      const nextStatus = stages[currIdx + 1];
      updateBatchStatus(b.id, nextStatus);
      setSelectedBatch(prev => prev?.id === b.id ? { ...prev, status: nextStatus } : prev);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Reverse Logistics & Consignment Tracking Console
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Chain-of-custody tracking across collection spokes, district consolidation yards, and regional delamination hubs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DataProvenanceBadge tier="DEMO SCENARIO" sourceText="Synthetic test consignments for operational simulation" />
          <button
            type="button"
            onClick={() => setIsNewBatchOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Generate Consignment</span>
          </button>
        </div>
      </div>

      {/* Synthetic Data Alert Banner */}
      <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg flex items-center gap-2.5 text-xs text-rose-900">
        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
        <span>
          <strong>Demo scenario notice:</strong> Records displayed in this view are synthetic simulated consignments designed to validate digital chain-of-custody workflows. They are not operational manifests.
        </span>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search batch ID, origin, hub..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Stages</option>
            {stages.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing <span className="font-semibold text-slate-900">{filteredBatches.length}</span> consignments
        </div>
      </div>

      {/* Grid: Batches Table & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Batch ID</th>
                  <th className="py-2.5 px-3">Origin / Spoke</th>
                  <th className="py-2.5 px-3">Destination Hub</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3 text-right">Mass (t)</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono tabular-nums">
                {filteredBatches.map((b) => {
                  const isSelected = selectedBatch?.id === b.id;
                  const isFinal = b.status === 'Materials Recovered';

                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBatch(b)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-teal-50/70 border-l-4 border-l-teal-700' : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{b.id}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-800">
                        <div className="truncate max-w-[170px]">{b.origin}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{b.originType} · {b.state}</div>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-700 truncate max-w-[150px]">
                        {b.destinationHub}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                        {b.moduleQuantity.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-teal-800">
                        {b.estimatedMassTonnes}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="text-teal-800 font-medium text-[11px]">{b.status}</span>
                      </td>
                      <td className="py-2.5 px-3 font-sans" onClick={(e) => e.stopPropagation()}>
                        {!isFinal ? (
                          <button
                            type="button"
                            onClick={() => advanceStatus(b)}
                            className="px-2 py-0.5 text-[10px] font-mono text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200"
                          >
                            Advance
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">Archived</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Batch Pipeline Telemetry */}
        <div className="lg:col-span-4 space-y-4">
          {selectedBatch ? (
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-mono text-teal-700 font-semibold uppercase tracking-wider">
                  Consignment Chain of Custody
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{selectedBatch.id}</h3>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Tracking: {selectedBatch.trackingNumber} · Carrier: {selectedBatch.carrier}
                </div>
              </div>

              {/* Status Stepper */}
              <div>
                <div className="text-xs font-semibold text-slate-700 mb-2">Workflow Progression:</div>
                <div className="space-y-1.5 font-mono text-xs">
                  {stages.map((st, idx) => {
                    const currentIdx = stages.indexOf(selectedBatch.status);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div
                        key={st}
                        className={`flex items-center gap-2 p-1.5 rounded ${
                          isCurrent
                            ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200'
                            : isPassed
                            ? 'text-slate-700'
                            : 'text-slate-300'
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                            isCurrent
                              ? 'bg-teal-700 text-white'
                              : isPassed
                              ? 'bg-slate-300 text-slate-700'
                              : 'bg-slate-100 text-slate-300'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span className="text-[11px]">{st}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transport Telemetry Note */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="text-slate-500 text-[10px] font-mono uppercase">Current Transport Milestone:</div>
                <div className="text-slate-800 font-medium">{selectedBatch.transportStage}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">Logged: {selectedBatch.collectionDate}</div>
              </div>

              {selectedBatch.status !== 'Materials Recovered' && (
                <button
                  type="button"
                  onClick={() => advanceStatus(selectedBatch)}
                  className="w-full py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Progress Consignment to Next Stage
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-xs text-slate-500">
              Select a batch to inspect consignment lifecycle.
            </div>
          )}
        </div>
      </div>

      {/* New Batch Modal */}
      {isNewBatchOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Generate Reverse-Logistics Consignment</h3>
              <button
                type="button"
                onClick={() => setIsNewBatchOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Origin Facility / Project Site</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INA Partner Spoke #219 (Jaipur) or Bhadla Block 4"
                  value={form.origin}
                  onChange={(e) => setForm({ ...form, origin: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Origin Type</label>
                  <select
                    value={form.originType}
                    onChange={(e) => setForm({ ...form, originType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                  >
                    <option value="Asset Site">Asset Site (Utility)</option>
                    <option value="Channel Partner">Channel Partner (INA / EPC)</option>
                    <option value="Disaster Area">Disaster Area (Storm / Fire)</option>
                    <option value="Repowering Project">Repowering Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Module Quantity</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    required
                    value={form.moduleQuantity}
                    onChange={(e) => setForm({ ...form, moduleQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Waste Stream Type</label>
                  <select
                    value={form.streamType}
                    onChange={(e) => setForm({ ...form, streamType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                  >
                    <option value="early_failure">Early Failure & Defects</option>
                    <option value="scheduled_eol">Scheduled End-of-Life</option>
                    <option value="repowering">Repowering Candidate</option>
                    <option value="insurance_damaged">Insurance / Cyclone Damage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Receiving Regional Hub</label>
                  <select
                    value={form.destinationHub}
                    onChange={(e) => setForm({ ...form, destinationHub: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-xs"
                  >
                    <option value="Bhadla - Jodhpur Mega Circular Hub">Bhadla (RJ)</option>
                    <option value="Charanka - Ahmedabad Western Recovery Center">Charanka (GJ)</option>
                    <option value="Tumakuru - Bengaluru Southern Hub">Tumakuru (KA)</option>
                    <option value="Madurai - Chennai Coastal Aggregator">Madurai (TN)</option>
                    <option value="Pune - Aurangabad Central Aggregation Facility">Pune (MH)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewBatchOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold"
                >
                  Create Demo Consignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
