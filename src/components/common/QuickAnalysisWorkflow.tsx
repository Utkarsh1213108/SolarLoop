import React, { useState } from 'react';

import { useScenario } from '../../context/ScenarioContext';

import { 

  TrendingUp, 

  Factory, 

  Atom, 

  Coins, 

  Truck, 

  Leaf, 

  ArrowRight, 

  ChevronDown, 

  ChevronUp, 

  CheckCircle2, 

  Sliders, 

  Sparkles,

  Info,

  RotateCcw

} from 'lucide-react';

import { PlantCapacityTier } from '../../types';

import { PUBLISHED_EXTERNAL_CO2E_REFERENCE } from '../../models/coreCalculations';



export type AnalysisType = 

  | 'forecast' 

  | 'capacity' 

  | 'pathway' 

  | 'economics' 

  | 'logistics' 

  | 'environment';



interface QuickAnalysisWorkflowProps {

  onNavigate: (tab: string) => void;

  defaultType?: AnalysisType;

  title?: string;

}



export const QuickAnalysisWorkflow: React.FC<QuickAnalysisWorkflowProps> = ({

  onNavigate,

  defaultType = 'forecast',

  title = 'What would you like to analyse?'

}) => {

  const { 

    scenarioParams, 

    updateScenarioParam, 

    activeScenario, 

    setActiveScenario,

    simulationResult,

    unit,

    inaNetworkMode,

    setInaNetworkMode,

    askIntelligence

  } = useScenario();

  if (!simulationResult) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Loading canonical scenario data...
      </div>
    );
  }

  const result = simulationResult;



  const [selectedType, setSelectedType] = useState<AnalysisType>(defaultType);

  const [showAdvanced, setShowAdvanced] = useState(false);

  const [hasRun, setHasRun] = useState(true);



  // Analysis options config

  const analysisOptions = [

    {

      id: 'forecast' as AnalysisType,

      label: 'Forecast Waste',

      targetTab: 'forecast',

      icon: TrendingUp,

      headline: 'When will panels retire?',

      color: 'teal'

    },

    {

      id: 'capacity' as AnalysisType,

      label: 'Plan Recycling Capacity',

      targetTab: 'network',

      icon: Factory,

      headline: 'Where are facilities needed?',

      color: 'indigo'

    },

    {

      id: 'pathway' as AnalysisType,

      label: 'Evaluate Recycling Pathway',

      targetTab: 'materials',

      icon: Atom,

      headline: 'Which technology recovers max value?',

      color: 'amber'

    },

    {

      id: 'economics' as AnalysisType,

      label: 'Estimate Economics',

      targetTab: 'economics',

      icon: Coins,

      headline: 'Is recycling commercially viable?',

      color: 'emerald'

    },

    {

      id: 'logistics' as AnalysisType,

      label: 'Plan Reverse Logistics',

      targetTab: 'logistics',

      icon: Truck,

      headline: 'How do modules move efficiently?',

      color: 'sky'

    },

    {

      id: 'environment' as AnalysisType,

      label: 'Assess Environmental Impact',

      targetTab: 'environment',

      icon: Leaf,

      headline: 'How much CO2 and landfill is avoided?',

      color: 'emerald'

    }

  ];



  // Specific form states for minimal inputs

  // 1. Forecast inputs

  const [forecastHorizon, setForecastHorizon] = useState<'2030' | '2040' | '2050'>('2040');

  // 2. Capacity inputs

  const [capacityHorizon, setCapacityHorizon] = useState<'2030' | '2040'>('2040');

  const [facilityScale, setFacilityScale] = useState<PlantCapacityTier>('regional');



  // 3. Pathway inputs

  const [pathwayChoice, setPathwayChoice] = useState<'mechanical' | 'thermal' | 'chemical' | 'hybrid'>(scenarioParams.technologyPathway);



  // 4. Economics inputs

  const [localDistanceKm, setLocalDistanceKm] = useState(scenarioParams.avgTransportDistanceKm);

  const [localEprFee, setLocalEprFee] = useState(scenarioParams.eprFeePerTonneINR);

  const [localFeedstock, setLocalFeedstock] = useState(scenarioParams.feedstockCostPerTonneINR);



  // 5. Logistics inputs

  const [selectedStateFocus, setSelectedStateFocus] = useState('Rajasthan');

  const [useInaNetwork, setUseInaNetwork] = useState(inaNetworkMode);



  // Unit math

  const unitDivider = unit === 'Mt' ? 1000 : 1;

  const unitLabel = unit === 'Mt' ? 'Mt' : 'kt';



  const m2030 = (result.milestones.cumulative2030Kt / unitDivider).toLocaleString();

  const m2040 = (result.milestones.cumulative2040Kt / unitDivider).toLocaleString();

  const m2050 = (result.milestones.cumulative2050Kt / unitDivider).toLocaleString();



  // Handlers for running analysis

  const handleRunAnalysis = () => {

    setHasRun(true);

    if (selectedType === 'pathway') {

      updateScenarioParam('technologyPathway', pathwayChoice);

    } else if (selectedType === 'economics') {

      updateScenarioParam('avgTransportDistanceKm', localDistanceKm);

      updateScenarioParam('eprFeePerTonneINR', localEprFee);

      updateScenarioParam('feedstockCostPerTonneINR', localFeedstock);

    } else if (selectedType === 'capacity') {

      const cap = facilityScale === 'pilot' ? 3600 : facilityScale === 'small' ? 10000 : facilityScale === 'regional' ? 30000 : 60000;

      updateScenarioParam('plantCapacityTonnesYr', cap);

    } else if (selectedType === 'logistics') {

      setInaNetworkMode(useInaNetwork);

    }

  };



  // Get current active tab target

  const currentOption = analysisOptions.find(o => o.id === selectedType) || analysisOptions[0];



  return (

    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">

      {/* Top Header & Step 1: Select Analysis */}

      <div className="p-5 border-b border-slate-100 bg-slate-50/50">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">

          <div>

            <span className="text-[10px] font-mono uppercase tracking-wider text-teal-700 font-semibold">

              Simplified Guided Workflow

            </span>

            <h2 className="text-base font-bold text-slate-900 tracking-tight">

              {title}

            </h2>

          </div>

          <div className="flex items-center gap-2">

            <span className="text-xs text-slate-500 font-mono">Step 1 of 5</span>

            <button

              type="button"

              onClick={() => askIntelligence(`Give me an executive briefing on ${currentOption.label}`)}

              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-md border border-teal-200 transition-colors cursor-pointer"

            >

              <Sparkles className="w-3.5 h-3.5 text-teal-700" />

              <span>Ask Intelligence</span>

            </button>

          </div>

        </div>



        {/* 6 Simple Action Cards / Selector Buttons */}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">

          {analysisOptions.map((opt) => {

            const Icon = opt.icon;

            const isSelected = selectedType === opt.id;

            return (

              <button

                key={opt.id}

                type="button"

                onClick={() => {

                  setSelectedType(opt.id);

                  setHasRun(true);

                }}

                className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between cursor-pointer ${

                  isSelected

                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'

                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'

                }`}

              >

                <div className="flex items-center gap-2">

                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-teal-400' : 'text-slate-500'}`} />

                  <span className="text-xs font-semibold truncate">{opt.label}</span>

                </div>

                <div className={`text-[10px] mt-1 line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>

                  {opt.headline}

                </div>

              </button>

            );

          })}

        </div>

      </div>



      {/* Main Workflow Body: Step 2 (Minimum Inputs) & Step 3 (Run) */}

      <div className="p-5 space-y-5">

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px] font-bold font-mono">

                2

              </span>

              <span className="text-xs font-bold text-slate-900">

                Minimum Parameters ({currentOption.label})

              </span>

            </div>

            <span className="text-[11px] text-slate-500 font-mono">

              Only enter what is needed

            </span>

          </div>



          {/* Conditional Progressive Forms based on selected analysis */}

          {selectedType === 'forecast' && (

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

              <div>

                <label className="block text-slate-700 font-semibold mb-1.5">

                  1. Forecasting Scenario

                </label>

                <div className="flex rounded-md border border-slate-200 p-0.5 bg-white">

                  <button

                    type="button"

                    onClick={() => setActiveScenario('base_regular')}

                    className={`flex-1 py-1.5 px-2 rounded text-xs font-medium cursor-pointer ${

                      activeScenario === 'base_regular' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'

                    }`}

                  >

                    Regular 25y EoL

                  </button>

                  <button

                    type="button"

                    onClick={() => setActiveScenario('base_early_loss')}

                    className={`flex-1 py-1.5 px-2 rounded text-xs font-medium cursor-pointer ${

                      activeScenario === 'base_early_loss' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'

                    }`}

                  >

                    Early Loss

                  </button>

                  <button

                    type="button"

                    onClick={() => setActiveScenario('conservative_regular')}

                    className={`flex-1 py-1.5 px-2 rounded text-xs font-medium cursor-pointer ${

                      activeScenario === 'conservative_regular' ? 'bg-slate-900 text-white font-bold' : 'text-slate-600 hover:text-slate-900'

                    }`}

                  >

                    Conservative

                  </button>

                </div>

              </div>



              <div>

                <label className="block text-slate-700 font-semibold mb-1.5">

                  2. Target Milestone Horizon

                </label>

                <div className="flex rounded-md border border-slate-200 p-0.5 bg-white font-mono">

                  {(['2030', '2040', '2050'] as const).map(yr => (

                    <button

                      key={yr}

                      type="button"

                      onClick={() => setForecastHorizon(yr)}

                      className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold cursor-pointer ${

                        forecastHorizon === yr ? 'bg-teal-700 text-white font-bold' : 'text-slate-600 hover:text-slate-900'

                      }`}

                    >

                      {yr}

                    </button>

                  ))}

                </div>

              </div>

            </div>

          )}



          {selectedType === 'capacity' && (

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

              <div>

                <label className="block text-slate-700 font-semibold mb-1.5">

                  1. Target Planning Year

                </label>

                <div className="flex rounded-md border border-slate-200 p-0.5 bg-white font-mono">

                  {(['2030', '2040'] as const).map(yr => (

                    <button

                      key={yr}

                      type="button"

                      onClick={() => setCapacityHorizon(yr)}

                      className={`flex-1 py-1.5 px-2 rounded text-xs font-semibold cursor-pointer ${

                        capacityHorizon === yr ? 'bg-indigo-700 text-white font-bold' : 'text-slate-600 hover:text-slate-900'

                      }`}

                    >

                      {yr}

                    </button>

                  ))}

                </div>

              </div>



              <div>

                <label className="block text-slate-700 font-semibold mb-1.5">

                  2. Facility Capacity Tier

                </label>

                <div className="flex rounded-md border border-slate-200 p-0.5 bg-white">

                  {(['pilot', 'small', 'regional', 'large'] as const).map(scale => (

                    <button

                      key={scale}

                      type="button"

                      onClick={() => setFacilityScale(scale)}

                      className={`flex-1 py-1.5 px-2 rounded text-xs font-medium capitalize cursor-pointer ${

                        facilityScale === scale ? 'bg-indigo-700 text-white font-bold' : 'text-slate-600 hover:text-slate-900'

                      }`}

                    >

                      {scale === 'pilot' ? 'Pilot (3.6k)' : scale === 'small' ? 'Small (10k)' : scale === 'regional' ? 'Regional (30k)' : 'Large (60k)'}

                    </button>

                  ))}

                </div>

              </div>

            </div>

          )}



          {selectedType === 'pathway' && (

            <div className="space-y-2 text-xs">

              <label className="block text-slate-700 font-semibold">

                Select Recycling Technology Pathway

              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">

                {[

                  { id: 'mechanical', name: 'Mechanical Shredding', desc: 'Low CapEx, downcycles glass' },

                  { id: 'thermal', name: 'Thermal Delamination', desc: 'Clean glass, EVA burn-off' },

                  { id: 'chemical', name: 'Chemical Dissolution', desc: 'High purity, solvent recovery' },

                  { id: 'hybrid', name: 'Hybrid Delamination', desc: 'Max silver yield & frame reuse' }

                ].map(p => (

                  <button

                    key={p.id}

                    type="button"

                    onClick={() => setPathwayChoice(p.id as any)}

                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${

                      pathwayChoice === p.id 

                        ? 'border-amber-600 bg-amber-50/70 text-slate-900 font-semibold' 

                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'

                    }`}

                  >

                    <div className="font-bold text-xs">{p.name}</div>

                    <div className="text-[10px] text-slate-500 mt-0.5 font-normal">{p.desc}</div>

                  </button>

                ))}

              </div>

            </div>

          )}



          {selectedType === 'economics' && (

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">

              <div>

                <label className="block text-slate-700 font-semibold mb-1">

                  1. Average Transport Haul

                </label>

                <div className="flex items-center gap-2">

                  <input

                    type="range"

                    min="100"

                    max="800"

                    step="50"

                    value={localDistanceKm}

                    onChange={(e) => setLocalDistanceKm(Number(e.target.value))}

                    className="w-full accent-emerald-700 cursor-pointer"

                  />

                  <span className="font-mono font-bold text-slate-900 w-16 text-right">

                    {localDistanceKm} km

                  </span>

                </div>

              </div>



              <div>

                <label className="block text-slate-700 font-semibold mb-1">

                  2. Feedstock Gate Price

                </label>

                <div className="flex items-center gap-2">

                  <input

                    type="range"

                    min="0"

                    max="4000"

                    step="200"

                    value={localFeedstock}

                    onChange={(e) => setLocalFeedstock(Number(e.target.value))}

                    className="w-full accent-emerald-700 cursor-pointer"

                  />

                  <span className="font-mono font-bold text-slate-900 w-20 text-right">

                    ₹{localFeedstock}/t

                  </span>

                </div>

              </div>



              <div>

                <label className="block text-slate-700 font-semibold mb-1">

                  3. Policy EPR Credit

                </label>

                <div className="flex items-center gap-2">

                  <input

                    type="range"

                    min="0"

                    max="5000"

                    step="200"

                    value={localEprFee}

                    onChange={(e) => setLocalEprFee(Number(e.target.value))}

                    className="w-full accent-emerald-700 cursor-pointer"

                  />

                  <span className="font-mono font-bold text-slate-900 w-20 text-right">

                    ₹{localEprFee}/t

                  </span>

                </div>

              </div>

            </div>

          )}



          {selectedType === 'logistics' && (

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

              <div>

                <label className="block text-slate-700 font-semibold mb-1.5">

                  1. Solar State Cluster Focus

                </label>

                <select

                  value={selectedStateFocus}

                  onChange={(e) => setSelectedStateFocus(e.target.value)}

                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-600 focus:outline-none"

                >

                  <option value="Rajasthan">Rajasthan (Bhadla / Jodhpur Cluster)</option>

                  <option value="Gujarat">Gujarat (Charanka / Ahmedabad Cluster)</option>

                  <option value="Karnataka">Karnataka (Pavagada / Tumkur Cluster)</option>

                  <option value="Tamil Nadu">Tamil Nadu (Kamuthi / Madurai Cluster)</option>

                  <option value="Maharashtra">Maharashtra (Dhule / Shirdi Cluster)</option>

                  <option value="Andhra Pradesh">Andhra Pradesh (Ananthapuramu Cluster)</option>

                </select>

              </div>



              <div>

                <label className="block text-slate-700 font-semibold mb-1.5">

                  2. Consolidation Network Model

                </label>

                <div className="flex rounded-md border border-slate-200 p-0.5 bg-white">

                  <button

                    type="button"

                    onClick={() => setUseInaNetwork(false)}

                    className={`flex-1 py-1.5 px-2 rounded text-xs font-medium cursor-pointer ${

                      !useInaNetwork ? 'bg-sky-700 text-white font-bold' : 'text-slate-600 hover:text-slate-900'

                    }`}

                  >

                    Standard Regional Hubs

                  </button>

                  <button

                    type="button"

                    onClick={() => setUseInaNetwork(true)}

                    className={`flex-1 py-1.5 px-2 rounded text-xs font-medium cursor-pointer ${

                      useInaNetwork ? 'bg-sky-700 text-white font-bold' : 'text-slate-600 hover:text-slate-900'

                    }`}

                  >

                    INA 700+ Partner Depots

                  </button>

                </div>

              </div>

            </div>

          )}



          {selectedType === 'environment' && (

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

              <div>

                <label className="block text-slate-700 font-semibold mb-1.5">

                  Reference Assessment Basis

                </label>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-slate-800">

                  India Solar PV Circularity Dossier (National Fleet 2026–2047)

                </div>

              </div>



              <div>

                <label className="block text-slate-700 font-semibold mb-1.5">

                  Avoided CO2e Standard

                </label>

                <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-slate-800">

                  Unavailable — evidence required

                </div>

              </div>

            </div>

          )}



          {/* Collapsible Advanced Assumptions (Progressive Disclosure) */}

          <div className="pt-2 border-t border-slate-200/80">

            <button

              type="button"

              onClick={() => setShowAdvanced(!showAdvanced)}

              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer"

            >

              <Sliders className="w-3.5 h-3.5 text-teal-700" />

              <span>{showAdvanced ? 'Hide Advanced Assumptions' : 'Advanced Assumptions & Sensitivity Knobs'}</span>

              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}

            </button>



            {showAdvanced && (

              <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">

                <div>

                  <span className="text-slate-500 text-[10px] block">Annual PV Additions:</span>

                  <span className="font-bold text-slate-900">{scenarioParams.annualSolarAdditionsGW} GW / yr</span>

                </div>

                <div>

                  <span className="text-slate-500 text-[10px] block">Average Module Mass:</span>

                  <span className="font-bold text-slate-900">{scenarioParams.moduleMassKg} kg</span>

                </div>

                <div>

                  <span className="text-slate-500 text-[10px] block">Silver Market Price:</span>

                  <span className="font-bold text-slate-900">₹{scenarioParams.silverPriceINR_per_kg.toLocaleString()} / kg</span>

                </div>

              </div>

            )}

          </div>



          {/* Action Row: Step 3 (Run Analysis Button) */}

          <div className="flex items-center justify-between pt-2">

            <span className="text-[11px] text-slate-400 font-mono">

              Deterministic research engine

            </span>

            <button

              type="button"

              onClick={handleRunAnalysis}

              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"

            >

              <span>Run Analysis</span>

              <ArrowRight className="w-3.5 h-3.5" />

            </button>

          </div>

        </div>



        {/* Step 4: Executive Answer (Answering the 5 Essential Questions) */}

        {hasRun && (

          <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-4">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">

              <div className="flex items-center gap-2">

                <span className="w-5 h-5 rounded-full bg-teal-400 text-slate-900 flex items-center justify-center text-[10px] font-bold font-mono">

                  4

                </span>

                <span className="text-xs font-mono uppercase tracking-wider text-teal-400 font-bold">

                  Executive Briefing Answer

                </span>

              </div>

              <button

                type="button"

                onClick={() => onNavigate(currentOption.targetTab)}

                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-slate-900 bg-teal-400 hover:bg-teal-300 rounded-md transition-colors cursor-pointer"

              >

                <span>Step 5: Explore Detailed {currentOption.label} View</span>

                <ArrowRight className="w-3.5 h-3.5" />

              </button>

            </div>



            {/* The 5 Key Questions */}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">

              {/* Question 1: What do I need to know? */}

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">

                <div>

                  <span className="text-[10px] font-mono text-teal-400 uppercase font-semibold block">

                    1. What to know?

                  </span>

                  <p className="text-slate-200 mt-1 font-sans leading-relaxed text-[11px]">

                    {selectedType === 'forecast' && (

                      <>Cumulative PV waste in India will reach <strong className="text-white font-mono">{forecastHorizon === '2030' ? m2030 : forecastHorizon === '2040' ? m2040 : m2050} {unitLabel}</strong> by {forecastHorizon}.</>

                    )}

                    {selectedType === 'capacity' && (

                      <>India needs approximately <strong className="text-white font-mono">~{result.infrastructure.requiredPlants2040} facilities</strong> to process {result.infrastructure.requiredCapacity2040KtYr} kt/yr inflow by 2040.</>

                    )}

                    {selectedType === 'pathway' && (

              <>Hybrid delamination reclaims <strong className="text-white font-mono">&gt;92% of silver</strong> and &gt;98% un-downcycled float glass.</>

                    )}

                    {selectedType === 'economics' && (

                      <>Recycling yields a net operating margin of <strong className="text-emerald-300 font-mono">₹{result.economics.netMarginPerTonneINR.toLocaleString()}/t</strong> with {result.economics.projectIRRPct}% IRR.</>

                    )}

                    {selectedType === 'logistics' && (

                      <>{useInaNetwork ? '700+ INA partner depots cut rural consolidation freight by 35%.' : 'Six core solar states concentrate >68% of cumulative decommissioning.'}</>

                    )}

                    {selectedType === 'environment' && (

                      <>Published external reference: <strong className="text-teal-300 font-mono">~{PUBLISHED_EXTERNAL_CO2E_REFERENCE.valueMt} Mt CO2e</strong> by {PUBLISHED_EXTERNAL_CO2E_REFERENCE.horizonYear}; not a runtime calculation.</>

                    )}

                  </p>

                </div>

              </div>



              {/* Question 2: What should I do? */}

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">

                <div>

                  <span className="text-[10px] font-mono text-teal-400 uppercase font-semibold block">

                    2. What should I do?

                  </span>

                  <p className="text-slate-200 mt-1 font-sans leading-relaxed text-[11px]">

                    {selectedType === 'forecast' && 'Lock in long-term reverse logistics and off-take contracts before the 2038 inflection point.'}

                    {selectedType === 'capacity' && 'Cluster regional delamination hubs within 300 km of solar parks (Rajasthan, Gujarat, Karnataka).'}

                    {selectedType === 'pathway' && 'Specify thermal EVA separation rather than destructive shredding to preserve cullet value.'}

                    {selectedType === 'economics' && 'Integrate closed-loop aluminium extrusion to protect the ₹10,240/t gross revenue pool.'}

                    {selectedType === 'logistics' && 'Consolidate small utility and rooftop batches at district depots before dispatching full truckloads.'}

                    {selectedType === 'environment' && 'Register with CPCB to secure tradeable EPR recycling certificates and audit hazardous lead.'}

                  </p>

                </div>

              </div>



              {/* Question 3: Why? */}

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">

                <div>

                  <span className="text-[10px] font-mono text-teal-400 uppercase font-semibold block">

                    3. Why?

                  </span>

                  <p className="text-slate-200 mt-1 font-sans leading-relaxed text-[11px]">

                    {selectedType === 'forecast' && 'Early National Solar Mission projects commission 2011–2016 hit 25-year design limits.'}

                    {selectedType === 'capacity' && 'Standardizing on 30k t/yr plants maximizes equipment utilization without excessive freight radius.'}

                    {selectedType === 'pathway' && 'Silver represents only 0.006% of mass but >25% of commercial mineral value.'}

                    {selectedType === 'economics' && 'Aluminium frames and silver paste subsidize the handling of bulk glass and polymers.'}

                    {selectedType === 'logistics' && 'Un-compacted solar modules have high volume-to-weight ratios; empty transport is uneconomical.'}

                    {selectedType === 'environment' && 'Canonical recovered, co-processed, and residual masses are available; LCA factors require evidence.'}

                  </p>

                </div>

              </div>



              {/* Question 4: What will it cost? */}

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">

                <div>

                  <span className="text-[10px] font-mono text-teal-400 uppercase font-semibold block">

                    4. What will it cost?

                  </span>

                  <p className="text-slate-200 mt-1 font-sans leading-relaxed text-[11px]">

                    {selectedType === 'forecast' && <>Logistics: ~₹1,260/t · Processing: ~₹5,800/t · Recovered Value: ~₹10,240/t.</>}

                    {selectedType === 'capacity' && <>CapEx per regional plant: ~₹22 Cr · Total 2040 infrastructure CapEx: ~₹264 Cr.</>}

                    {selectedType === 'pathway' && <>OpEx: ₹{result.economics.processingCostPerTonneINR.toLocaleString()}/t · CapEx: ₹18–25 Cr per line.</>}

                    {selectedType === 'economics' && <>Break-even feedstock gate price: <strong className="text-white font-mono">₹{result.economics.breakEvenFeedstockPricePerTonneINR.toLocaleString()}/t</strong>.</>}

                    {selectedType === 'logistics' && <>Consolidation freight: <strong className="text-white font-mono">₹{result.economics.logisticsCostPerTonneINR.toLocaleString()}/t</strong> (@{scenarioParams.avgTransportDistanceKm} km).</>}

                    {selectedType === 'environment' && <>Unavailable — no defensible environmental conversion factor is configured.</>}

                  </p>

                </div>

              </div>



              {/* Question 5: What impact will it have? */}

              <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between">

                <div>

                  <span className="text-[10px] font-mono text-teal-400 uppercase font-semibold block">

                    5. What impact?

                  </span>

                  <p className="text-slate-200 mt-1 font-sans leading-relaxed text-[11px]">

                    {selectedType === 'forecast' && <>Diverts {m2040} {unitLabel} from unmonitored informal dumping.</>}

                    {selectedType === 'capacity' && <>Establishes 100% domestic recycling independence for India.</>}

                    {selectedType === 'pathway' && <>Prevents downcycling into road aggregate; feeds secondary float furnaces.</>}

                    {selectedType === 'economics' && <>Generates ₹{result.economics.annualPlantEBITDA_INR_Cr} Cr annual EBITDA per plant.</>}

                    {selectedType === 'logistics' && <>Eliminates 1,200+ tonnes of transit CO2 via reverse payload back-hauling.</>}

                    {selectedType === 'environment' && <>Canonical disposition mass is reported; bauxite and hazardous-containment impacts require evidence.</>}

                  </p>

                </div>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  );

};
