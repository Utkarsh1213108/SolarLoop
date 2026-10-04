import React from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { UserRole } from '../../types';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Coins, 
  Atom, 
  Network, 
  Truck, 
  FileText, 
  Milestone,
  Sliders, 
  Layers, 
  FileBarChart2,
  Building2,
  HelpCircle,
  ExternalLink
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

  const primaryNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'forecast', label: 'Waste Forecast', icon: TrendingUp },
    { id: 'economics', label: 'Economics', icon: Coins },
    { id: 'materials', label: 'Material Recovery', icon: Atom },
  ];

  const secondaryNav = [
    { id: 'network', label: 'Network Planning', icon: Network },
    { id: 'logistics', label: 'Reverse Logistics', icon: Truck },
    { id: 'policy', label: 'Policy & Compliance', icon: FileText },
    { id: 'roadmap', label: 'Roadmap (2026–50)', icon: Milestone },
  ];

  const toolsNav = [
    { id: 'scenariolab', label: 'Scenario Lab', icon: Sliders },
    { id: 'assets', label: 'Asset Intelligence', icon: Layers },
    { id: 'reports', label: 'Report Generator', icon: FileBarChart2 },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-[#0F172A] text-slate-300 flex-col justify-between shrink-0 h-screen sticky top-0 border-r border-slate-800/90 select-none z-30">
      {/* Brand & Persona Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-teal-400"></span>
              <span className="font-mono tracking-wider">SOLARLOOP</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
              Decarbonization Circularity
            </div>
          </div>
        </div>

        {/* User Role Switcher */}
        <div className="px-3 pt-3 pb-2">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-lg p-2.5">
            <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-1 flex items-center justify-between">
              <span>Decision Persona</span>
              <Building2 className="w-3 h-3 text-slate-400" />
            </div>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="w-full bg-slate-900 text-xs text-slate-200 rounded border border-slate-700 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="asset_owner">Solar Asset Owner / IPP</option>
              <option value="manufacturer">Solar Manufacturer (INA Mode)</option>
              <option value="recycler">Industrial Recycler</option>
              <option value="epc_partner">EPC & Channel Partner</option>
              <option value="insurer">Insurer / Salvage Underwriter</option>
              <option value="government">Government / Policy Team</option>
            </select>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="px-3 py-2 space-y-4">
          {/* PRIMARY */}
          <div>
            <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Primary Decisions
            </div>
            <div className="space-y-0.5">
              {primaryNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECONDARY */}
          <div>
            <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Systems & Policy
            </div>
            <div className="space-y-0.5">
              {secondaryNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TOOLS */}
          <div>
            <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Analysis & Tools
            </div>
            <div className="space-y-0.5">
              {toolsNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        {/* INA Partner Mode Toggle */}
        <button
          type="button"
          onClick={() => setInaNetworkMode(!inaNetworkMode)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs border transition-colors cursor-pointer ${
            inaNetworkMode
              ? 'bg-teal-950/80 text-teal-300 border-teal-700/60'
              : 'bg-slate-800/40 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${inaNetworkMode ? 'bg-teal-400' : 'bg-slate-600'}`}></span>
            <span className="font-mono text-[11px]">INA 700+ Nodes</span>
          </div>
          <span className="text-[10px] font-mono text-teal-400">{inaNetworkMode ? 'ON' : 'OFF'}</span>
        </button>

        {/* Methodology link */}
        <button
          type="button"
          onClick={() => setIsMethodologyOpen(true)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors cursor-pointer font-mono"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Methodology Register</span>
          </span>
          <span className="text-teal-400 text-[10px]">CEEW / IRENA</span>
        </button>
      </div>
    </aside>
  );
};
