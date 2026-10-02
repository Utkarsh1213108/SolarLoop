import { 
  MaterialCompositionItem, 
  RecyclingPathwaySpec, 
  StateWasteProfile, 
  SolarAsset, 
  LogisticsBatch,
  ScenarioParameters
} from '../types';

/**
 * SOLARLOOP RESEARCH DOSSIER BASELINE
 * Source: Research Dossier on India Solar PV End-of-Life Management & Circular Economy (2024-2026)
 * Note: Scenarios reflect model estimates from research literature; preserved with uncertainty labels.
 */

export const BASELINE_SCENARIOS = {
  base_regular: {
    name: 'Base Regular EoL',
    description: 'Scheduled end-of-life assuming 25-year operational lifetime with minimal early attrition.',
    source: 'SolarLoop model scenario (Research Dossier Baseline)',
    data: [
      { year: 2025, cumulativeKt: 180, annualKt: 28 },
      { year: 2027, cumulativeKt: 290, annualKt: 55 },
      { year: 2030, cumulativeKt: 503, annualKt: 95 },
      { year: 2033, cumulativeKt: 760, annualKt: 140 },
      { year: 2035, cumulativeKt: 1042, annualKt: 195 },
      { year: 2038, cumulativeKt: 1540, annualKt: 280 },
      { year: 2040, cumulativeKt: 2007, annualKt: 360 },
      { year: 2043, cumulativeKt: 3300, annualKt: 520 },
      { year: 2045, cumulativeKt: 4480, annualKt: 680 },
      { year: 2047, cumulativeKt: 5658, annualKt: 790 },
      { year: 2050, cumulativeKt: 8874, annualKt: 1180 },
    ]
  },
  base_early_loss: {
    name: 'Base Early-Loss',
    description: 'Accounts for manufacturing defects, transport breakage, severe weather, and PID degradation prior to Year 25.',
    source: 'SolarLoop model scenario (Research Dossier Baseline)',
    data: [
      { year: 2025, cumulativeKt: 340, annualKt: 65 },
      { year: 2027, cumulativeKt: 520, annualKt: 110 },
      { year: 2030, cumulativeKt: 839, annualKt: 175 },
      { year: 2033, cumulativeKt: 1420, annualKt: 290 },
      { year: 2035, cumulativeKt: 2169, annualKt: 440 },
      { year: 2038, cumulativeKt: 3450, annualKt: 660 },
      { year: 2040, cumulativeKt: 4833, annualKt: 890 },
      { year: 2043, cumulativeKt: 7850, annualKt: 1250 },
      { year: 2045, cumulativeKt: 10200, annualKt: 1520 },
      { year: 2047, cumulativeKt: 12108, annualKt: 1740 },
      { year: 2050, cumulativeKt: 16768, annualKt: 2150 },
    ]
  },
  conservative_regular: {
    name: 'Conservative Regular',
    description: 'High asset durability assumptions with prolonged operational life extending to 30 years.',
    source: 'SolarLoop model scenario (Conservative Variant)',
    data: [
      { year: 2025, cumulativeKt: 140, annualKt: 22 },
      { year: 2027, cumulativeKt: 220, annualKt: 42 },
      { year: 2030, cumulativeKt: 397, annualKt: 72 },
      { year: 2033, cumulativeKt: 540, annualKt: 98 },
      { year: 2035, cumulativeKt: 734, annualKt: 135 },
      { year: 2038, cumulativeKt: 1080, annualKt: 205 },
      { year: 2040, cumulativeKt: 1466, annualKt: 265 },
      { year: 2043, cumulativeKt: 2520, annualKt: 410 },
      { year: 2045, cumulativeKt: 3420, annualKt: 530 },
      { year: 2047, cumulativeKt: 4360, annualKt: 620 },
      { year: 2050, cumulativeKt: 6756, annualKt: 920 },
    ]
  },
  conservative_early_loss: {
    name: 'Conservative Early-Loss',
    description: 'Moderate early degradation combined with conservative new additions trajectory.',
    source: 'SolarLoop model scenario (Conservative Early-Loss Variant)',
    data: [
      { year: 2025, cumulativeKt: 280, annualKt: 52 },
      { year: 2027, cumulativeKt: 440, annualKt: 90 },
      { year: 2030, cumulativeKt: 727, annualKt: 150 },
      { year: 2033, cumulativeKt: 1180, annualKt: 235 },
      { year: 2035, cumulativeKt: 1739, annualKt: 340 },
      { year: 2038, cumulativeKt: 2680, annualKt: 510 },
      { year: 2040, cumulativeKt: 3666, annualKt: 680 },
      { year: 2043, cumulativeKt: 5650, annualKt: 920 },
      { year: 2045, cumulativeKt: 7120, annualKt: 1100 },
      { year: 2047, cumulativeKt: 8449, annualKt: 1220 },
      { year: 2050, cumulativeKt: 11316, annualKt: 1540 },
    ]
  }
};

/**
 * Representative 22 kg module composition
 * Note: Clearly labeled as representative module composition used in model.
 */
export const REPRESENTATIVE_MODULE_COMPOSITION: MaterialCompositionItem[] = [
  {
    element: 'Glass',
    label: 'Solar Grade Low-Iron Glass',
    percentageByMass: 74.2,
    massPerModuleKg: 16.324,
    pricePerKgINR: 14.5,
    recoveryEfficiency: {
      mechanical: 0.88,
      thermal: 0.94,
      chemical: 0.92,
      hybrid: 0.96,
    },
    circularPathway: 'Cullet / Glass float furnace remelting or foam glass insulation',
    downcycleRisk: 'Crushed into road aggregate or construction fill if cross-contaminated by polymer EVA'
  },
  {
    element: 'Polymer',
    label: 'Encapsulant (EVA) & Backsheet (PVDF/PET)',
    percentageByMass: 11.3,
    massPerModuleKg: 2.486,
    pricePerKgINR: -8.0, // Disposal / safe controlled co-processing cost
    recoveryEfficiency: {
      mechanical: 0.40,
      thermal: 0.85, // Energy recovery
      chemical: 0.70, // Solvent dissolution
      hybrid: 0.88,
    },
    circularPathway: 'Controlled pyrolysis / high-temperature cement kiln co-processing',
    downcycleRisk: 'Unregulated incineration generates hazardous fluorinated/brominated emissions'
  },
  {
    element: 'Aluminium',
    label: 'Anodized Module Frame (6000-series Al)',
    percentageByMass: 10.3,
    massPerModuleKg: 2.266,
    pricePerKgINR: 215.0,
    recoveryEfficiency: {
      mechanical: 0.98,
      thermal: 0.98,
      chemical: 0.98,
      hybrid: 0.99,
    },
    circularPathway: 'Closed-loop remelting into architectural & solar mounting extrusions (INA aluminium loop)',
    downcycleRisk: 'Secondary casting into low-spec automotive iron scrap if frame alloys cross-contaminate'
  },
  {
    element: 'Silicon',
    label: 'Solar Grade Metallurgical / Polysilicon Cells',
    percentageByMass: 3.35,
    massPerModuleKg: 0.737,
    pricePerKgINR: 180.0,
    recoveryEfficiency: {
      mechanical: 0.35,
      thermal: 0.75,
      chemical: 0.85,
      hybrid: 0.92,
    },
    circularPathway: 'Ferrosilicon alloying / chemical purification to 5N+ metallurgical solar grade',
    downcycleRisk: 'Loss into glass cullet as dust or slag'
  },
  {
    element: 'Copper',
    label: 'Busbars, Ribbon & Junction Box Wire',
    percentageByMass: 0.57,
    massPerModuleKg: 0.125,
    pricePerKgINR: 760.0,
    recoveryEfficiency: {
      mechanical: 0.82,
      thermal: 0.90,
      chemical: 0.94,
      hybrid: 0.96,
    },
    circularPathway: 'Secondary copper smelting & electrolytic refining (Cathode grade A)',
    downcycleRisk: 'Oxidation during unbuffered shredding'
  },
  {
    element: 'Silver',
    label: 'Screen-Printed Front/Back Metallization Paste',
    percentageByMass: 0.006, // ~60 ppm
    massPerModuleKg: 0.00132, // ~1.32 grams per 22 kg module
    pricePerKgINR: 88000.0, // Base assumption: ~₹88,000 / kg
    recoveryEfficiency: {
      mechanical: 0.15,
      thermal: 0.65,
      chemical: 0.88,
      hybrid: 0.94,
    },
    circularPathway: 'Hydrometallurgical nitric leaching / electrowinning bullion recovery (99.9% purity)',
    downcycleRisk: 'Permanent loss into glass tailings if mechanical crushing without delamination is used'
  },
  {
    element: 'Other',
    label: 'Junction Box Housing, Potting Silicone & Trace Inorganics',
    percentageByMass: 0.274, // Reconciles total composition to exactly 100.000%
    massPerModuleKg: 0.06028,
    pricePerKgINR: 0.0,
    recoveryEfficiency: {
      mechanical: 0.10,
      thermal: 0.50,
      chemical: 0.20,
      hybrid: 0.40,
    },
    circularPathway: 'Separation into inert non-hazardous residues / waste-to-energy co-processing',
    downcycleRisk: 'Residual landfilling if not segregated during preliminary de-framing'
  }
];

/**
 * Silver Market Sensitivity Scenarios (Volatile Commodity Modeling)
 * Label: MODEL ASSUMPTION
 */
export const SILVER_PRICE_SCENARIOS = {
  low: {
    label: 'Conservative / Bearish (₹68,000/kg)',
    pricePerKgINR: 68000,
    description: 'Reflects cyclical commodity slump or higher supply substitution'
  },
  base: {
    label: 'Base Model Assumption (₹88,000/kg)',
    pricePerKgINR: 88000,
    description: 'Long-term 2024–2026 industrial silver bullion median benchmark'
  },
  high: {
    label: 'Bullish / Supply Scarcity (₹112,000/kg)',
    pricePerKgINR: 112000,
    description: 'Elevated industrial silver deficit driven by gigawatt-scale PV demand'
  }
};

/**
 * Recycling Technology Pathways
 */
export const RECYCLING_PATHWAYS: RecyclingPathwaySpec[] = [
  {
    id: 'mechanical',
    name: 'Mechanical Delamination & Shredding',
    maturity: 'Commercially Mature',
    capexPer10ktINR_Cr: 12.5,
    opexPerTonneINR: 4200,
    glassPurity: 'Low to Moderate (70-80% clean; polymer contamination)',
    siliconRecoveryPurity: 'Metallurgical aggregate (3N-4N); broken cell fragments',
    silverRecoveryRatePct: 18.0,
    environmentalScore: 7.2,
    energyIntensityMJ_per_kg: 1.8,
    recommendedFor: 'Near-term baseline compliance; high-throughput frame and coarse glass reclamation.',
    tradeOffs: 'Low capital expenditure and simple operations, but sacrifices precious silver recovery (loses ~82% Ag) and downcycles glass into road base.'
  },
  {
    id: 'thermal',
    name: 'Thermal Decomposition & Pyrolysis',
    maturity: 'Industrial Scaling',
    capexPer10ktINR_Cr: 28.0,
    opexPerTonneINR: 7800,
    glassPurity: 'High (>95% intact whole glass sheets possible)',
    siliconRecoveryPurity: 'Intact wafer recovery potential; 4N-5N after surface acid wash',
    silverRecoveryRatePct: 68.0,
    environmentalScore: 6.8,
    energyIntensityMJ_per_kg: 8.5,
    recommendedFor: 'Medium-to-large regional hubs recovering intact glass and intact cell wafers.',
    tradeOffs: 'High energy intensity and required flue-gas scrubbing infrastructure for toxic fluorinated polymer off-gases (HF emissions).'
  },
  {
    id: 'chemical',
    name: 'Hydrometallurgical Leaching & Solvent Dissolution',
    maturity: 'Pilot / Demonstration',
    capexPer10ktINR_Cr: 36.5,
    opexPerTonneINR: 9600,
    glassPurity: 'Ultra-High (>98% pure cullet suitable for float glass)',
    siliconRecoveryPurity: 'Chemical solar grade recovery (5N-6N)',
    silverRecoveryRatePct: 91.0,
    environmentalScore: 7.8,
    energyIntensityMJ_per_kg: 5.2,
    recommendedFor: 'Specialized chemical refining hubs processing stripped cell metallization cakes.',
    tradeOffs: 'Requires intensive wastewater neutralization, acid handling, and hazardous chemical compliance.'
  },
  {
    id: 'hybrid',
    name: 'Hybrid Thermo-Mechanical + Hydrometallurgical',
    maturity: 'Industrial Scaling',
    capexPer10ktINR_Cr: 44.0,
    opexPerTonneINR: 8400,
    glassPurity: 'Premium Ultra-Clean Float Grade (>98.5%)',
    siliconRecoveryPurity: 'High-purity polysilicon feedstock (5N+)',
    silverRecoveryRatePct: 94.5,
    environmentalScore: 8.9,
    energyIntensityMJ_per_kg: 6.1,
    recommendedFor: 'Long-term Tier-1 circular hubs maximizing total recovered mineral value under EPR.',
    tradeOffs: 'Higher initial CAPEX, requires skilled chemical engineering personnel and consistent minimum feedstocks (>25,000 tonnes/year).'
  }
];

/**
 * State Solar Waste & Infrastructure Profiles
 * Focus areas from research dossier: Rajasthan, Gujarat, Karnataka, Tamil Nadu, Maharashtra, Andhra Pradesh
 */
export const STATE_SOLAR_PROFILES: StateWasteProfile[] = [
  {
    code: 'RJ',
    name: 'Rajasthan',
    installedCapacityGW: 23.4,
    pipelineCapacityGW: 18.2,
    cumulativeWaste2030Kt: 142,
    cumulativeWaste2040Kt: 580,
    cumulativeWaste2050Kt: 2540,
    primaryTechnology: 'Mono PERC & Bifacial Utility Solar',
    hubLocation: 'Bhadla - Jodhpur Mega Circular Hub',
    coordinates: [26.2389, 73.0243],
    collectionDensityScore: 92
  },
  {
    code: 'GJ',
    name: 'Gujarat',
    installedCapacityGW: 15.8,
    pipelineCapacityGW: 14.5,
    cumulativeWaste2030Kt: 98,
    cumulativeWaste2040Kt: 410,
    cumulativeWaste2050Kt: 1820,
    primaryTechnology: 'Utility Scale & Industrial Rooftop',
    hubLocation: 'Charanka - Ahmedabad Western Recovery Center',
    coordinates: [23.0225, 72.5714],
    collectionDensityScore: 88
  },
  {
    code: 'KA',
    name: 'Karnataka',
    installedCapacityGW: 11.2,
    pipelineCapacityGW: 6.8,
    cumulativeWaste2030Kt: 74,
    cumulativeWaste2040Kt: 295,
    cumulativeWaste2050Kt: 1240,
    primaryTechnology: 'Pavagada Mega Solar Park & C&I Rooftop',
    hubLocation: 'Tumakuru - Bengaluru Southern Hub',
    coordinates: [13.3409, 77.1010],
    collectionDensityScore: 82
  },
  {
    code: 'TN',
    name: 'Tamil Nadu',
    installedCapacityGW: 9.6,
    pipelineCapacityGW: 5.4,
    cumulativeWaste2030Kt: 61,
    cumulativeWaste2040Kt: 240,
    cumulativeWaste2050Kt: 1050,
    primaryTechnology: 'Kamuthi & Coastal Wind-Solar Hybrids',
    hubLocation: 'Madurai - Chennai Coastal Aggregator',
    coordinates: [9.9252, 78.1198],
    collectionDensityScore: 78
  },
  {
    code: 'MH',
    name: 'Maharashtra',
    installedCapacityGW: 8.7,
    pipelineCapacityGW: 7.1,
    cumulativeWaste2030Kt: 54,
    cumulativeWaste2040Kt: 215,
    cumulativeWaste2050Kt: 970,
    primaryTechnology: 'Agricultural Feeder Solar & Rooftop C&I',
    hubLocation: 'Pune - Aurangabad Central Aggregation Facility',
    coordinates: [18.5204, 73.8567],
    collectionDensityScore: 76
  },
  {
    code: 'AP',
    name: 'Andhra Pradesh',
    installedCapacityGW: 6.9,
    pipelineCapacityGW: 4.8,
    cumulativeWaste2030Kt: 43,
    cumulativeWaste2040Kt: 175,
    cumulativeWaste2050Kt: 790,
    primaryTechnology: 'Ananthapuramu & Kurnool Ultra Mega Parks',
    hubLocation: 'Kurnool - Rayalaseema Regional Recovery Node',
    coordinates: [15.8281, 78.0373],
    collectionDensityScore: 74
  },
  {
    code: 'MP',
    name: 'Madhya Pradesh',
    installedCapacityGW: 4.8,
    pipelineCapacityGW: 4.2,
    cumulativeWaste2030Kt: 31,
    cumulativeWaste2040Kt: 125,
    cumulativeWaste2050Kt: 560,
    primaryTechnology: 'Rewa Solar Park & Central Grid',
    hubLocation: 'Rewa - Indore Regional Spoke',
    coordinates: [24.5362, 81.3037],
    collectionDensityScore: 68
  }
];

/**
 * Default Scenario Simulation Parameters
 */
export const DEFAULT_SCENARIO_PARAMETERS: ScenarioParameters = {
  annualSolarAdditionsGW: 25.0,
  earlyLossRatePct: 4.5,
  moduleMassKg: 22.0,
  designLifeYears: 25.0,
  weibullBeta: 5.0,
  avgTransportDistanceKm: 280,
  recoveryEfficiencyPct: 88.0,
  silverPriceINR_per_kg: 88000,
  aluminiumPriceINR_per_kg: 215,
  copperPriceINR_per_kg: 760,
  glassPriceINR_per_kg: 14.5,
  siliconPriceINR_per_kg: 180,
  plantCapacityTonnesYr: 30000,
  eprFeePerTonneINR: 2400,
  reverseLogisticsFreightINR_per_tkm: 4.2,
  feedstockCostPerTonneINR: 1200,
  technologyPathway: 'hybrid'
};

/**
 * Verified INA Solar Information (Sourced vs Proposed)
 * Strict separation of verified facts from SolarLoop proposed mechanisms.
 */
export const INA_SOLAR_VERIFIED_DATA = {
  companyName: 'INA Solar (Insolation Energy Ltd.)',
  stockTicker: 'BSE: 543620',
  // VERIFIED SOURCED FACTS:
  verifiedFacts: [
    'FACT: Verified nationwide channel partner network exceeding 700+ registered partners across Indian states.',
    'FACT: In-house aluminium-frame manufacturing, extrusion, and anodizing capability.',
    'FACT: Planned high-efficiency TOPCon solar cell and module production line expansions in Rajasthan.',
    'FACT: Existing scrap aluminium recirculation directly back into frame casting billets.'
  ],
  channelPartnerCount: 700,
  // STRATEGIC SOLARLOOP PROPOSAL (Clearly labelled as Proposal):
  strategicProposal: 'SolarLoop proposes evaluating eligible INA channel partner warehouses as potential reverse-logistics aggregation spokes for rooftop and commercial solar decommissioning, reducing regional freight aggregation capex.'
};

/**
 * Sample Asset Portfolio for Asset Intelligence View
 * Labelled as: [Demo scenario · Representative solar installations for model testing]
 */
export const SAMPLE_SOLAR_ASSETS: SolarAsset[] = [
  {
    id: 'DEMO-ASSET-RJ-001',
    name: 'Bhadla Phase IV Block A Array (Illustrative)',
    category: 'utility_scale',
    capacityMW: 300,
    technology: 'poly_si',
    installationYear: 2017,
    moduleMassKg: 22.5,
    moduleWattageW: 320,
    state: 'Rajasthan',
    district: 'Jodhpur',
    status: 'Operational',
    estimatedModuleCount: 937500,
    totalMassTonnes: 21093,
    expectedRetirementYear: 2042,
    coordinates: [27.5385, 71.9168]
  },
  {
    id: 'DEMO-ASSET-GJ-002',
    name: 'Charanka Phase II Solar Array (Illustrative)',
    category: 'utility_scale',
    capacityMW: 220,
    technology: 'poly_si',
    installationYear: 2014,
    moduleMassKg: 21.8,
    moduleWattageW: 280,
    state: 'Gujarat',
    district: 'Patan',
    status: 'Degraded - Under Review',
    estimatedModuleCount: 785714,
    totalMassTonnes: 17128,
    expectedRetirementYear: 2039,
    coordinates: [23.9069, 71.1969]
  },
  {
    id: 'DEMO-ASSET-KA-003',
    name: 'Pavagada Sector 3 Solar Array (Illustrative)',
    category: 'utility_scale',
    capacityMW: 450,
    technology: 'mono_perc',
    installationYear: 2019,
    moduleMassKg: 23.0,
    moduleWattageW: 385,
    state: 'Karnataka',
    district: 'Tumakuru',
    status: 'Operational',
    estimatedModuleCount: 1168831,
    totalMassTonnes: 26883,
    expectedRetirementYear: 2044,
    coordinates: [14.1022, 77.2798]
  },
  {
    id: 'DEMO-ASSET-MH-004',
    name: 'Chakan C&I Rooftop Cluster (Illustrative)',
    category: 'rooftop_commercial',
    capacityMW: 42,
    technology: 'mono_perc',
    installationYear: 2018,
    moduleMassKg: 22.0,
    moduleWattageW: 340,
    state: 'Maharashtra',
    district: 'Pune',
    status: 'Operational',
    estimatedModuleCount: 123529,
    totalMassTonnes: 2717,
    expectedRetirementYear: 2043,
    coordinates: [18.7606, 73.8584]
  },
  {
    id: 'DEMO-ASSET-TN-005',
    name: 'Kamuthi Southern Array Repowering (Illustrative)',
    category: 'utility_scale',
    capacityMW: 180,
    technology: 'poly_si',
    installationYear: 2016,
    moduleMassKg: 22.0,
    moduleWattageW: 290,
    state: 'Tamil Nadu',
    district: 'Ramanathapuram',
    status: 'Scheduled Repowering',
    estimatedModuleCount: 620689,
    totalMassTonnes: 13655,
    expectedRetirementYear: 2028,
    coordinates: [9.3512, 78.3842]
  },
  {
    id: 'DEMO-ASSET-AP-006',
    name: 'Ananthapuramu Solar Cluster Zone C (Illustrative)',
    category: 'utility_scale',
    capacityMW: 250,
    technology: 'mono_perc',
    installationYear: 2020,
    moduleMassKg: 23.5,
    moduleWattageW: 440,
    state: 'Andhra Pradesh',
    district: 'Anantapur',
    status: 'Insurance Claim Active',
    estimatedModuleCount: 568181,
    totalMassTonnes: 13352,
    expectedRetirementYear: 2045,
    coordinates: [14.6819, 77.6006]
  }
];

/**
 * Operational Reverse Logistics Batches
 * Clearly flagged as: [Illustrative consignment data · Demo tracking workflow]
 */
export const DEMO_LOGISTICS_BATCHES: LogisticsBatch[] = [
  {
    id: 'DEMO-CONSIGNMENT-001',
    origin: 'DEMO-SITE-KAMUTHI (Repowering Staging)',
    originType: 'Repowering Project',
    state: 'Tamil Nadu',
    destinationHub: 'ILLUSTRATIVE HUB — TAMIL NADU (MADURAI)',
    moduleQuantity: 2450,
    estimatedMassTonnes: 53.9,
    streamType: 'repowering',
    status: 'In Transit',
    collectionDate: '2026-09-28',
    transportStage: 'Simulated transit manifest [DEMO-TRUCK-001]',
    carrier: 'DEMO-CARRIER-01 (EcoFreights Demo)',
    trackingNumber: 'DEMO-TRK-994821',
    isDemo: true
  },
  {
    id: 'DEMO-CONSIGNMENT-002',
    origin: 'DEMO-SPOKE-JAIPUR-WEST (Partner Depot)',
    originType: 'Channel Partner',
    state: 'Rajasthan',
    destinationHub: 'ILLUSTRATIVE HUB — RAJASTHAN (JODHPUR)',
    moduleQuantity: 820,
    estimatedMassTonnes: 18.0,
    streamType: 'early_failure',
    status: 'Aggregated',
    collectionDate: '2026-09-29',
    transportStage: 'Aggregated at simulated spoke yard bay 4',
    carrier: 'DEMO-CARRIER-02 (Regional Demo Logistics)',
    trackingNumber: 'DEMO-TRK-00418',
    isDemo: true
  },
  {
    id: 'DEMO-CONSIGNMENT-003',
    origin: 'DEMO-SITE-BARMER (Weather Hail Damage Yard)',
    originType: 'Disaster Area',
    state: 'Rajasthan',
    destinationHub: 'ILLUSTRATIVE HUB — RAJASTHAN (JODHPUR)',
    moduleQuantity: 3600,
    estimatedMassTonnes: 79.2,
    streamType: 'insurance_damaged',
    status: 'Received',
    collectionDate: '2026-09-22',
    transportStage: 'Simulated weighbridge inspection & glass segregation',
    carrier: 'DEMO-CARRIER-03 (Heavy Haul Demo)',
    trackingNumber: 'DEMO-TRK-82194',
    isDemo: true
  },
  {
    id: 'DEMO-CONSIGNMENT-004',
    origin: 'DEMO-SITE-SANAND (C&I Rooftop Decommissioning)',
    originType: 'Asset Site',
    state: 'Gujarat',
    destinationHub: 'ILLUSTRATIVE HUB — GUJARAT (AHMEDABAD)',
    moduleQuantity: 1200,
    estimatedMassTonnes: 26.4,
    streamType: 'scheduled_eol',
    status: 'Processed',
    collectionDate: '2026-09-15',
    transportStage: 'Simulated material recovery: 2.72 t Al frames segregated',
    carrier: 'DEMO-CARRIER-01 (EcoFreights Demo)',
    trackingNumber: 'DEMO-TRK-33921',
    isDemo: true
  },
  {
    id: 'DEMO-CONSIGNMENT-005',
    origin: 'DEMO-SPOKE-TUMAKURU (District Spoke)',
    originType: 'Channel Partner',
    state: 'Karnataka',
    destinationHub: 'ILLUSTRATIVE HUB — KARNATAKA (BENGALURU)',
    moduleQuantity: 650,
    estimatedMassTonnes: 14.3,
    streamType: 'early_failure',
    status: 'Materials Recovered',
    collectionDate: '2026-09-10',
    transportStage: 'Simulated recovery complete: clean glass cullet and Al frames',
    carrier: 'DEMO-CARRIER-02 (Regional Demo Logistics)',
    trackingNumber: 'DEMO-TRK-11029',
    isDemo: true
  }
];

/**
 * Implementation Roadmap 4-Phase Milestones
 * Clearly separating regulatory fact, model projections, and SolarLoop proposals.
 */
export const IMPLEMENTATION_ROADMAP_PHASES = [
  {
    phase: 'Phase 1: Foundation',
    period: '2026–2028',
    headline: 'EPR Mandate Enactment, Reverse Logistics Pilots & Spoke Network',
    infrastructure: 'Establish initial regional aggregation spokes evaluating manufacturer partner footprints (including INA 700+ partner network proposal).',
    technology: 'Deploy commercial mechanical de-framing lines for immediate aluminium frame and coarse glass reclamation.',
    policy: 'Compliance with Schedule I / CEEW5 solar module obligations under E-Waste (Management) Rules, 2022.',
    digital: 'Prototype digital chain-of-custody tracking across state collection borders.',
    kpis: 'Indicative collection targets; high aluminium frame recovery; formal diversion from unscientific disposal.'
  },
  {
    phase: 'Phase 2: Regional Hub Scale-Up',
    period: '2028–2032',
    headline: 'Early-Loss Stream Consolidation, Thermal Delamination & Float Glass Loop',
    infrastructure: 'Develop regional circularity hubs near major solar states (Rajasthan, Gujarat, Karnataka, Tamil Nadu, Madhya Pradesh, Andhra Pradesh).',
    technology: 'Integrate thermal delamination for whole-glass sheet extraction and intact silicon cell recovery.',
    policy: 'Tiered EPR credit framework recognizing high-purity glass and silver reclamation.',
    digital: 'Reverse logistics freight aggregation protocols and digital weighbridge verification.',
    kpis: 'Regional aggregation capacity scaling; high-grade cullet utilization in domestic glass manufacturing.'
  },
  {
    phase: 'Phase 3: Industrial Recovery',
    period: '2032–2040',
    headline: 'Advanced Hydrometallurgy, 5N Silicon & Precious Silver Bullion',
    infrastructure: 'Expand regional network capacity to accommodate utility-scale repowering and NSM wave (>500 kt/yr).',
    technology: 'Full chemical hydrometallurgical leaching for 90%+ silver extraction and 5N metallurgical silicon purification.',
    policy: 'Proposed recycled mineral content standards in domestic solar manufacturing (ALMM circularity criteria).',
    digital: 'Automated de-framing robotics and multi-facility logistics optimization.',
    kpis: 'High-purity silver bullion production; unit processing cost optimization through scale economies.'
  },
  {
    phase: 'Phase 4: Full Circularity',
    period: '2040–2050',
    headline: 'Closed-Loop Material Reintegration for Peak 25-Year Lifecycle Wave',
    infrastructure: 'Mature national network of regional hubs and industrial facilities handling multi-million-tonne annual decommissioning flows.',
    technology: 'Closed-loop TOPCon, HJT, and tandem cell reclamation with minimal non-recoverable residues.',
    policy: 'Harmonized circular economy frameworks and carbon-credit linkage under CCTS methodologies.',
    digital: 'Integrated material passport lifecycle accounting across India.',
    kpis: 'Near-zero solar PV waste to landfill; multi-megatonne CO2e displacement vs primary mineral extraction.'
  }
];
