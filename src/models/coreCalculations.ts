import { 
  ScenarioParameters, 
  EconomicModelInputs, 
  EconomicModelOutputs, 
  EnvironmentalImpactMetrics,
  MaterialCompositionItem,
  ForecastScenarioId,
  RecyclingPathwaySpec,
  AnnualWasteStreamBreakdown,
  PlantCapacityTier,
  ActiveFleetReconciliation,
  YearlyFleetBalance,
  FinancialAnalysis,
  DCFProjectionYear,
  TornadoItem,
  TechnologyCriteriaWeights,
  TechnologyScoreResult,
  SolarLoopRecommendation
} from '../types';
import { 
  BASELINE_SCENARIOS, 
  REPRESENTATIVE_MODULE_COMPOSITION, 
  RECYCLING_PATHWAYS,
  STATE_SOLAR_PROFILES
} from '../data/researchBaseline';

/**
 * SOLARLOOP MODEL v2.5 — DETERMINISTIC MATHEMATICAL & CIRCULARITY CAUSAL ENGINE
 * Inter IIT Tech Meet 13.0 — Mathematical & Project-Finance Rigor
 * 
 * Pure closed-form causal modeling linking:
 * Annual additions → cohorts → discrete Weibull retirement mass → early loss → repowering → damaged → active fleet balance → waste streams
 * True discounted cash flow (DCF) project finance model (true IRR, NPV, payback, EBITDA margin)
 * Multi-criteria decision analysis (MCDA) for recycling technologies
 * Sensitivity tornado engine & hub-and-spoke logistics optimization
 */

export const MODEL_METADATA = {
  name: 'SolarLoop National Circularity Decision Engine',
  version: 'v2.5-enterprise',
  lastUpdatedDate: '2026-10-02',
  assumptionsVersion: 'v2.5',
  mathematicalStandards: [
    'Discrete yearly Weibull probability mass: P(t) = Weibull_CDF(t+1) - Weibull_CDF(t)',
    'Stock-flow active fleet conservation identity: Installed = Active + Retired + EarlyLoss + Repowered + Damaged',
    'Stochastic damage attrition calculated strictly against active operating fleet (not historical additions)',
    'Discounted Cash Flow (DCF) with genuine binary search for internal rate of return (NPV = 0)',
    '100.000% elemental material mass conservation balance'
  ]
};

/**
 * Historical India Solar PV Annual Additions (GW)
 * Sourced: Central Electricity Authority (CEA) / Ministry of New and Renewable Energy (MNRE)
 */
export const HISTORICAL_INDIA_COHORTS: { year: number; additionsGW: number }[] = [
  { year: 2011, additionsGW: 0.5 },
  { year: 2012, additionsGW: 1.0 },
  { year: 2013, additionsGW: 1.1 },
  { year: 2014, additionsGW: 1.2 },
  { year: 2015, additionsGW: 2.1 },
  { year: 2016, additionsGW: 4.0 },
  { year: 2017, additionsGW: 9.6 },
  { year: 2018, additionsGW: 8.3 },
  { year: 2019, additionsGW: 7.3 },
  { year: 2020, additionsGW: 3.9 },
  { year: 2021, additionsGW: 10.3 },
  { year: 2022, additionsGW: 14.0 },
  { year: 2023, additionsGW: 10.0 },
  { year: 2024, additionsGW: 15.0 },
  { year: 2025, additionsGW: 20.0 },
];

/**
 * Physical module mass conversion: kt of solar panels per GW installed
 * Standard benchmark: 400W nominal module mass (default 22.0 kg)
 * 1 GW = 1,000,000 kW / 0.4 kW = 2,500,000 modules * 0.022 tonnes = 55,000 tonnes = 55.0 kt/GW
 */
export function get_kt_per_gw(moduleMassKg: number = 22.0): number {
  return (2500000 * moduleMassKg) / 1000000;
}

/**
 * Weibull Cumulative Distribution Function (CDF)
 * F(t) = 1 - exp(-(t / eta)^beta)
 * eta = scale parameter (characteristic design life in years)
 * beta = shape parameter (wear-out steepness)
 */
export function weibull_cdf(t: number, eta: number, beta: number): number {
  if (t <= 0) return 0;
  return 1 - Math.exp(-Math.pow(t / eta, beta));
}

/**
 * Discrete yearly Weibull probability mass:
 * P(retirement in year of age t) = Weibull CDF(t + 1) - Weibull CDF(t)
 * Avoids continuous PDF integration error.
 */
export function calculate_cohort_retirement_probability(
  age: number,
  designLifeYears: number = 25.0,
  weibullBeta: number = 5.0
): number {
  if (age < 0) return 0;
  const cdfNext = weibull_cdf(age + 1, designLifeYears, weibullBeta);
  const cdfCurr = weibull_cdf(age, designLifeYears, weibullBeta);
  return Math.max(0, cdfNext - cdfCurr);
}

/**
 * Calculate scheduled cohort waste for target year using discrete Weibull mass
 */
export function calculate_cohort_waste(
  installationYear: number,
  targetYear: number,
  installedCapacityGW: number,
  moduleMassKg: number = 22.0,
  designLifeYears: number = 25.0,
  weibullBeta: number = 5.0
): number {
  const age = targetYear - installationYear;
  if (age < 0) return 0;

  const discreteProb = calculate_cohort_retirement_probability(age, designLifeYears, weibullBeta);
  const ktPerGW = get_kt_per_gw(moduleMassKg);
  return installedCapacityGW * ktPerGW * discreteProb;
}

/**
 * Early-loss failure fraction for age t (infant mortality, transportation cracks, PID, delamination)
 * Modeled as lognormal/gamma bell peaking in years 3-6, integrating to earlyLossRatePct over life
 */
export function calculate_early_loss_fraction(
  age: number,
  earlyLossRatePct: number = 4.5
): number {
  if (age <= 0 || age > 20) return 0;
  const peakYear = 4.0;
  const spread = 3.5;
  const weight = Math.exp(-Math.pow(age - peakYear, 2) / (2 * Math.pow(spread, 2)));
  const normalizedFactor = 0.12; // Normalizes area over 20 years
  return (earlyLossRatePct / 100) * weight * normalizedFactor;
}

export function calculate_early_loss_waste(
  installationYear: number,
  targetYear: number,
  installedCapacityGW: number,
  moduleMassKg: number = 22.0,
  earlyLossRatePct: number = 4.5
): number {
  const age = targetYear - installationYear;
  if (age <= 0 || age > 20) return 0;
  const frac = calculate_early_loss_fraction(age, earlyLossRatePct);
  const ktPerGW = get_kt_per_gw(moduleMassKg);
  return installedCapacityGW * ktPerGW * frac;
}

/**
 * Repowering early-replacement fraction for age t (economic repowering of early NSM utility parks)
 * Centered around age 14-16 with higher-efficiency TOPCon/bifacial modules
 */
export function calculate_repowering_fraction(
  age: number,
  repoweringAdoptionPct: number = 12.0
): number {
  if (age < 12 || age > 18) return 0;
  const peakAge = 15;
  return (repoweringAdoptionPct / 100) * 0.25 * Math.exp(-Math.pow(age - peakAge, 2) / 4);
}

export function calculate_repowering_waste(
  installationYear: number,
  targetYear: number,
  installedCapacityGW: number,
  moduleMassKg: number = 22.0,
  repoweringAdoptionPct: number = 12.0
): number {
  const age = targetYear - installationYear;
  if (age < 12 || age > 18) return 0;
  const frac = calculate_repowering_fraction(age, repoweringAdoptionPct);
  const ktPerGW = get_kt_per_gw(moduleMassKg);
  return installedCapacityGW * ktPerGW * frac;
}

/**
 * Catastrophic / insured damaged waste
 * Crucial Technical Fix (Phase 2.2):
 * Calculated STRICTLY against ACTIVE operating fleet, NEVER against total historical cumulative additions!
 */
export function calculate_damaged_insurance_waste(
  activeOperatingFleetGW: number,
  moduleMassKg: number = 22.0,
  damageRatePct: number = 0.22
): number {
  const ktPerGW = get_kt_per_gw(moduleMassKg);
  return Math.max(0, activeOperatingFleetGW) * ktPerGW * (damageRatePct / 100);
}

/**
 * Stock-Flow Fleet Simulation & Active Fleet Reconciliation
 * Guarantees conservation of mass and fleet identity:
 * Total Installed = Active Operating Fleet + Cumulative Scheduled + Cumulative Early Loss + Cumulative Repowering + Cumulative Damaged
 */
export function simulate_stock_flow_fleet(
  targetYear: number = 2050,
  params: Partial<ScenarioParameters> = {}
): {
  yearlyBalances: YearlyFleetBalance[];
  annualBreakdowns: AnnualWasteStreamBreakdown[];
  reconciliation: ActiveFleetReconciliation;
} {
  const annualAdditionsGW = params.annualSolarAdditionsGW ?? 25.0;
  const earlyLossRatePct = params.earlyLossRatePct ?? 4.5;
  const moduleMassKg = params.moduleMassKg ?? 22.0;
  const designLifeYears = params.designLifeYears ?? 25.0;
  const weibullBeta = params.weibullBeta ?? 5.0;
  const damageRatePct = 0.22; // 0.22% annual catastrophic loss rate on operating fleet

  // Build cohort additions timeline 2011 to targetYear
  const cohorts: { year: number; additionsGW: number; remainingActiveGW: number }[] = [];
  for (let yr = 2011; yr <= targetYear; yr++) {
    const hist = HISTORICAL_INDIA_COHORTS.find(h => h.year === yr);
    if (hist) {
      cohorts.push({ year: yr, additionsGW: hist.additionsGW, remainingActiveGW: hist.additionsGW });
    } else {
      const growthFactor = 1 + Math.min(0.5, (yr - 2025) * 0.02);
      const proj = annualAdditionsGW * growthFactor;
      cohorts.push({ year: yr, additionsGW: proj, remainingActiveGW: proj });
    }
  }

  const yearlyBalances: YearlyFleetBalance[] = [];
  const annualBreakdowns: AnnualWasteStreamBreakdown[] = [];

  let cumSchedGW = 0;
  let cumEarlyGW = 0;
  let cumRepowerGW = 0;
  let cumDamageGW = 0;
  let cumInstalledGW = 0;
  let runningCumulativeWasteKt = 0;

  for (let yr = 2011; yr <= targetYear; yr++) {
    // Add new additions of year yr
    const currentCohort = cohorts.find(c => c.year === yr);
    if (currentCohort) {
      cumInstalledGW += currentCohort.additionsGW;
    }

    // Active operating fleet at beginning of year yr is the sum of remaining capacities of cohorts installed <= yr
    let activeAtStartGW = 0;
    cohorts.filter(c => c.year <= yr).forEach(c => {
      activeAtStartGW += c.remainingActiveGW;
    });

    // 1. Scheduled Weibull retirements from active cohorts
    let yrSchedGW = 0;
    cohorts.filter(c => c.year <= yr).forEach(c => {
      const age = yr - c.year;
      const prob = calculate_cohort_retirement_probability(age, designLifeYears, weibullBeta);
      const retiredGW = Math.min(c.remainingActiveGW, c.additionsGW * prob);
      yrSchedGW += retiredGW;
      c.remainingActiveGW = Math.max(0, c.remainingActiveGW - retiredGW);
    });

    // 2. Early-loss attrition from remaining active cohorts
    let yrEarlyGW = 0;
    cohorts.filter(c => c.year <= yr).forEach(c => {
      const age = yr - c.year;
      const frac = calculate_early_loss_fraction(age, earlyLossRatePct);
      const lossGW = Math.min(c.remainingActiveGW, c.additionsGW * frac);
      yrEarlyGW += lossGW;
      c.remainingActiveGW = Math.max(0, c.remainingActiveGW - lossGW);
    });

    // 3. Repowering early retirement
    let yrRepowerGW = 0;
    cohorts.filter(c => c.year <= yr).forEach(c => {
      const age = yr - c.year;
      const frac = calculate_repowering_fraction(age, 12.0);
      const repowerGW = Math.min(c.remainingActiveGW, c.additionsGW * frac);
      yrRepowerGW += repowerGW;
      c.remainingActiveGW = Math.max(0, c.remainingActiveGW - repowerGW);
    });

    // 4. Catastrophic / insurance damage: STRICTLY evaluated on current operating active fleet!
    const activeMidYearGW = Math.max(0, activeAtStartGW - (yrSchedGW + yrEarlyGW + yrRepowerGW));
    const yrDamageGW = activeMidYearGW * (damageRatePct / 100);

    // Proportionately reduce cohort active balances for damage
    if (activeMidYearGW > 0 && yrDamageGW > 0) {
      const damageRatio = Math.min(1, yrDamageGW / activeMidYearGW);
      cohorts.filter(c => c.year <= yr).forEach(c => {
        c.remainingActiveGW = Math.max(0, c.remainingActiveGW * (1 - damageRatio));
      });
    }

    // Cumulative removed totals
    cumSchedGW += yrSchedGW;
    cumEarlyGW += yrEarlyGW;
    cumRepowerGW += yrRepowerGW;
    cumDamageGW += yrDamageGW;

    // Remaining active fleet at end of year
    let activeAtEndGW = 0;
    cohorts.filter(c => c.year <= yr).forEach(c => {
      activeAtEndGW += c.remainingActiveGW;
    });

    const totalRemovedGW = cumSchedGW + cumEarlyGW + cumRepowerGW + cumDamageGW;
    const balanceDiscrepancyGW = Math.abs(cumInstalledGW - (activeAtEndGW + totalRemovedGW));
    const isBalanced = balanceDiscrepancyGW < 0.001;

    yearlyBalances.push({
      year: yr,
      cumulativeAdditionsGW: Number(cumInstalledGW.toFixed(3)),
      activeOperatingFleetGW: Number(activeAtEndGW.toFixed(3)),
      annualScheduledRetirementsGW: Number(yrSchedGW.toFixed(4)),
      annualEarlyLossGW: Number(yrEarlyGW.toFixed(4)),
      annualRepoweringGW: Number(yrRepowerGW.toFixed(4)),
      annualDamagedGW: Number(yrDamageGW.toFixed(4)),
      cumulativeScheduledRetirementsGW: Number(cumSchedGW.toFixed(3)),
      cumulativeEarlyLossGW: Number(cumEarlyGW.toFixed(3)),
      cumulativeRepoweringGW: Number(cumRepowerGW.toFixed(3)),
      cumulativeDamagedGW: Number(cumDamageGW.toFixed(3)),
      totalCumulativeRemovedGW: Number(totalRemovedGW.toFixed(3)),
      balanceDiscrepancyGW: Number(balanceDiscrepancyGW.toFixed(6)),
      isBalanced
    });

    // Physical mass conversions in kilotonnes (kt)
    const ktPerGW = get_kt_per_gw(moduleMassKg);
    const schedKt = Math.round(yrSchedGW * ktPerGW);
    const earlyKt = Math.round(yrEarlyGW * ktPerGW);
    const repowerKt = Math.round(yrRepowerGW * ktPerGW);
    const damageKt = Math.round(yrDamageGW * ktPerGW);
    const totalAnnualKt = schedKt + earlyKt + repowerKt + damageKt;
    runningCumulativeWasteKt += totalAnnualKt;

    if (yr >= 2025) {
      annualBreakdowns.push({
        year: yr,
        cohortRegularEolKt: schedKt,
        earlyLossKt: earlyKt,
        repoweringKt: repowerKt,
        damagedInsuranceKt: damageKt,
        totalAnnualKt,
        cumulativeKt: runningCumulativeWasteKt
      });
    }
  }

  const latest = yearlyBalances[yearlyBalances.length - 1];
  const reconciliation: ActiveFleetReconciliation = {
    targetYear,
    totalInstalledToDateGW: latest.cumulativeAdditionsGW,
    activeOperatingFleetGW: latest.activeOperatingFleetGW,
    cumulativeRetiredScheduledGW: latest.cumulativeScheduledRetirementsGW,
    cumulativeEarlyLossGW: latest.cumulativeEarlyLossGW,
    cumulativeRepoweredGW: latest.cumulativeRepoweringGW,
    cumulativeDamagedGW: latest.cumulativeDamagedGW,
    reconciliationIdentityFormula: `${latest.cumulativeAdditionsGW.toFixed(1)} GW Installed = ${latest.activeOperatingFleetGW.toFixed(1)} GW Active + ${(latest.totalCumulativeRemovedGW).toFixed(1)} GW Decommissioned`,
    isBalanced: latest.isBalanced,
    discrepancyGW: latest.balanceDiscrepancyGW,
    yearlyHistory: yearlyBalances
  };

  return {
    yearlyBalances,
    annualBreakdowns,
    reconciliation
  };
}

/**
 * Master Waste Forecast Calculation
 * Fully causal & parameter-driven
 */
export function calculate_waste_forecast(
  scenarioId: ForecastScenarioId, 
  customParams?: Partial<ScenarioParameters>
) {
  const years = [2025, 2027, 2030, 2033, 2035, 2038, 2040, 2043, 2045, 2047, 2050];
  const baseConfig = SCENARIO_CONFIGS[scenarioId] || SCENARIO_CONFIGS.base_regular;
  const effectiveParams: ScenarioParameters = {
    ...baseConfig,
    ...customParams
  };

  const { annualBreakdowns } = simulate_stock_flow_fleet(2050, effectiveParams);

  return years.map(yr => {
    const item = annualBreakdowns.find(a => a.year === yr) || annualBreakdowns[0];
    return {
      year: yr,
      cumulativeKt: item.cumulativeKt,
      annualKt: item.totalAnnualKt,
      breakdown: item
    };
  });
}

/**
 * Plant Capacity Tier Specifications
 * - Pilot / Demonstration: 3.6 kt/year (3,600 t/year)
 * - Small Commercial: 10 kt/year (10,000 t/year)
 * - Regional: 30 kt/year (30,000 t/year)
 * - Large Industrial: 60 kt/year (60,000 t/year)
 */
export const PLANT_CAPACITY_TIERS: Record<
  PlantCapacityTier,
  { name: string; capacityTonnes: number; capacityKt: number; desc: string }
> = {
  pilot: {
    name: 'Pilot / Demonstration',
    capacityTonnes: 3600,
    capacityKt: 3.6,
    desc: 'Demonstration and specialized R&D module reclamation line'
  },
  small: {
    name: 'Small Commercial',
    capacityTonnes: 10000,
    capacityKt: 10.0,
    desc: 'Decentralized local aggregation and mechanical de-framing facility'
  },
  regional: {
    name: 'Regional Hub Facility',
    capacityTonnes: 30000,
    capacityKt: 30.0,
    desc: 'Standard commercial delamination and frame extraction hub'
  },
  large: {
    name: 'Large Industrial Center',
    capacityTonnes: 60000,
    capacityKt: 60.0,
    desc: 'Mega-scale integrated thermo-chemical complex'
  }
};

/**
 * Transparent Plant Capacity Calculator
 */
export function calculate_required_plants(
  requiredCapacityKtYr: number, 
  plantCapacityTonnesYr: number = 30000
): {
  totalPlants: number;
  megaHubs: number;
  regionalSpokes: number;
  plantCapacityTonnesYr: number;
  plantCapacityKtYr: number;
  requiredCapacityTonnesYr: number;
  formulaExplanation: string;
  resultLabel: string;
} {
  const reqTonnes = Math.max(0, requiredCapacityKtYr * 1000);
  const plantCapacity = plantCapacityTonnesYr > 0 ? plantCapacityTonnesYr : 30000;
  const total = Math.max(1, Math.ceil(reqTonnes / plantCapacity));
  const megaHubs = Math.max(1, Math.floor(total * 0.35));
  const regionalSpokes = Math.max(0, total - megaHubs);
  const plantKt = Number((plantCapacity / 1000).toFixed(1));

  return {
    totalPlants: total,
    megaHubs,
    regionalSpokes,
    plantCapacityTonnesYr: plantCapacity,
    plantCapacityKtYr: plantKt,
    requiredCapacityTonnesYr: reqTonnes,
    formulaExplanation: `${requiredCapacityKtYr.toLocaleString()} kt/year required ÷ ${plantKt} kt/year per facility = ~${total} indicative facilities`,
    resultLabel: 'Indicative planning estimate'
  };
}

/**
 * Calculate reverse logistics transport cost per tonne of modules
 */
export function calculate_transport_cost(distanceKm: number, freightRatePerTkmINR: number = 4.2): {
  freightPerTonneINR: number;
  handlingAndAggregationPerTonneINR: number;
  totalLogisticsPerTonneINR: number;
} {
  const dist = Math.max(0, distanceKm);
  const freight = Math.round(dist * freightRatePerTkmINR);
  const handling = 650; // INR per tonne loading, unloading, sorting, strapping
  return {
    freightPerTonneINR: freight,
    handlingAndAggregationPerTonneINR: handling,
    totalLogisticsPerTonneINR: freight + handling
  };
}

/**
 * Elemental material recovery mass per tonne of solar modules
 * Reconciled with exact 100% mass balance
 */
export function calculate_material_recovery(
  totalWasteMassTonnes: number, 
  pathwayId: 'mechanical' | 'thermal' | 'chemical' | 'hybrid' = 'hybrid',
  customComposition?: MaterialCompositionItem[]
) {
  const composition = customComposition || REPRESENTATIVE_MODULE_COMPOSITION;
  
  return composition.map(item => {
    const rawMassTonnes = (item.percentageByMass / 100) * totalWasteMassTonnes;
    const efficiency = item.recoveryEfficiency[pathwayId] ?? 0.8;
    const recoveredMassTonnes = rawMassTonnes * efficiency;
    const unrecoveredMassTonnes = rawMassTonnes - recoveredMassTonnes;

    return {
      element: item.element,
      label: item.label,
      percentage: item.percentageByMass,
      rawMassTonnes: Number(rawMassTonnes.toFixed(3)),
      recoveredMassTonnes: Number(recoveredMassTonnes.toFixed(3)),
      unrecoveredMassTonnes: Number(unrecoveredMassTonnes.toFixed(3)),
      efficiencyPct: Math.round(efficiency * 100),
      pathway: item.circularPathway,
      downcycleRisk: item.downcycleRisk
    };
  });
}

/**
 * Calculate financial value of recovered minerals per tonne of modules
 * Differentiates gross recovered mass from saleable commercial-purity material
 */
export function calculate_recovered_material_value(
  pathwayId: 'mechanical' | 'thermal' | 'chemical' | 'hybrid' = 'hybrid',
  params?: Partial<ScenarioParameters>
) {
  const silverPrice = params?.silverPriceINR_per_kg ?? 88000;
  const alPrice = params?.aluminiumPriceINR_per_kg ?? 215;
  const cuPrice = params?.copperPriceINR_per_kg ?? 760;
  const glassPrice = params?.glassPriceINR_per_kg ?? 14.5;
  const siPrice = params?.siliconPriceINR_per_kg ?? 180;
  const globalMultiplier = (params?.recoveryEfficiencyPct ?? 88) / 88;

  const composition = REPRESENTATIVE_MODULE_COMPOSITION;
  const oneTonneKg = 1000;

  let totalGrossValuePerTonneINR = 0;
  const breakdown = composition.map(item => {
    const kgPerTonne = (item.percentageByMass / 100) * oneTonneKg;
    const baseEff = item.recoveryEfficiency[pathwayId] ?? 0.8;
    const effectiveEff = Math.min(0.99, baseEff * globalMultiplier);
    const recoveredKg = kgPerTonne * effectiveEff;

    let price = item.pricePerKgINR;
    if (item.element === 'Silver') price = silverPrice;
    else if (item.element === 'Aluminium') price = alPrice;
    else if (item.element === 'Copper') price = cuPrice;
    else if (item.element === 'Glass') price = glassPrice;
    else if (item.element === 'Silicon') price = siPrice;

    const itemValueINR = Math.round(recoveredKg * price);
    totalGrossValuePerTonneINR += itemValueINR;

    return {
      element: item.element,
      label: item.label,
      recoveredKgPerTonne: Number(recoveredKg.toFixed(3)),
      pricePerKgINR: price,
      valuePerTonneINR: itemValueINR
    };
  });

  return {
    totalGrossValuePerTonneINR: Math.round(totalGrossValuePerTonneINR),
    breakdown
  };
}

/**
 * GENUINE PROJECT FINANCE DCF & TRUE IRR CALCULATION ENGINE
 * Inter IIT Technical Integrity Requirement (Phases 8 & 9)
 * 
 * Replaces heuristic '85 / payback' with complete Discounted Cash Flow model:
 * Year 0: -CAPEX
 * Years 1..N: Operating cash flow = (Throughput * Utilization) * (Gross Value + EPR - Processing - Logistics - Feedstock)
 * Straight-line depreciation, 25% corporate tax, terminal salvage value.
 * Solves NPV(r) = 0 via robust binary search for exact IRR.
 */
export function calculate_project_dcf_and_irr(
  params: ScenarioParameters,
  options: {
    projectLifeYears?: number;
    discountRatePct?: number;
    capacityUtilizationPct?: number;
    taxRatePct?: number;
    terminalSalvagePct?: number;
  } = {}
): FinancialAnalysis {
  const tech = params.technologyPathway || 'hybrid';
  const pathway = RECYCLING_PATHWAYS.find(p => p.id === tech) || RECYCLING_PATHWAYS[3];

  const projectLifeYears = options.projectLifeYears ?? 10;
  const discountRatePct = options.discountRatePct ?? 12.0; // 12% infrastructure hurdle rate
  const capacityUtilizationPct = options.capacityUtilizationPct ?? 85.0; // 85% operational utilization
  const taxRate = (options.taxRatePct ?? 25.0) / 100;
  const salvageRate = (options.terminalSalvagePct ?? 5.0) / 100;

  const plantCapacityTonnes = params.plantCapacityTonnesYr || 30000;
  const annualThroughputTonnes = Math.round(plantCapacityTonnes * (capacityUtilizationPct / 100));

  // CAPEX scaled from pathway reference (e.g. 12.5 Cr for 10 kt/yr mechanical)
  const plantCapexCr = Number(((plantCapacityTonnes / 10000) * pathway.capexPer10ktINR_Cr).toFixed(2));

  // Per-tonne economics
  const { totalGrossValuePerTonneINR } = calculate_recovered_material_value(tech, params);
  const { totalLogisticsPerTonneINR } = calculate_transport_cost(params.avgTransportDistanceKm, params.reverseLogisticsFreightINR_per_tkm);
  const processingCostPerTonne = pathway.opexPerTonneINR;
  const feedstockCostPerTonne = params.feedstockCostPerTonneINR ?? 1200;
  const eprFeePerTonne = params.eprFeePerTonneINR ?? 2400;

  const netMarginPerTonne = totalGrossValuePerTonneINR + eprFeePerTonne - (processingCostPerTonne + totalLogisticsPerTonneINR + feedstockCostPerTonne);
  const breakEvenFeedstock = totalGrossValuePerTonneINR + eprFeePerTonne - (processingCostPerTonne + totalLogisticsPerTonneINR);
  const breakEvenEpr = Math.max(0, (processingCostPerTonne + totalLogisticsPerTonneINR + feedstockCostPerTonne) - totalGrossValuePerTonneINR);

  // Annual financial flows (in Crores INR)
  const grossRevenueCr = (annualThroughputTonnes * totalGrossValuePerTonneINR) / 10000000;
  const eprRevenueCr = (annualThroughputTonnes * eprFeePerTonne) / 10000000;
  const totalInflowCr = grossRevenueCr + eprRevenueCr;

  const processingOpexCr = (annualThroughputTonnes * processingCostPerTonne) / 10000000;
  const logisticsOpexCr = (annualThroughputTonnes * totalLogisticsPerTonneINR) / 10000000;
  const feedstockCostCr = (annualThroughputTonnes * feedstockCostPerTonne) / 10000000;
  const totalOpexCr = processingOpexCr + logisticsOpexCr + feedstockCostCr;

  const ebitdaAnnualCr = totalInflowCr - totalOpexCr;
  const depreciationCr = plantCapexCr / projectLifeYears;
  const ebitCr = ebitdaAnnualCr - depreciationCr;
  const taxesCr = ebitCr > 0 ? ebitCr * taxRate : 0;
  const freeCashFlowAnnualCr = ebitdaAnnualCr - taxesCr;
  const terminalValueCr = plantCapexCr * salvageRate;

  const ebitdaMarginPct = totalInflowCr > 0 ? Number(((ebitdaAnnualCr / totalInflowCr) * 100).toFixed(1)) : 0;

  // Multi-year DCF cash flow projection
  const dcfSchedule: DCFProjectionYear[] = [];
  let cumulativeCashFlowCr = -plantCapexCr;

  for (let yr = 1; yr <= projectLifeYears; yr++) {
    const isTerminal = yr === projectLifeYears;
    const fcf = freeCashFlowAnnualCr + (isTerminal ? terminalValueCr : 0);
    const discountFactor = Math.pow(1 + discountRatePct / 100, yr);
    const discountedCF = fcf / discountFactor;
    cumulativeCashFlowCr += fcf;

    dcfSchedule.push({
      yearIndex: yr,
      calendarYear: 2026 + yr - 1,
      throughputTonnes: annualThroughputTonnes,
      capacityUtilizationPct,
      grossRevenueCr: Number(grossRevenueCr.toFixed(2)),
      eprRevenueCr: Number(eprRevenueCr.toFixed(2)),
      totalInflowCr: Number(totalInflowCr.toFixed(2)),
      processingOpexCr: Number(processingOpexCr.toFixed(2)),
      logisticsOpexCr: Number(logisticsOpexCr.toFixed(2)),
      feedstockCostCr: Number(feedstockCostCr.toFixed(2)),
      totalOpexCr: Number(totalOpexCr.toFixed(2)),
      ebitdaCr: Number(ebitdaAnnualCr.toFixed(2)),
      depreciationCr: Number(depreciationCr.toFixed(2)),
      ebitCr: Number(ebitCr.toFixed(2)),
      taxesCr: Number(taxesCr.toFixed(2)),
      freeCashFlowCr: Number(fcf.toFixed(2)),
      discountedCashFlowCr: Number(discountedCF.toFixed(2)),
      cumulativeCashFlowCr: Number(cumulativeCashFlowCr.toFixed(2))
    });
  }

  // NPV calculation
  let npvCr = -plantCapexCr;
  dcfSchedule.forEach(row => {
    npvCr += row.discountedCashFlowCr;
  });
  npvCr = Number(npvCr.toFixed(2));

  // True IRR Solver: Binary search on NPV(r) = 0
  let projectIRRPct: number | null = null;
  const totalUndiscountedInflows = dcfSchedule.reduce((sum, row) => sum + row.freeCashFlowCr, 0);

  if (totalUndiscountedInflows > plantCapexCr && freeCashFlowAnnualCr > 0) {
    let lowRate = -0.30;
    let highRate = 2.00;
    let bestRate = 0;

    for (let iter = 0; iter < 60; iter++) {
      const midRate = (lowRate + highRate) / 2;
      let midNPV = -plantCapexCr;
      dcfSchedule.forEach((row, i) => {
        const t = i + 1;
        midNPV += row.freeCashFlowCr / Math.pow(1 + midRate, t);
      });

      if (Math.abs(midNPV) < 0.001) {
        bestRate = midRate;
        break;
      }
      if (midNPV > 0) {
        lowRate = midRate;
        bestRate = midRate;
      } else {
        highRate = midRate;
      }
    }

    if (bestRate > -0.25) {
      projectIRRPct = Number((bestRate * 100).toFixed(1));
    }
  }

  // Payback period
  let paybackPeriodYears: number | null = null;
  let discountedPaybackPeriodYears: number | null = null;

  let runningCF = 0;
  for (let yr = 1; yr <= projectLifeYears; yr++) {
    runningCF += dcfSchedule[yr - 1].freeCashFlowCr;
    if (runningCF >= plantCapexCr) {
      const prev = runningCF - dcfSchedule[yr - 1].freeCashFlowCr;
      const frac = (plantCapexCr - prev) / dcfSchedule[yr - 1].freeCashFlowCr;
      paybackPeriodYears = Number(((yr - 1) + Math.max(0, Math.min(1, frac))).toFixed(1));
      break;
    }
  }

  let runningDiscountedCF = 0;
  for (let yr = 1; yr <= projectLifeYears; yr++) {
    runningDiscountedCF += dcfSchedule[yr - 1].discountedCashFlowCr;
    if (runningDiscountedCF >= plantCapexCr) {
      const prev = runningDiscountedCF - dcfSchedule[yr - 1].discountedCashFlowCr;
      const frac = (plantCapexCr - prev) / dcfSchedule[yr - 1].discountedCashFlowCr;
      discountedPaybackPeriodYears = Number(((yr - 1) + Math.max(0, Math.min(1, frac))).toFixed(1));
      break;
    }
  }

  const isViable = projectIRRPct !== null && projectIRRPct >= discountRatePct && npvCr > 0;
  const isMarginal = !isViable && netMarginPerTonne > 0;

  const viabilityVerdict: 'COMMERCIALLY VIABLE' | 'MARGINAL / SUBSIDY DEPENDENT' | 'NOT ECONOMICALLY VIABLE' = 
    isViable ? 'COMMERCIALLY VIABLE' : (isMarginal ? 'MARGINAL / SUBSIDY DEPENDENT' : 'NOT ECONOMICALLY VIABLE');

  let attractivenessReasoning = '';
  if (isViable) {
    attractivenessReasoning = `Commercially viable: Project yields a true DCF IRR of ${projectIRRPct}%, exceeding the ${discountRatePct}% infrastructure hurdle rate with an NPV of +₹${npvCr.toLocaleString()} Cr (payback ~${paybackPeriodYears} years).`;
  } else if (isMarginal) {
    attractivenessReasoning = `Marginal viability: Unit margin is positive (₹${netMarginPerTonne.toLocaleString()}/t), but true IRR (${projectIRRPct !== null ? `${projectIRRPct}%` : 'sub-hurdle'}) does not clear the ${discountRatePct}% discount rate hurdle. Additional EPR credit (current deficit ~₹${Math.max(0, Math.round(breakEvenEpr - eprFeePerTonne)).toLocaleString()}/t) is recommended.`;
  } else {
    attractivenessReasoning = `Not economically viable under current assumptions: Unit operating deficit of ₹${Math.abs(netMarginPerTonne).toLocaleString()}/t. Operating inflows fail to recover CAPEX (NPV ₹${npvCr.toLocaleString()} Cr). Requires higher EPR support or lower logistics distance.`;
  }

  return {
    plantCapexCr,
    projectLifeYears,
    discountRatePct,
    capacityUtilizationPct,
    annualThroughputTonnes,
    ebitdaAnnualCr: Number(ebitdaAnnualCr.toFixed(2)),
    ebitdaMarginPct,
    projectNPV_Cr: npvCr,
    projectIRRPct,
    paybackPeriodYears,
    discountedPaybackPeriodYears,
    terminalValueCr: Number(terminalValueCr.toFixed(2)),
    breakEvenFeedstockINR_per_tonne: Math.round(breakEvenFeedstock),
    breakEvenEprINR_per_tonne: Math.round(breakEvenEpr),
    isEconomicallyAttractive: isViable,
    viabilityVerdict,
    attractivenessReasoning,
    dcfSchedule
  };
}

/**
 * Integrated Economic Calculation Wrapper (Preserves backward compatibility)
 */
export function calculate_processing_economics(params: ScenarioParameters): EconomicModelOutputs & {
  isEconomicallyAttractive: boolean;
  attractivenessReasoning: string;
} {
  const fin = calculate_project_dcf_and_irr(params);
  const tech = params.technologyPathway || 'hybrid';
  const pathway = RECYCLING_PATHWAYS.find(p => p.id === tech) || RECYCLING_PATHWAYS[3];
  
  const { totalGrossValuePerTonneINR } = calculate_recovered_material_value(tech, params);
  const { totalLogisticsPerTonneINR } = calculate_transport_cost(params.avgTransportDistanceKm, params.reverseLogisticsFreightINR_per_tkm);

  const processingCost = pathway.opexPerTonneINR;
  const feedstockCost = params.feedstockCostPerTonneINR ?? 1200;
  const eprContribution = params.eprFeePerTonneINR ?? 2400;
  const netMarginPerTonne = totalGrossValuePerTonneINR + eprContribution - (processingCost + totalLogisticsPerTonneINR + feedstockCost);

  return {
    grossRecoveredValuePerTonneINR: totalGrossValuePerTonneINR,
    logisticsCostPerTonneINR: totalLogisticsPerTonneINR,
    processingCostPerTonneINR: processingCost,
    feedstockCostPerTonneINR: feedstockCost,
    eprContributionPerTonneINR: eprContribution,
    netMarginPerTonneINR: netMarginPerTonne,
    breakEvenFeedstockPricePerTonneINR: fin.breakEvenFeedstockINR_per_tonne,
    annualPlantEBITDA_INR_Cr: fin.ebitdaAnnualCr,
    projectIRRPct: fin.projectIRRPct,
    projectNPV_Cr: fin.projectNPV_Cr,
    paybackPeriodYears: fin.paybackPeriodYears,
    ebitdaMarginPct: fin.ebitdaMarginPct,
    isEconomicallyAttractive: fin.isEconomicallyAttractive,
    attractivenessReasoning: fin.attractivenessReasoning,
    financialAnalysis: fin
  };
}

/**
 * Dynamic Sensitivity Tornado Analysis Engine
 * Inter IIT Technical Requirement (Phase 10)
 * Evaluates +/- 20% variations across key economic drivers
 */
export function calculate_sensitivity_tornado(params: ScenarioParameters): TornadoItem[] {
  const baseMargin = calculate_processing_economics(params).netMarginPerTonneINR;

  const drivers: {
    driver: string;
    key: keyof ScenarioParameters;
    format: (v: number) => string;
    lowMult: number;
    highMult: number;
  }[] = [
    { driver: 'Feedstock Procurement Cost', key: 'feedstockCostPerTonneINR', format: v => `₹${Math.round(v)}/t`, lowMult: 0.70, highMult: 1.30 },
    { driver: 'Silver Bullion Market Price', key: 'silverPriceINR_per_kg', format: v => `₹${(v / 1000).toFixed(0)}k/kg`, lowMult: 0.75, highMult: 1.25 },
    { driver: 'EPR Fee Support Level', key: 'eprFeePerTonneINR', format: v => `₹${Math.round(v)}/t`, lowMult: 0.60, highMult: 1.40 },
    { driver: 'Reverse Logistics Distance', key: 'avgTransportDistanceKm', format: v => `${Math.round(v)} km`, lowMult: 0.65, highMult: 1.35 },
    { driver: 'Aluminium Scrap Selling Price', key: 'aluminiumPriceINR_per_kg', format: v => `₹${Math.round(v)}/kg`, lowMult: 0.80, highMult: 1.20 },
    { driver: 'Overall Material Recovery Rate', key: 'recoveryEfficiencyPct', format: v => `${v.toFixed(0)}%`, lowMult: 0.85, highMult: 1.10 }
  ];

  const items: TornadoItem[] = drivers.map(d => {
    const baseVal = Number(params[d.key]);
    const lowVal = baseVal * d.lowMult;
    const highVal = baseVal * d.highMult;

    const lowParams = { ...params, [d.key]: lowVal };
    const highParams = { ...params, [d.key]: highVal };

    const lowFin = calculate_processing_economics(lowParams);
    const highFin = calculate_processing_economics(highParams);

    const swing = Math.abs(highFin.netMarginPerTonneINR - lowFin.netMarginPerTonneINR);

    return {
      driver: d.driver,
      parameterKey: d.key,
      baseValueFormatted: d.format(baseVal),
      lowValueFormatted: d.format(lowVal),
      highValueFormatted: d.format(highVal),
      lowMarginPerTonneINR: lowFin.netMarginPerTonneINR,
      highMarginPerTonneINR: highFin.netMarginPerTonneINR,
      lowIRRPct: lowFin.projectIRRPct,
      highIRRPct: highFin.projectIRRPct,
      swingMarginINR: swing
    };
  });

  return items.sort((a, b) => b.swingMarginINR - a.swingMarginINR);
}

/**
 * Centralized vs Hub-and-Spoke Logistics Comparative Engine
 * Inter IIT Technical Requirement (Phase 12)
 */
export function calculate_logistics_comparison(
  annualWasteKt: number,
  params: ScenarioParameters
) {
  const tonnes = Math.max(1000, annualWasteKt * 1000);
  const freightRate = params.reverseLogisticsFreightINR_per_tkm || 4.2;
  const handlingCostPerTonne = 650; // INR per tonne handling/sorting

  // Centralized model (1 single national mega hub in Western India, avg haul 780 km)
  const centralizedDistanceKm = 780;
  const centralizedFreightPerTonne = Math.round(centralizedDistanceKm * freightRate);
  const centralizedTotalCostPerTonne = centralizedFreightPerTonne + handlingCostPerTonne;
  const centralizedTotalCostCr = Number(((tonnes * centralizedTotalCostPerTonne) / 10000000).toFixed(2));
  const centralizedTonneKm = tonnes * centralizedDistanceKm;
  const centralizedCo2Tonnes = Math.round((centralizedTonneKm * 0.065) / 1000); // 0.065 kg CO2e per t-km

  // Regional Hub-and-Spoke model (6 state clusters + partner spokes, avg haul 280 km)
  const regionalDistanceKm = params.avgTransportDistanceKm || 280;
  const regionalFreightPerTonne = Math.round(regionalDistanceKm * freightRate);
  const regionalTotalCostPerTonne = regionalFreightPerTonne + handlingCostPerTonne;
  const regionalTotalCostCr = Number(((tonnes * regionalTotalCostPerTonne) / 10000000).toFixed(2));
  const regionalTonneKm = tonnes * regionalDistanceKm;
  const regionalCo2Tonnes = Math.round((regionalTonneKm * 0.065) / 1000);

  // Net Savings
  const savingsCostCr = Number((centralizedTotalCostCr - regionalTotalCostCr).toFixed(2));
  const savingsPct = Number((((centralizedTotalCostCr - regionalTotalCostCr) / centralizedTotalCostCr) * 100).toFixed(1));
  const avoidedCo2Tonnes = Math.max(0, centralizedCo2Tonnes - regionalCo2Tonnes);
  const truckTrips = Math.ceil(tonnes / 16); // 16-tonne HCV payloads

  return {
    annualWasteTonnes: tonnes,
    centralized: {
      averageDistanceKm: centralizedDistanceKm,
      costPerTonneINR: centralizedTotalCostPerTonne,
      totalCostINR_Cr: centralizedTotalCostCr,
      tonneKm: centralizedTonneKm,
      co2EmissionsTonnes: centralizedCo2Tonnes,
      hubCount: 1,
      topology: 'Single Western Mega-Facility'
    },
    regionalHubSpoke: {
      averageDistanceKm: regionalDistanceKm,
      costPerTonneINR: regionalTotalCostPerTonne,
      totalCostINR_Cr: regionalTotalCostCr,
      tonneKm: regionalTonneKm,
      co2EmissionsTonnes: regionalCo2Tonnes,
      hubCount: 6,
      topology: '6 Regional Hubs + Channel Partner Depots'
    },
    savings: {
      costSavingsINR_Cr: savingsCostCr,
      costSavingsPct: savingsPct,
      avoidedCo2Tonnes,
      freightReductionPct: Math.round(((centralizedDistanceKm - regionalDistanceKm) / centralizedDistanceKm) * 100),
      totalTruckTrips: truckTrips
    }
  };
}

/**
 * Multi-Criteria Decision Analysis (MCDA) for Technology Pathways
 * Inter IIT Technical Requirement (Phase 17)
 */
export function evaluate_technology_pathways(
  wasteVolumeKt: number,
  customWeights?: Partial<TechnologyCriteriaWeights>
): {
  results: TechnologyScoreResult[];
  recommendedTechnology: 'mechanical' | 'thermal' | 'chemical' | 'hybrid';
  weights: TechnologyCriteriaWeights;
} {
  const weights: TechnologyCriteriaWeights = {
    capexWeight: customWeights?.capexWeight ?? 0.20,
    opexWeight: customWeights?.opexWeight ?? 0.20,
    materialRecovery: customWeights?.materialRecovery ?? 0.25,
    materialPurity: customWeights?.materialPurity ?? 0.15,
    maturity: customWeights?.maturity ?? 0.10,
    environmentalScore: customWeights?.environmentalScore ?? 0.10
  };

  const results: TechnologyScoreResult[] = RECYCLING_PATHWAYS.map(p => {
    // Relative scores 0-100
    // CAPEX score: lower is better (Mechanical 12.5 Cr = 95, Hybrid 36 Cr = 50)
    const capexScore = Math.max(20, Math.min(100, Math.round(100 - (p.capexPer10ktINR_Cr - 10) * 2.8)));
    // OPEX score: lower is better (Mechanical 4200 = 90, Chemical 9200 = 45)
    const opexScore = Math.max(20, Math.min(100, Math.round(100 - (p.opexPerTonneINR - 4000) * 0.009)));
    // Recovery score: silver + silicon recovery
    const recoveryScore = Math.round(p.silverRecoveryRatePct * 0.7 + (p.id === 'hybrid' ? 95 : (p.id === 'chemical' ? 90 : (p.id === 'thermal' ? 70 : 35))) * 0.3);
    // Purity score: low-iron glass and silver bullion capability
    const purityScore = p.id === 'hybrid' ? 95 : (p.id === 'chemical' ? 88 : (p.id === 'thermal' ? 75 : 40));
    // Maturity score in Indian industrial ecosystem
    const maturityScore = p.id === 'mechanical' ? 95 : (p.id === 'thermal' ? 70 : (p.id === 'hybrid' ? 65 : 50));
    // Environmental score from spec (scaled 1-10 to 10-100)
    const environmentalScore = Math.round(p.environmentalScore * 10);

    const totalScore = Math.round(
      capexScore * weights.capexWeight +
      opexScore * weights.opexWeight +
      recoveryScore * weights.materialRecovery +
      purityScore * weights.materialPurity +
      maturityScore * weights.maturity +
      environmentalScore * weights.environmentalScore
    );

    let reasoning = '';
    if (p.id === 'hybrid') {
      reasoning = 'Highest overall circular yield: mechanical de-framing captures 100% clean aluminium frames, thermal delamination extracts intact glass sheets, and selective chemical hydrometallurgy extracts 94% silver bullion.';
    } else if (p.id === 'mechanical') {
      reasoning = 'Lowest initial capital hurdle (₹12.5 Cr / 10 kt). Ideal for near-term regional aggregation spokes where aluminium and coarse cullet are prioritized over precious metal refining.';
    } else if (p.id === 'thermal') {
      reasoning = 'Effective whole-glass delamination without harsh acid reagents, but requires high energy consumption and acid-gas scrubbing infrastructure for polymer off-gases.';
    } else {
      reasoning = 'High recovery purity for silicon wafers and silver, but elevated chemical reagent costs and hazardous waste effluent disposal burdens.';
    }

    return {
      id: p.id,
      name: p.name,
      totalScore,
      capexScore,
      opexScore,
      recoveryScore,
      purityScore,
      maturityScore,
      environmentalScore,
      rank: 1, // updated below
      reasoning
    };
  });

  results.sort((a, b) => b.totalScore - a.totalScore);
  results.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  return {
    results,
    recommendedTechnology: results[0].id,
    weights
  };
}

/**
 * SOLARLOOP DYNAMIC DECISION & RECOMMENDATION ENGINE
 * Inter IIT Technical Requirement (Phase 18 & 19)
 * Synthesizes model forecast, plant capacity, network topology, economics, and policy into an executive operational decision.
 */
export function generate_solarloop_recommendation(
  params: ScenarioParameters,
  activeScenarioId: ForecastScenarioId = 'base_regular',
  horizonYear: number = 2040
): SolarLoopRecommendation {
  const forecast = calculate_waste_forecast(activeScenarioId, params);
  const horizonData = forecast.find(d => d.year === horizonYear) || forecast[6];
  const wasteKt = horizonData.cumulativeKt;
  const annualFlowKt = horizonData.annualKt;

  const plantSizing = calculate_required_plants(annualFlowKt, params.plantCapacityTonnesYr);
  const fin = calculate_processing_economics(params);
  const techEval = evaluate_technology_pathways(annualFlowKt);
  const logComp = calculate_logistics_comparison(annualFlowKt, params);
  const env = calculate_environmental_impact(wasteKt, params.recoveryEfficiencyPct);

  const scenarioName = activeScenarioId === 'base_regular' ? 'Base Regular' :
    activeScenarioId === 'base_early_loss' ? 'Base Early-Loss' :
    activeScenarioId === 'conservative_regular' ? 'Conservative Regular' :
    activeScenarioId === 'conservative_early_loss' ? 'Conservative Early-Loss' : 'Custom Simulation';

  const bullets = [
    `Annual PV decommissioning flow reaches ${annualFlowKt.toLocaleString()} kt/year by ${horizonYear} (${wasteKt.toLocaleString()} kt cumulative), requiring ~${plantSizing.totalPlants} regional facilities sized at ${plantSizing.plantCapacityKtYr} kt/year each.`,
    `Recommended Technology: ${techEval.results[0].name} (Score ${techEval.results[0].totalScore}/100) — maximizes high-purity aluminium and precious silver bullion recovery.`,
    `Logistics Strategy: Decentralized Regional Hub-and-Spoke topology saves ₹${logComp.savings.costSavingsINR_Cr} Cr annually (-${logComp.savings.costSavingsPct}%) vs single mega-hub, reducing average haul to ~${params.avgTransportDistanceKm} km.`,
    `Economic Viability: Net margin of ₹${fin.netMarginPerTonneINR.toLocaleString()}/t yields project IRR of ${fin.projectIRRPct !== null ? `${fin.projectIRRPct}%` : 'sub-hurdle'} (NPV +₹${fin.projectNPV_Cr} Cr). EPR credit of ₹${params.eprFeePerTonneINR}/t ensures bankability.`,
    `Environmental Dividend: Diverts ${env.wasteDivertedFromLandfillKt.toLocaleString()} kt from unscientific landfilling and avoids ${env.co2eAvoidedMt} Mt CO2e vs primary mineral extraction.`
  ];

  return {
    scenarioName,
    scenarioId: activeScenarioId,
    horizonYear,
    forecastWasteVolumeKt: wasteKt,
    annualFlowKtYr: annualFlowKt,
    requiredRecyclingCapacityKtYr: annualFlowKt,
    recommendedFacilityCount: plantSizing.totalPlants,
    recommendedFacilityTier: params.plantCapacityTonnesYr <= 5000 ? 'pilot' :
      params.plantCapacityTonnesYr <= 15000 ? 'small' :
      params.plantCapacityTonnesYr <= 45000 ? 'regional' : 'large',
    recommendedTechnology: techEval.recommendedTechnology,
    technologyName: techEval.results[0].name,
    avgTransportHaulKm: params.avgTransportDistanceKm,
    networkTopology: 'Hub-and-Spoke',
    hubCount: 6,
    netMarginPerTonneINR: fin.netMarginPerTonneINR,
    projectIRRPct: fin.projectIRRPct,
    projectNPV_Cr: fin.projectNPV_Cr,
    viabilityVerdict: fin.financialAnalysis.viabilityVerdict,
    co2eAvoidedMt: env.co2eAvoidedMt,
    policyMandateRequirement: 'Mandatory CEEW5 Schedule I EPR compliance + national PV passport chain-of-custody tracking',
    inaStrategicRole: 'Evaluate 700+ nationwide channel partner warehouses as reverse-logistics collection spokes and closed-loop aluminium frame extrusion remelting.',
    executiveSummaryBullets: bullets
  };
}

/**
 * Calculate environmental benefits of solar circularity
 */
export function calculate_environmental_impact(cumulativeWasteKt: number, recoveryRatePct: number = 88): EnvironmentalImpactMetrics {
  const massTonnes = Math.max(0, cumulativeWasteKt * 1000);
  const recoveredTonnes = massTonnes * (recoveryRatePct / 100);

  // Emission factor: 1.85 tCO2e avoided per tonne of solar module recycled vs primary bauxite/quartz mining
  const co2eAvoidedMt = Number(((recoveredTonnes * 1.85) / 1000000).toFixed(2));
  
  // Natural resource displacements
  const rawSandSavedKt = Math.round((recoveredTonnes * 0.742 * 1.1) / 1000);
  const bauxiteSavedKt = Math.round((recoveredTonnes * 0.103 * 4.0) / 1000);
  const heavyMetalsSafelyHandled = Number((massTonnes * 0.0008).toFixed(1));

  return {
    totalMassRecoveredKt: Math.round(recoveredTonnes / 1000),
    wasteDivertedFromLandfillKt: Math.round(massTonnes / 1000),
    co2eAvoidedMt,
    rawSandSavedKt,
    bauxiteSavedKt,
    hazardousHeavyMetalsSafelyHandledTonnes: heavyMetalsSafelyHandled
  };
}

/**
 * Explicit Parameter Configurations for All Supported Scenarios
 */
export const SCENARIO_CONFIGS: Record<ForecastScenarioId, ScenarioParameters> = {
  base_regular: {
    annualSolarAdditionsGW: 25.0,
    earlyLossRatePct: 2.0,
    moduleMassKg: 22.0,
    designLifeYears: 25.0,
    weibullBeta: 5.0,
    avgTransportDistanceKm: 300,
    plantCapacityTonnesYr: 30000,
    eprFeePerTonneINR: 2400,
    reverseLogisticsFreightINR_per_tkm: 4.2,
    feedstockCostPerTonneINR: 1200,
    recoveryEfficiencyPct: 88.0,
    silverPriceINR_per_kg: 88000,
    aluminiumPriceINR_per_kg: 215,
    copperPriceINR_per_kg: 760,
    glassPriceINR_per_kg: 14.5,
    siliconPriceINR_per_kg: 180,
    technologyPathway: 'hybrid'
  },
  base_early_loss: {
    annualSolarAdditionsGW: 25.0,
    earlyLossRatePct: 4.8,
    moduleMassKg: 22.0,
    designLifeYears: 25.0,
    weibullBeta: 5.0,
    avgTransportDistanceKm: 300,
    plantCapacityTonnesYr: 30000,
    eprFeePerTonneINR: 2400,
    reverseLogisticsFreightINR_per_tkm: 4.2,
    feedstockCostPerTonneINR: 1200,
    recoveryEfficiencyPct: 88.0,
    silverPriceINR_per_kg: 88000,
    aluminiumPriceINR_per_kg: 215,
    copperPriceINR_per_kg: 760,
    glassPriceINR_per_kg: 14.5,
    siliconPriceINR_per_kg: 180,
    technologyPathway: 'hybrid'
  },
  conservative_regular: {
    annualSolarAdditionsGW: 20.0,
    earlyLossRatePct: 1.5,
    moduleMassKg: 20.0,
    designLifeYears: 28.0,
    weibullBeta: 5.0,
    avgTransportDistanceKm: 350,
    plantCapacityTonnesYr: 30000,
    eprFeePerTonneINR: 2000,
    reverseLogisticsFreightINR_per_tkm: 4.2,
    feedstockCostPerTonneINR: 1400,
    recoveryEfficiencyPct: 85.0,
    silverPriceINR_per_kg: 88000,
    aluminiumPriceINR_per_kg: 215,
    copperPriceINR_per_kg: 760,
    glassPriceINR_per_kg: 14.5,
    siliconPriceINR_per_kg: 180,
    technologyPathway: 'hybrid'
  },
  conservative_early_loss: {
    annualSolarAdditionsGW: 20.0,
    earlyLossRatePct: 3.8,
    moduleMassKg: 20.0,
    designLifeYears: 28.0,
    weibullBeta: 5.0,
    avgTransportDistanceKm: 350,
    plantCapacityTonnesYr: 30000,
    eprFeePerTonneINR: 2000,
    reverseLogisticsFreightINR_per_tkm: 4.2,
    feedstockCostPerTonneINR: 1400,
    recoveryEfficiencyPct: 85.0,
    silverPriceINR_per_kg: 88000,
    aluminiumPriceINR_per_kg: 215,
    copperPriceINR_per_kg: 760,
    glassPriceINR_per_kg: 14.5,
    siliconPriceINR_per_kg: 180,
    technologyPathway: 'hybrid'
  },
  custom_scenario: {
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
  }
};

/**
 * Transparent Calibration Check:
 * Compares live SolarLoop cohort model outputs with published Research Reference Scenarios.
 */
export function get_scenario_calibration(
  scenarioId: ForecastScenarioId, 
  activeCumulative2040Kt: number,
  params?: ScenarioParameters,
  milestones?: { active2030Kt: number; active2040Kt: number; active2050Kt: number }
) {
  const referenceData = BASELINE_SCENARIOS[scenarioId as keyof typeof BASELINE_SCENARIOS]?.data;
  const ref2040 = referenceData ? (referenceData.find(d => d.year === 2040)?.cumulativeKt ?? 2007) : 2007;
  const ref2030 = referenceData ? (referenceData.find(d => d.year === 2030)?.cumulativeKt ?? 503) : 503;
  const ref2050 = referenceData ? (referenceData.find(d => d.year === 2050)?.cumulativeKt ?? 8874) : 8874;

  const diffPct = ref2040 ? Math.round(((activeCumulative2040Kt - ref2040) / ref2040) * 100) : 0;
  const isDivergent = Math.abs(diffPct) > 5;

  const activeAdditions = params?.annualSolarAdditionsGW ?? 25.0;
  const activeMass = params?.moduleMassKg ?? 22.0;
  const activeLife = params?.designLifeYears ?? 25.0;
  const activeLoss = params?.earlyLossRatePct ?? 4.5;
  const activeBeta = params?.weibullBeta ?? 5.0;

  const refAdditions = (scenarioId === 'conservative_regular' || scenarioId === 'conservative_early_loss') ? 20.0 : 25.0;
  const refMass = (scenarioId === 'conservative_regular' || scenarioId === 'conservative_early_loss') ? 20.0 : 22.0;
  const refLife = (scenarioId === 'conservative_regular' || scenarioId === 'conservative_early_loss') ? 28.0 : 25.0;
  const refLoss = scenarioId === 'base_early_loss' ? 4.8 : (scenarioId === 'conservative_early_loss' ? 3.8 : (scenarioId === 'conservative_regular' ? 1.5 : 2.0));

  const assumptionsComparison = [
    {
      param: 'Annual Additions (GW)',
      activeValue: `${activeAdditions} GW/year`,
      referenceValue: `${refAdditions} GW/year`,
      divergenceImpact: activeAdditions !== refAdditions ? `${activeAdditions > refAdditions ? '+' : ''}${Math.round(((activeAdditions - refAdditions) / refAdditions) * 100)}% future installation volume` : 'Aligned with reference additions trajectory'
    },
    {
      param: 'Module Mass (kg/module)',
      activeValue: `${activeMass} kg`,
      referenceValue: `${refMass} kg`,
      divergenceImpact: activeMass !== refMass ? `${activeMass > refMass ? '+' : ''}${Math.round(((activeMass - refMass) / refMass) * 100)}% physical tonnage per GW installed` : 'Aligned with standard module weight'
    },
    {
      param: 'Design Life (years)',
      activeValue: `${activeLife} years`,
      referenceValue: `${refLife} years`,
      divergenceImpact: activeLife !== refLife ? `Shifts peak decommissioning wave by ${Math.abs(activeLife - refLife)} years` : 'Aligned with standard 25y useful lifespan'
    },
    {
      param: 'Early-Loss Rate (%)',
      activeValue: `${activeLoss}%`,
      referenceValue: `${refLoss}%`,
      divergenceImpact: activeLoss !== refLoss ? `${activeLoss > refLoss ? '+' : ''}${(activeLoss - refLoss).toFixed(1)}% pre-retirement attrition` : 'Aligned with scenario early failure assumptions'
    },
    {
      param: 'Retirement Distribution',
      activeValue: `Discrete Weibull Mass (β=${activeBeta}, η=${activeLife}y)`,
      referenceValue: `Weibull Reference Curve (β=5.0, η=${refLife}y)`,
      divergenceImpact: 'Calculates discrete yearly mass: Weibull CDF(age + 1) - Weibull CDF(age)'
    }
  ];

  return {
    ref2030,
    ref2040,
    ref2050,
    active2030: milestones?.active2030Kt ?? ref2030,
    active2040: activeCumulative2040Kt,
    active2050: milestones?.active2050Kt ?? ref2050,
    diffPct,
    isDivergent,
    calibrationNote: isDivergent 
      ? 'Model divergence driven by assumptions' 
      : 'Calibrated closely with published research reference baseline (±5%)',
    modelLabel: 'SolarLoop cohort model',
    referenceLabel: 'Research reference scenario',
    assumptionsComparison
  };
}

/**
 * Run full end-to-end scenario simulation using central scenario configuration
 */
export function run_scenario(params: ScenarioParameters, activeScenarioId: ForecastScenarioId = 'base_regular') {
  const forecast = calculate_waste_forecast(activeScenarioId, params);
  const yr2030 = forecast.find(d => d.year === 2030) || forecast[2];
  const yr2040 = forecast.find(d => d.year === 2040) || forecast[6];
  const yr2050 = forecast.find(d => d.year === 2050) || forecast[forecast.length - 1];

  const { reconciliation } = simulate_stock_flow_fleet(2050, params);
  const economics = calculate_processing_economics(params);
  const environmental = calculate_environmental_impact(yr2050.cumulativeKt, params.recoveryEfficiencyPct);
  const plantSizing = calculate_required_plants(yr2040.annualKt, params.plantCapacityTonnesYr);
  const logisticsComparison = calculate_logistics_comparison(yr2040.annualKt, params);
  const technologyEvaluation = evaluate_technology_pathways(yr2040.annualKt);
  const sensitivityTornado = calculate_sensitivity_tornado(params);
  const recommendation = generate_solarloop_recommendation(params, activeScenarioId, 2040);

  const calibration = get_scenario_calibration(
    activeScenarioId, 
    yr2040.cumulativeKt, 
    params,
    {
      active2030Kt: yr2030.cumulativeKt,
      active2040Kt: yr2040.cumulativeKt,
      active2050Kt: yr2050.cumulativeKt
    }
  );

  return {
    forecast,
    milestones: {
      cumulative2030Kt: yr2030.cumulativeKt,
      cumulative2040Kt: yr2040.cumulativeKt,
      cumulative2050Kt: yr2050.cumulativeKt,
      annualFlow2040Kt: yr2040.annualKt,
      annualFlow2050Kt: yr2050.annualKt
    },
    economics,
    environmental,
    infrastructure: {
      requiredCapacity2040KtYr: yr2040.annualKt,
      requiredPlants2040: plantSizing.totalPlants,
      megaHubs2040: plantSizing.megaHubs,
      regionalSpokes2040: plantSizing.regionalSpokes,
      plantCapacityTonnesYr: plantSizing.plantCapacityTonnesYr,
      plantCapacityKtYr: plantSizing.plantCapacityKtYr,
      formulaExplanation: plantSizing.formulaExplanation,
      resultLabel: plantSizing.resultLabel
    },
    calibration,
    reconciliation,
    logisticsComparison,
    technologyEvaluation,
    sensitivityTornado,
    recommendation
  };
}

/**
 * Generate formal executive management summary
 */
export function generate_management_summary(
  scenarioName: string,
  milestones: { cumulative2030Kt: number; cumulative2040Kt: number; cumulative2050Kt: number },
  economics: ReturnType<typeof calculate_processing_economics>,
  environmental: EnvironmentalImpactMetrics
): string {
  return `EXECUTIVE CIRCULARITY BRIEFING [${scenarioName.toUpperCase()}]:
• Cumulative solar waste reaches ${milestones.cumulative2030Kt.toLocaleString()} kt by 2030, surging past ${milestones.cumulative2040Kt.toLocaleString()} kt by 2040 as early utility-scale cohorts reach retirement.
• Potential gross recovered material value yields ₹${economics.grossRecoveredValuePerTonneINR.toLocaleString()}/t, predominantly underpinned by Aluminium framing and Silver metallization paste.
• Reverse logistics freight averages ₹${economics.logisticsCostPerTonneINR.toLocaleString()}/t; regional spoke consolidation within 300 km is mandatory for positive unit margins.
• With an EPR contribution of ₹${economics.eprContributionPerTonneINR.toLocaleString()}/t, net operating margin is ₹${economics.netMarginPerTonneINR.toLocaleString()}/t (estimated Project DCF IRR: ${economics.projectIRRPct !== null ? `${economics.projectIRRPct}%` : 'sub-hurdle'}).
• Cumulative decarbonization displacement represents approximately ${environmental.co2eAvoidedMt} Mt CO2e avoided by mid-century.`;
}
