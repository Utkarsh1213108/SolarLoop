import { 
  MaterialCompositionItem, 
  RecyclingPathwaySpec, 
  StateWasteProfile, 
  SolarAsset, 
  LogisticsBatch
} from '../types';

/**
 * SOLARLOOP RESEARCH DOSSIER BASELINE
 * Source: Research Dossier on India Solar PV End-of-Life Management & Circular Economy (2024-2026)
 * Note: Scenarios reflect model estimates from research literature; preserved with uncertainty labels.
 */

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
