import React, { useState } from 'react';
import { ScenarioProvider } from './context/ScenarioContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { MethodologyDrawer } from './components/common/MethodologyDrawer';
import { SolarLoopIntelligenceModal } from './components/intelligence/SolarLoopIntelligenceModal';

// Views
import { OverviewView } from './components/views/OverviewView';
import { AssetIntelligenceView } from './components/views/AssetIntelligenceView';
import { WasteForecastView } from './components/views/WasteForecastView';
import { NetworkPlanningView } from './components/views/NetworkPlanningView';
import { MaterialRecoveryView } from './components/views/MaterialRecoveryView';
import { EconomicsView } from './components/views/EconomicsView';
import { EnvironmentalImpactView } from './components/views/EnvironmentalImpactView';
import { ReverseLogisticsView } from './components/views/ReverseLogisticsView';
import { PolicyComplianceView } from './components/views/PolicyComplianceView';
import { ScenarioLabView } from './components/views/ScenarioLabView';
import { RoadmapView } from './components/views/RoadmapView';
import { ReportGeneratorView } from './components/views/ReportGeneratorView';

function MainLayout() {
  const [currentTab, setCurrentTab] = useState('overview');

  const tabTitles: Record<string, string> = {
    overview: 'Portfolio Overview',
    assets: 'Asset Intelligence',
    forecast: 'Waste Forecast Engine',
    network: 'Network Planning',
    materials: 'Material Recovery',
    economics: 'Circularity Economics',
    environment: 'Environmental Impact',
    logistics: 'Reverse Logistics',
    policy: 'Policy & Compliance',
    scenariolab: 'Scenario Lab',
    roadmap: 'National Roadmap (2026–50)',
    reports: 'Reports & Export'
  };

  const renderView = () => {
    switch (currentTab) {
      case 'overview':
        return <OverviewView onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'assets':
        return <AssetIntelligenceView />;
      case 'forecast':
        return <WasteForecastView />;
      case 'network':
        return <NetworkPlanningView />;
      case 'materials':
        return <MaterialRecoveryView />;
      case 'economics':
        return <EconomicsView />;
      case 'environment':
        return <EnvironmentalImpactView />;
      case 'logistics':
        return <ReverseLogisticsView />;
      case 'policy':
        return <PolicyComplianceView />;
      case 'scenariolab':
        return <ScenarioLabView />;
      case 'roadmap':
        return <RoadmapView />;
      case 'reports':
        return <ReportGeneratorView />;
      default:
        return <OverviewView onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden text-slate-800 antialiased font-sans">
      {/* Persistent Enterprise Sidebar */}
      <Sidebar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navigation Bar adhering to Top Bar Contract */}
        <TopHeader currentTabName={tabTitles[currentTab] || 'Overview'} />

        {/* Scrollable Content Canvas */}
        <main className="flex-1 overflow-y-auto pb-12">
          {renderView()}
        </main>
      </div>

      {/* Global Drawers & Modals */}
      <MethodologyDrawer />
      <SolarLoopIntelligenceModal />
    </div>
  );
}

export default function App() {
  return (
    <ScenarioProvider>
      <MainLayout />
    </ScenarioProvider>
  );
}
