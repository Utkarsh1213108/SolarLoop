import React from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { UserRole } from '../../types';
import { 
  LayoutDashboard, 
  Layers, 
  TrendingUp, 
  Network, 
  Atom, 
  Coins, 
  Leaf, 
  Truck, 
  FileText, 
  Sliders, 
  FileBarChart2, 
  Milestone,
  HelpCircle,
  Building2,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { 
    userRole, 
    setUserRole, 
    inaNetworkMode, 
    setInaNetworkMode,
    setIsMethodologyOpen,
    setIsIntelligenceOpen
  } = useScenario();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'assets', label: 'Asset Intelligence', icon: Layers },
    { id: 'forecast', label: 'Waste Forecast', icon: TrendingUp },
    { id: 'network', label: 'Network Planning', icon: Network },
    { id: 'materials', label: 'Material Recovery', icon: Atom },
    { id: 'economics', label: 'Economics', icon: Coins },
    { id: 'environment', label: 'Environmental Impact', icon: Leaf },
    { id: 'logistics', label: 'Reverse Logistics', icon: Truck },
    { id: 'policy', label: 'Policy & Compliance', icon: FileText },
    { id: 'scenariolab', label: 'Scenario Lab', icon: Sliders },
    { id: 'roadmap', label: 'Roadmap (2026–50)', icon: Milestone },
    { id: 'reports', label: 'Reports & Export', icon: FileBarChart2 },
  ];

  const roleLabels: Record<UserRole, { title: string; org: string }> = {
    manufacturer: { title: 'PV Manufacturer', org: 'INA Solar / Solar OEM' },
    asset_owner: { title: 'Asset Owner / IPP', org: 'Utility Solar Portfolio' },
    recycler: { title: 'Recycling Operator', org: 'Circular Hub Facility' },
    epc_partner: { title: 'EPC & Channel', org: 'Regional Distribution' },
    insurer: { title: 'Loss Underwriter', org: 'Claims & Salvage Desk' },
    government: { title: 'Policy & Regulator', org: 'MNRE / CPCB Compliance' }
  };

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none z-30">
      {/* Brand Zone */}
      <div>
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-teal-400"></span>
              <span>SOLARLOOP</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
              Circularity Intelligence
            </div>
          </div>
          <span className="text-[10px] font-mono text-teal-400/80 border border-teal-500/30 px-1.5 py-0.5 rounded">
            v2.4
          </span>
        </div>

        {/* User Workspace Role Switcher */}
        <div className="px-3 pt-3 pb-1">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
            <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-1 flex items-center justify-between">
              <span>Active Persona</span>
              <Building2 className="w-3 h-3 text-slate-400" />
            </div>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="w-full bg-slate-900 text-xs text-white rounded border border-slate-700 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="asset_owner">Solar Asset Owner / IPP</option>
              <option value="manufacturer">Solar Manufacturer (INA Mode)</option>
              <option value="recycler">Industrial Recycler</option>
              <option value="epc_partner">EPC & Channel Partner</option>
              <option value="insurer">Insurer / Salvage Adjuster</option>
              <option value="government">Government / Policy Team</option>
            </select>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="px-3 py-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-270px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-teal-600/15 text-teal-300 border border-teal-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Auxiliary Controls */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {/* INA 700+ Partner Mode Quick Toggle */}
        <button
          type="button"
          onClick={() => setInaNetworkMode(!inaNetworkMode)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs border transition-colors ${
            inaNetworkMode
              ? 'bg-teal-950/80 text-teal-300 border-teal-700/60'
              : 'bg-slate-800/40 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${inaNetworkMode ? 'bg-teal-400' : 'bg-slate-600'}`}></span>
            <span className="font-mono text-[11px]">INA Reverse Net</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">700+ Nodes</span>
        </button>

        {/* Methodology Drawer Trigger */}
        <button
          type="button"
          onClick={() => setIsMethodologyOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-sans">Methodology & Sources</span>
        </button>

        <div className="text-[10px] text-slate-400 font-mono px-3 pt-1">
          CEEW · MNRE · SolarLoop v2.4
        </div>
      </div>
    </aside>
  );
};
