import React, { createContext, useContext, useState, useMemo } from 'react';
import { 
  UserRole, 
  ForecastScenarioId, 
  ScenarioParameters, 
  SolarAsset, 
  LogisticsBatch 
} from '../types';
import { 
  DEFAULT_SCENARIO_PARAMETERS, 
  SAMPLE_SOLAR_ASSETS, 
  DEMO_LOGISTICS_BATCHES 
} from '../data/researchBaseline';
import { run_scenario, SCENARIO_CONFIGS } from '../models/coreCalculations';

interface ScenarioContextType {
  activeScenario: ForecastScenarioId;
  setActiveScenario: (scenario: ForecastScenarioId) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  selectedState: string;
  setSelectedState: (stateCode: string) => void;
  unit: 'kt' | 'Mt';
  setUnit: (u: 'kt' | 'Mt') => void;
  inaNetworkMode: boolean;
  setInaNetworkMode: (enabled: boolean) => void;
  scenarioParams: ScenarioParameters;
  updateScenarioParam: <K extends keyof ScenarioParameters>(key: K, value: ScenarioParameters[K]) => void;
  resetScenarioParams: () => void;
  simulationResult: ReturnType<typeof run_scenario>;
  runSimulation: () => void;
  assets: SolarAsset[];
  addAsset: (asset: SolarAsset) => void;
  batches: LogisticsBatch[];
  addBatch: (batch: LogisticsBatch) => void;
  updateBatchStatus: (id: string, status: LogisticsBatch['status']) => void;
  isMethodologyOpen: boolean;
  setIsMethodologyOpen: (open: boolean) => void;
  isIntelligenceOpen: boolean;
  setIsIntelligenceOpen: (open: boolean) => void;
  aiInitialQuery: string | null;
  askIntelligence: (query: string) => void;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export const ScenarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScenario, setActiveScenarioState] = useState<ForecastScenarioId>('base_regular');
  const [userRole, setUserRole] = useState<UserRole>('asset_owner');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [unit, setUnit] = useState<'kt' | 'Mt'>('kt');
  const [inaNetworkMode, setInaNetworkMode] = useState<boolean>(false);
  const [scenarioParams, setScenarioParams] = useState<ScenarioParameters>(DEFAULT_SCENARIO_PARAMETERS);
  const [assets, setAssets] = useState<SolarAsset[]>(SAMPLE_SOLAR_ASSETS);
  const [batches, setBatches] = useState<LogisticsBatch[]>(DEMO_LOGISTICS_BATCHES);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [isIntelligenceOpen, setIsIntelligenceOpen] = useState<boolean>(false);
  const [aiInitialQuery, setAiInitialQuery] = useState<string | null>(null);

  // Compute live simulation results based on centralized scenario configuration
  const simulationResult = useMemo(() => {
    return run_scenario(scenarioParams, activeScenario);
  }, [scenarioParams, activeScenario]);

  const setActiveScenario = (scenario: ForecastScenarioId) => {
    setActiveScenarioState(scenario);
    if (SCENARIO_CONFIGS[scenario]) {
      setScenarioParams(SCENARIO_CONFIGS[scenario]);
    }
  };

  const runSimulation = () => {
    setActiveScenarioState('custom_scenario');
  };

  const updateScenarioParam = <K extends keyof ScenarioParameters>(key: K, value: ScenarioParameters[K]) => {
    setScenarioParams(prev => ({
      ...prev,
      [key]: value
    }));
    setActiveScenarioState('custom_scenario');
  };

  const resetScenarioParams = () => {
    setScenarioParams(SCENARIO_CONFIGS.base_regular);
    setActiveScenarioState('base_regular');
  };

  const askIntelligence = (query: string) => {
    setAiInitialQuery(query);
    setIsIntelligenceOpen(true);
  };

  const addAsset = (newAsset: SolarAsset) => {
    setAssets(prev => [newAsset, ...prev]);
  };

  const addBatch = (newBatch: LogisticsBatch) => {
    setBatches(prev => [newBatch, ...prev]);
  };

  const updateBatchStatus = (id: string, status: LogisticsBatch['status']) => {
    setBatches(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const value = useMemo(() => ({
    activeScenario,
    setActiveScenario,
    userRole,
    setUserRole,
    selectedState,
    setSelectedState,
    unit,
    setUnit,
    inaNetworkMode,
    setInaNetworkMode,
    scenarioParams,
    updateScenarioParam,
    resetScenarioParams,
    simulationResult,
    runSimulation,
    assets,
    addAsset,
    batches,
    addBatch,
    updateBatchStatus,
    isMethodologyOpen,
    setIsMethodologyOpen,
    isIntelligenceOpen,
    setIsIntelligenceOpen,
    aiInitialQuery,
    askIntelligence
  }), [
    activeScenario,
    userRole,
    selectedState,
    unit,
    inaNetworkMode,
    scenarioParams,
    simulationResult,
    assets,
    batches,
    isMethodologyOpen,
    isIntelligenceOpen,
    aiInitialQuery
  ]);

  return (
    <ScenarioContext.Provider value={value}>
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenario = () => {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
};
