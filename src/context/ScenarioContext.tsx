import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { 
  UserRole, 
  ForecastScenarioId, 
  ScenarioParameters, 
  SolarAsset, 
  LogisticsBatch,
  CanonicalData,
  CanonicalScenarioOutput
} from '../types';
import { 
  DEFAULT_SCENARIO_PARAMETERS, 
  SAMPLE_SOLAR_ASSETS, 
  DEMO_LOGISTICS_BATCHES 
} from '../data/researchBaseline';
import { 
  CANONICAL_SCENARIO_MAP,
  CANONICAL_SCENARIOS_META,
  getCanonicalTimeSeries,
  calculateCanonicalMaterialFlow,
  calculateCanonicalEconomics,
  setRuntimeCanonicalData
} from '../data/canonicalLoader';
import { run_scenario, SCENARIO_CONFIGS } from '../models/coreCalculations';

interface ScenarioContextType {
  canonicalData: CanonicalData;
  isLoadingCanonical: boolean;
  canonicalError: string | null;
  activeScenario: ForecastScenarioId;
  setActiveScenario: (scenario: ForecastScenarioId) => void;
  availableScenarios: Array<{
    id: ForecastScenarioId;
    name: string;
    canonicalKey: string;
    capacityPath: string;
    alpha: number;
    description: string;
    failureCurveType: 'Regular (Wear-out)' | 'Early-Loss (Premature & Handling)';
  }>;
  activeCanonicalScenario: CanonicalScenarioOutput;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  selectedState: string;
  setSelectedState: (stateCode: string) => void;
  unit: 'kt' | 'Mt';
  setUnit: (u: 'kt' | 'Mt') => void;
  horizonYear: '2030' | '2040' | '2050';
  setHorizonYear: (h: '2030' | '2040' | '2050') => void;
  inaNetworkMode: boolean;
  setInaNetworkMode: (enabled: boolean) => void;
  scenarioParams: ScenarioParameters;
  updateScenarioParam: <K extends keyof ScenarioParameters>(key: K, value: ScenarioParameters[K]) => void;
  resetScenarioParams: () => void;
  simulationResult: ReturnType<typeof run_scenario>;
  canonicalMaterialFlow: ReturnType<typeof calculateCanonicalMaterialFlow>;
  canonicalEconomics: ReturnType<typeof calculateCanonicalEconomics>;
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
  const [canonicalData, setCanonicalData] = useState<CanonicalData | null>(null);
  const [isLoadingCanonical, setIsLoadingCanonical] = useState<boolean>(true);
  const [canonicalError, setCanonicalError] = useState<string | null>(null);
  const [activeScenario, setActiveScenarioState] = useState<ForecastScenarioId>('base_regular');
  const [userRole, setUserRole] = useState<UserRole>('asset_owner');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [unit, setUnit] = useState<'kt' | 'Mt'>('kt');
  const [horizonYear, setHorizonYear] = useState<'2030' | '2040' | '2050'>('2040');
  const [inaNetworkMode, setInaNetworkMode] = useState<boolean>(false);
  const [scenarioParams, setScenarioParams] = useState<ScenarioParameters>(SCENARIO_CONFIGS.base_regular);
  const [assets, setAssets] = useState<SolarAsset[]>(SAMPLE_SOLAR_ASSETS);
  const [batches, setBatches] = useState<LogisticsBatch[]>(DEMO_LOGISTICS_BATCHES);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [isIntelligenceOpen, setIsIntelligenceOpen] = useState<boolean>(false);
  const [aiInitialQuery, setAiInitialQuery] = useState<string | null>(null);

  // Fetch live canonical data from the server endpoint on mount
  useEffect(() => {
    let isMounted = true;
    fetch('/api/canonical')
      .then(res => {
        if (!res.ok) throw new Error(`Canonical API responded with status ${res.status}`);
        return res.json();
      })
      .then((data: CanonicalData) => {
        if (isMounted && data?.forecast_outputs) {
          setRuntimeCanonicalData(data);
          setCanonicalData(data);
          setIsLoadingCanonical(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('Failed to load canonical data from /api/canonical:', err);
          setCanonicalError(err.message || 'Failed to connect to /api/canonical');
          setIsLoadingCanonical(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const availableScenarios = useMemo(() => {
    return Object.values(CANONICAL_SCENARIOS_META);
  }, []);

  const activeCanonicalScenario = useMemo<CanonicalScenarioOutput | null>(() => {
    if (!canonicalData) {
      return null;
    }
    const key = CANONICAL_SCENARIO_MAP[activeScenario] || 'Base·Regular';
    return canonicalData.forecast_outputs[key] || null;
  }, [canonicalData, activeScenario]);

  // Compute live analytical results mapped directly from canonical engine
  const simulationResult = useMemo(() => {
    return run_scenario(scenarioParams, activeScenario);
  }, [scenarioParams, activeScenario]);

  const canonicalMaterialFlow = useMemo<ReturnType<typeof calculateCanonicalMaterialFlow> | null>(() => {
    if (!activeCanonicalScenario) {
      return null;
    }
    const annual2040 = activeCanonicalScenario.milestone_years['2040'].annual_waste_kt * 1000;
    return calculateCanonicalMaterialFlow(annual2040, 'Chemical');
  }, [activeCanonicalScenario]);

  const canonicalEconomics = useMemo<ReturnType<typeof calculateCanonicalEconomics> | null>(() => {
    if (!canonicalData) {
      return null;
    }
    return calculateCanonicalEconomics({
      silverPriceINR_per_g: scenarioParams.silverPriceINR_per_kg ? scenarioParams.silverPriceINR_per_kg / 1000 : 240.0,
      haulDistanceKm: scenarioParams.avgTransportDistanceKm,
      eprCertificateINR_per_kg: scenarioParams.eprFeePerTonneINR ? scenarioParams.eprFeePerTonneINR / 1000 : 0
    });
  }, [scenarioParams]);

  const setActiveScenario = (scenario: ForecastScenarioId) => {
    setActiveScenarioState(scenario);
    if (SCENARIO_CONFIGS[scenario]) {
      setScenarioParams(SCENARIO_CONFIGS[scenario]);
    }
  };

  const runSimulation = () => {
    // Re-evaluates based on current scenario parameters
  };

  const updateScenarioParam = <K extends keyof ScenarioParameters>(key: K, value: ScenarioParameters[K]) => {
    setScenarioParams(prev => ({
      ...prev,
      [key]: value
    }));
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
    canonicalData: canonicalData!,
    isLoadingCanonical,
    canonicalError,
    activeScenario,
    setActiveScenario,
    availableScenarios,
    activeCanonicalScenario: activeCanonicalScenario!,
    userRole,
    setUserRole,
    selectedState,
    setSelectedState,
    unit,
    setUnit,
    horizonYear,
    setHorizonYear,
    inaNetworkMode,
    setInaNetworkMode,
    scenarioParams,
    updateScenarioParam,
    resetScenarioParams,
    simulationResult,
    canonicalMaterialFlow: canonicalMaterialFlow!,
    canonicalEconomics: canonicalEconomics!,
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
    canonicalData,
    isLoadingCanonical,
    canonicalError,
    activeScenario,
    availableScenarios,
    activeCanonicalScenario,
    userRole,
    selectedState,
    unit,
    horizonYear,
    inaNetworkMode,
    scenarioParams,
    simulationResult,
    canonicalMaterialFlow,
    canonicalEconomics,
    assets,
    batches,
    isMethodologyOpen,
    isIntelligenceOpen,
    aiInitialQuery
  ]);

  if (isLoadingCanonical || !canonicalData) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wide uppercase text-teal-400 font-mono">
            SolarLoop Intelligence Platform
          </span>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Connecting to canonical analytical data source (/api/canonical)...
        </p>
        {canonicalError && (
          <div className="mt-4 p-3 bg-rose-950/80 border border-rose-800 text-rose-300 text-xs rounded-lg max-w-md text-center">
            {canonicalError}
          </div>
        )}
      </div>
    );
  }

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
