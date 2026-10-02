/**
 * Core Type Definitions for SolarLoop Intelligence Platform
 */

export type UserRole = 
  | 'manufacturer'      // Solar PV Module Manufacturer (e.g. INA Solar, Tata Power Solar)
  | 'asset_owner'       // Solar Asset Owner / Independent Power Producer (e.g. Adani, Renew)
  | 'recycler'          // Industrial Recycling Operator
  | 'epc_partner'       // EPC & Channel Distribution Partner
  | 'insurer'           // Insurance Underwriter / Claims Adjuster (damaged assets)
  | 'government';       // Policy Maker / MNRE / CPCB

export type ForecastScenarioId = 
  | 'base_regular'
  | 'base_early_loss'
  | 'conservative_regular'
  | 'conservative_early_loss'
  | 'custom_scenario';

export type WasteStreamType = 
  | 'scheduled_eol'
  | 'early_failure'
  | 'repowering'
  | 'insurance_damaged';

export type TechnologyType = 
  | 'mono_perc'
  | 'poly_si'
  | 'topcon'
  | 'thin_film_cdte'
  | 'hjt';

export type AssetCategory = 
  | 'utility_scale'
  | 'rooftop_commercial'
  | 'rooftop_residential'
  | 'distributed_agri'
  | 'off_grid';

export type ProvenanceTier = 
  | 'VERIFIED SOURCE'
  | 'MODEL OUTPUT'
  | 'USER ASSUMPTION'
  | 'SCENARIO OUTPUT'
  | 'DEMO DATA'
  | 'DEMO SCENARIO';

export type PolicyClassificationTier = 
  | 'CURRENT POLICY'
  | 'SOLARLOOP PROPOSAL'
  | 'SCENARIO ASSUMPTION';

export type PlantCapacityTier = 'pilot' | 'small' | 'regional' | 'large';

export interface AnnualWasteStreamBreakdown {
  year: number;
  cohortRegularEolKt: number;
  earlyLossKt: number;
  repoweringKt: number;
  damagedInsuranceKt: number;
  totalAnnualKt: number;
  cumulativeKt: number;
}

export interface SolarAsset {
  id: string;
  name: string;
  category: AssetCategory;
  capacityMW: number;
  technology: TechnologyType;
  installationYear: number;
  moduleMassKg: number;
  moduleWattageW: number;
  state: string;
  district: string;
  status: 'Operational' | 'Degraded - Under Review' | 'Scheduled Repowering' | 'Decommissioning' | 'Insurance Claim Active';
  estimatedModuleCount: number;
  totalMassTonnes: number;
  expectedRetirementYear: number;
  coordinates: [number, number]; // [lat, lng]
}

export interface WasteMilestone {
  year: number;
  cumulativeWasteKt: number;
  annualFlowKt: number;
  requiredCapacityKtYr: number;
  deficitKtYr: number;
}

export interface StateWasteProfile {
  code: string;
  name: string;
  installedCapacityGW: number;
  pipelineCapacityGW: number;
  cumulativeWaste2030Kt: number;
  cumulativeWaste2040Kt: number;
  cumulativeWaste2050Kt: number;
  primaryTechnology: string;
  hubLocation: string;
  coordinates: [number, number];
  collectionDensityScore: number; // 0-100
}

export interface MaterialCompositionItem {
  element: string;
  label: string;
  percentageByMass: number; // e.g. 74.2 for 74.2%
  massPerModuleKg: number;  // For standard 22 kg module
  pricePerKgINR: number;    // Market price in INR
  recoveryEfficiency: {
    mechanical: number;     // e.g. 0.85
    thermal: number;
    chemical: number;
    hybrid: number;
  };
  circularPathway: string;
  downcycleRisk: string;
}

export interface RecyclingPathwaySpec {
  id: 'mechanical' | 'thermal' | 'chemical' | 'hybrid';
  name: string;
  maturity: 'Commercially Mature' | 'Pilot / Demonstration' | 'Industrial Scaling' | 'Emerging Advanced';
  capexPer10ktINR_Cr: number;
  opexPerTonneINR: number;
  glassPurity: string;
  siliconRecoveryPurity: string;
  silverRecoveryRatePct: number;
  environmentalScore: number; // 1-10
  energyIntensityMJ_per_kg: number;
  recommendedFor: string;
  tradeOffs: string;
}

export interface EconomicModelInputs {
  feedstockCostPerTonneINR: number; // Price paid or charged for incoming modules
  transportDistanceKm: number;
  freightCostPerTkmINR: number;    // INR per tonne-km
  technology: 'mechanical' | 'thermal' | 'chemical' | 'hybrid';
  plantCapacityTonnesYr: number;
  eprCreditPerTonneINR: number;     // Extended producer responsibility fee contribution
  materialPriceMultiplier: number;  // 1.0 = baseline, 1.2 = +20%
}

export interface DCFProjectionYear {
  yearIndex: number;
  calendarYear: number;
  throughputTonnes: number;
  capacityUtilizationPct: number;
  grossRevenueCr: number;
  eprRevenueCr: number;
  totalInflowCr: number;
  processingOpexCr: number;
  logisticsOpexCr: number;
  feedstockCostCr: number;
  totalOpexCr: number;
  ebitdaCr: number;
  depreciationCr: number;
  ebitCr: number;
  taxesCr: number;
  freeCashFlowCr: number;
  discountedCashFlowCr: number;
  cumulativeCashFlowCr: number;
}

export interface FinancialAnalysis {
  plantCapexCr: number;
  projectLifeYears: number;
  discountRatePct: number;
  capacityUtilizationPct: number;
  annualThroughputTonnes: number;
  ebitdaAnnualCr: number;
  ebitdaMarginPct: number;
  projectNPV_Cr: number;
  projectIRRPct: number | null; // null if cash flows never recover or undefined
  paybackPeriodYears: number | null; // null if never pays back
  discountedPaybackPeriodYears: number | null;
  terminalValueCr: number;
  breakEvenFeedstockINR_per_tonne: number;
  breakEvenEprINR_per_tonne: number;
  isEconomicallyAttractive: boolean;
  viabilityVerdict: 'COMMERCIALLY VIABLE' | 'MARGINAL / SUBSIDY DEPENDENT' | 'NOT ECONOMICALLY VIABLE';
  attractivenessReasoning: string;
  dcfSchedule: DCFProjectionYear[];
}

export interface YearlyFleetBalance {
  year: number;
  cumulativeAdditionsGW: number;
  activeOperatingFleetGW: number;
  annualScheduledRetirementsGW: number;
  annualEarlyLossGW: number;
  annualRepoweringGW: number;
  annualDamagedGW: number;
  cumulativeScheduledRetirementsGW: number;
  cumulativeEarlyLossGW: number;
  cumulativeRepoweringGW: number;
  cumulativeDamagedGW: number;
  totalCumulativeRemovedGW: number;
  balanceDiscrepancyGW: number;
  isBalanced: boolean;
}

export interface ActiveFleetReconciliation {
  targetYear: number;
  totalInstalledToDateGW: number;
  activeOperatingFleetGW: number;
  cumulativeRetiredScheduledGW: number;
  cumulativeEarlyLossGW: number;
  cumulativeRepoweredGW: number;
  cumulativeDamagedGW: number;
  reconciliationIdentityFormula: string;
  isBalanced: boolean;
  discrepancyGW: number;
  yearlyHistory: YearlyFleetBalance[];
}

export interface TornadoItem {
  driver: string;
  parameterKey: string;
  baseValueFormatted: string;
  lowValueFormatted: string;
  highValueFormatted: string;
  lowMarginPerTonneINR: number;
  highMarginPerTonneINR: number;
  lowIRRPct: number | null;
  highIRRPct: number | null;
  swingMarginINR: number;
}

export interface TechnologyCriteriaWeights {
  capexWeight: number;       // default 0.20
  opexWeight: number;        // default 0.20
  materialRecovery: number;  // default 0.25
  materialPurity: number;    // default 0.15
  maturity: number;          // default 0.10
  environmentalScore: number;// default 0.10
}

export interface TechnologyScoreResult {
  id: 'mechanical' | 'thermal' | 'chemical' | 'hybrid';
  name: string;
  totalScore: number; // 0 - 100
  capexScore: number;
  opexScore: number;
  recoveryScore: number;
  purityScore: number;
  maturityScore: number;
  environmentalScore: number;
  rank: number;
  reasoning: string;
}

export interface SolarLoopRecommendation {
  scenarioName: string;
  scenarioId: ForecastScenarioId;
  horizonYear: number;
  forecastWasteVolumeKt: number;
  annualFlowKtYr: number;
  requiredRecyclingCapacityKtYr: number;
  recommendedFacilityCount: number;
  recommendedFacilityTier: PlantCapacityTier;
  recommendedTechnology: 'mechanical' | 'thermal' | 'chemical' | 'hybrid';
  technologyName: string;
  avgTransportHaulKm: number;
  networkTopology: 'Hub-and-Spoke' | 'Decentralized' | 'Single Mega-Hub';
  hubCount: number;
  netMarginPerTonneINR: number;
  projectIRRPct: number | null;
  projectNPV_Cr: number;
  viabilityVerdict: string;
  co2eAvoidedMt: number;
  policyMandateRequirement: string;
  inaStrategicRole: string;
  executiveSummaryBullets: string[];
}

export interface EconomicModelOutputs {
  grossRecoveredValuePerTonneINR: number;
  logisticsCostPerTonneINR: number;
  processingCostPerTonneINR: number;
  feedstockCostPerTonneINR: number;
  eprContributionPerTonneINR: number;
  netMarginPerTonneINR: number;
  breakEvenFeedstockPricePerTonneINR: number;
  annualPlantEBITDA_INR_Cr: number;
  projectIRRPct: number | null;
  projectNPV_Cr: number;
  paybackPeriodYears: number | null;
  ebitdaMarginPct: number;
  financialAnalysis: FinancialAnalysis;
}

export interface LogisticsBatch {
  id: string;
  origin: string;
  originType: 'Asset Site' | 'Channel Partner' | 'Disaster Area' | 'Repowering Project';
  state: string;
  destinationHub: string;
  moduleQuantity: number;
  estimatedMassTonnes: number;
  streamType: WasteStreamType;
  status: 'Registered' | 'Collected' | 'Aggregated' | 'In Transit' | 'Received' | 'Processed' | 'Materials Recovered';
  collectionDate: string;
  transportStage: string;
  carrier: string;
  trackingNumber: string;
  isDemo: boolean;
}

export interface ScenarioParameters {
  annualSolarAdditionsGW: number;
  earlyLossRatePct: number;
  moduleMassKg: number;
  designLifeYears: number;
  weibullBeta: number;
  avgTransportDistanceKm: number;
  recoveryEfficiencyPct: number;
  silverPriceINR_per_kg: number;
  aluminiumPriceINR_per_kg: number;
  copperPriceINR_per_kg: number;
  glassPriceINR_per_kg: number;
  siliconPriceINR_per_kg: number;
  plantCapacityTonnesYr: number;
  eprFeePerTonneINR: number;
  reverseLogisticsFreightINR_per_tkm: number;
  feedstockCostPerTonneINR: number;
  technologyPathway: 'mechanical' | 'thermal' | 'chemical' | 'hybrid';
}

export interface EnvironmentalImpactMetrics {
  totalMassRecoveredKt: number;
  wasteDivertedFromLandfillKt: number;
  co2eAvoidedMt: number;
  rawSandSavedKt: number;
  bauxiteSavedKt: number;
  hazardousHeavyMetalsSafelyHandledTonnes: number;
}
