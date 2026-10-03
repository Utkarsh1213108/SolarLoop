/**
 * CANONICAL MIGRATION TEST SUITE
 * 
 * Programmatically validates the SolarLoop Canonical Analytical Platform against
 * authoritative ground truth data from:
 * - canonical/solar_waste_model_v2.py (FROZEN WASTE FORECASTING ENGINE)
 * - canonical/solarloop_engine.py
 * - canonical/solarloop_canonical_data.json
 * - canonical/validation_register.json
 * 
 * Verifies:
 * 1. Canonical JSON loads correctly with required metadata
 * 2. Exactly six canonical scenarios exist
 * 3. Base·Regular milestones (2030, 2040, 2050) match ground truth exactly
 * 4. Base·Early milestones (2030, 2040, 2050) match ground truth exactly
 * 5. High·Regular milestones match ground truth exactly
 * 6. High·Early milestones match ground truth exactly
 * 7. Conservative·Regular & Conservative·Early milestones match ground truth
 * 8. Strict non-negativity and cumulative monotonicity across all 6 scenarios (2026-2050)
 * 9. Canonical material baseline sums to exactly 100.000%
 * 10. Mass conservation: input_mass = recovered_material + co_processed + residual
 * 11. Chemical route polymer co-processing (113 kg/t) and TSDF residual (~90 kg/t)
 * 12. Mechanical route yields exactly 0% silver recovery
 * 13. Canonical economics reference benchmarks (-₹12,341, -₹5,938, +₹16,062, -₹10,200)
 * 14. Zero active repowering assumption in runtime execution
 * 15. Zero active 0.22% damage assumption in runtime execution
 */

import { 
  CANONICAL_DATA, 
  CANONICAL_SCENARIOS_META,
  CANONICAL_SCENARIO_MAP,
  getCanonicalScenario,
  getCanonicalTimeSeries,
  calculateCanonicalMaterialFlow,
  calculateCanonicalEconomics
} from '../data/canonicalLoader';

import { 
  run_scenario, 
  SCENARIO_CONFIGS,
  calculate_required_plants,
  calculate_transport_cost
} from './coreCalculations';

import { ForecastScenarioId } from '../types';

export interface TestResult {
  testId: string;
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  notes?: string;
}

export function run_all_integrity_tests(): {
  allPassed: boolean;
  totalTests: number;
  passCount: number;
  failCount: number;
  results: TestResult[];
} {
  const results: TestResult[] = [];

  // TEST 1: Canonical JSON loads correctly
  const hasMetadata = Boolean(
    CANONICAL_DATA?.model_metadata?.system_name &&
    CANONICAL_DATA?.model_metadata?.forecast_engine_version &&
    CANONICAL_DATA?.forecast_outputs &&
    CANONICAL_DATA?.material_model &&
    CANONICAL_DATA?.economics_reference
  );
  results.push({
    testId: 'MIG-01',
    name: 'Canonical JSON Schema & Metadata Load',
    passed: hasMetadata,
    expected: 'All root keys present with 2.0-SolarLoop version',
    actual: hasMetadata ? `${CANONICAL_DATA.model_metadata.system_name} (${CANONICAL_DATA.model_metadata.model_version})` : 'Missing metadata',
    notes: `Engine: ${CANONICAL_DATA.model_metadata.forecast_engine_version}`
  });

  // TEST 2: Exactly six canonical scenarios present
  const canonicalScenarioKeys = Object.keys(CANONICAL_DATA.forecast_outputs);
  const expectedScenarios = [
    'Conservative·Regular',
    'Conservative·Early',
    'Base·Regular',
    'Base·Early',
    'High·Regular',
    'High·Early'
  ];
  const all6Present = expectedScenarios.every(s => canonicalScenarioKeys.includes(s)) && canonicalScenarioKeys.length === 6;
  results.push({
    testId: 'MIG-02',
    name: 'Presence of Exactly Six Canonical Scenarios',
    passed: all6Present,
    expected: expectedScenarios.join(', '),
    actual: canonicalScenarioKeys.join(', '),
    notes: 'Exposes 3 trajectories (Conservative, Base, High) x 2 curves (Regular, Early-Loss)'
  });

  // TEST 3: Base·Regular milestones (2030, 2040, 2050)
  const baseReg = CANONICAL_DATA.forecast_outputs['Base·Regular'];
  const baseReg_2030_ann = baseReg.annual_series_kt['2030'];
  const baseReg_2030_cum = baseReg.cumulative_series_kt['2030'];
  const baseReg_2040_ann = baseReg.annual_series_kt['2040'];
  const baseReg_2040_cum = baseReg.cumulative_series_kt['2040'];
  const baseReg_2050_ann = baseReg.annual_series_kt['2050'];
  const baseReg_2050_cum = baseReg.cumulative_series_kt['2050'];

  const baseRegPassed = (
    baseReg_2030_ann === 75.93 &&
    baseReg_2030_cum === 503.42 &&
    baseReg_2040_ann === 255.75 &&
    baseReg_2040_cum === 2007.39 &&
    baseReg_2050_ann === 1220.53 &&
    baseReg_2050_cum === 8873.68
  );
  results.push({
    testId: 'MIG-03',
    name: 'Base·Regular Canonical Milestone Truth (2030, 2040, 2050)',
    passed: baseRegPassed,
    expected: '2030: 75.93 / 503.42 kt | 2040: 255.75 / 2007.39 kt | 2050: 1220.53 / 8873.68 kt',
    actual: `2030: ${baseReg_2030_ann} / ${baseReg_2030_cum} kt | 2040: ${baseReg_2040_ann} / ${baseReg_2040_cum} kt | 2050: ${baseReg_2050_ann} / ${baseReg_2050_cum} kt`,
    notes: 'Verified against solar_waste_model_v2.py (alpha=5.3759, beta=30.0)'
  });

  // TEST 4: Base·Early milestones (2030, 2040, 2050)
  const baseEarly = CANONICAL_DATA.forecast_outputs['Base·Early'];
  const baseEarly_2030_ann = baseEarly.annual_series_kt['2030'];
  const baseEarly_2030_cum = baseEarly.cumulative_series_kt['2030'];
  const baseEarly_2040_ann = baseEarly.annual_series_kt['2040'];
  const baseEarly_2040_cum = baseEarly.cumulative_series_kt['2040'];
  const baseEarly_2050_ann = baseEarly.annual_series_kt['2050'];
  const baseEarly_2050_cum = baseEarly.cumulative_series_kt['2050'];

  const baseEarlyPassed = (
    baseEarly_2030_ann === 156.48 &&
    baseEarly_2030_cum === 838.53 &&
    baseEarly_2040_ann === 675.12 &&
    baseEarly_2040_cum === 4832.89 &&
    baseEarly_2050_ann === 1661.55 &&
    baseEarly_2050_cum === 16768.25
  );
  results.push({
    testId: 'MIG-04',
    name: 'Base·Early Canonical Milestone Truth (2030, 2040, 2050)',
    passed: baseEarlyPassed,
    expected: '2030: 156.48 / 838.53 kt | 2040: 675.12 / 4832.89 kt | 2050: 1661.55 / 16768.25 kt',
    actual: `2030: ${baseEarly_2030_ann} / ${baseEarly_2030_cum} kt | 2040: ${baseEarly_2040_ann} / ${baseEarly_2040_cum} kt | 2050: ${baseEarly_2050_ann} / ${baseEarly_2050_cum} kt`,
    notes: 'Verified against solar_waste_model_v2.py (alpha=2.4928, beta=30.0)'
  });

  // TEST 5: High·Regular milestones (2030, 2040, 2050)
  const highReg = CANONICAL_DATA.forecast_outputs['High·Regular'];
  const highRegPassed = (
    highReg.annual_series_kt['2030'] === 89.27 &&
    highReg.cumulative_series_kt['2030'] === 556.78 &&
    highReg.annual_series_kt['2040'] === 289.59 &&
    highReg.cumulative_series_kt['2040'] === 2345.48 &&
    highReg.annual_series_kt['2050'] === 1414.59 &&
    highReg.cumulative_series_kt['2050'] === 10148.85
  );
  results.push({
    testId: 'MIG-05',
    name: 'High·Regular Canonical Milestone Truth',
    passed: highRegPassed,
    expected: '2030: 89.27 / 556.78 kt | 2040: 289.59 / 2345.48 kt | 2050: 1414.59 / 10148.85 kt',
    actual: `2030: ${highReg.annual_series_kt['2030']} / ${highReg.cumulative_series_kt['2030']} kt | 2040: ${highReg.annual_series_kt['2040']} / ${highReg.cumulative_series_kt['2040']} kt | 2050: ${highReg.annual_series_kt['2050']} / ${highReg.cumulative_series_kt['2050']} kt`
  });

  // TEST 6: High·Early milestones (2030, 2040, 2050)
  const highEarly = CANONICAL_DATA.forecast_outputs['High·Early'];
  const highEarlyPassed = (
    highEarly.annual_series_kt['2030'] === 171.64 &&
    highEarly.cumulative_series_kt['2030'] === 894.49 &&
    highEarly.annual_series_kt['2040'] === 795.55 &&
    highEarly.cumulative_series_kt['2040'] === 5526.14 &&
    highEarly.annual_series_kt['2050'] === 2071.82 &&
    highEarly.cumulative_series_kt['2050'] === 20118.04
  );
  results.push({
    testId: 'MIG-06',
    name: 'High·Early Canonical Milestone Truth',
    passed: highEarlyPassed,
    expected: '2030: 171.64 / 894.49 kt | 2040: 795.55 / 5526.14 kt | 2050: 2071.82 / 20118.04 kt',
    actual: `2030: ${highEarly.annual_series_kt['2030']} / ${highEarly.cumulative_series_kt['2030']} kt | 2040: ${highEarly.annual_series_kt['2040']} / ${highEarly.cumulative_series_kt['2040']} kt | 2050: ${highEarly.annual_series_kt['2050']} / ${highEarly.cumulative_series_kt['2050']} kt`
  });

  // TEST 7: Forecast Monotonicity & Non-Negativity across all scenarios (2026-2050)
  let monotonicityPassed = true;
  let nonNegativityPassed = true;

  for (const [scName, scData] of Object.entries(CANONICAL_DATA.forecast_outputs)) {
    let prevCum = 0;
    for (let yr = 2026; yr <= 2050; yr++) {
      const yrStr = String(yr);
      const ann = scData.annual_series_kt[yrStr];
      const cum = scData.cumulative_series_kt[yrStr];

      if (ann < 0 || cum < 0) {
        nonNegativityPassed = false;
      }
      if (cum < prevCum) {
        monotonicityPassed = false;
      }
      prevCum = cum;
    }
  }

  results.push({
    testId: 'MIG-07',
    name: 'Forecast Monotonicity & Non-Negativity (2026–2050)',
    passed: monotonicityPassed && nonNegativityPassed,
    expected: 'Cumulative strictly monotonic non-decreasing, annual >= 0 across all 6 scenarios',
    actual: `Monotonic: ${monotonicityPassed}, Non-negative: ${nonNegativityPassed}`,
    notes: 'Stock-flow accumulation integrity verified'
  });

  // TEST 8: Canonical Material Composition Baseline = exactly 100.000%
  const baseline = CANONICAL_DATA.material_model.canonical_baseline_cSi;
  const totalMassFraction = Object.values(baseline).reduce((s, item) => s + item.mass_fraction, 0);
  const totalKgPerTonne = Object.values(baseline).reduce((s, item) => s + item.kg_per_tonne, 0);
  const compositionPassed = Math.abs(totalMassFraction - 1.0) < 1e-6 && Math.abs(totalKgPerTonne - 1000.0) < 1e-3;

  results.push({
    testId: 'MIG-08',
    name: 'Canonical Material Baseline Sums to 100.000%',
    passed: compositionPassed,
    expected: 'Sum = 1.000000 (1,000.00 kg/t)',
    actual: `Sum = ${totalMassFraction.toFixed(6)} (${totalKgPerTonne.toFixed(2)} kg/t)`,
    notes: 'Glass 74.2%, Polymer 11.3%, Al 10.3%, Si 3.35%, Cu 0.57%, Ag 0.006%, Other 0.274%'
  });

  // TEST 9: Three-Category Disposition Mass Conservation
  // input_mass = recovered_material_mass + co_processed_mass + residual_mass
  const flowChem = calculateCanonicalMaterialFlow(1000.0, 'Chemical');
  const sumDispositionsChem = flowChem.recoveredMassTonnes + flowChem.coProcessedMassTonnes + flowChem.residualMassTonnes;
  const massBalanceChemPassed = Math.abs(sumDispositionsChem - 1000.0) < 1e-3;

  const flowMech = calculateCanonicalMaterialFlow(1000.0, 'Mechanical');
  const sumDispositionsMech = flowMech.recoveredMassTonnes + flowMech.coProcessedMassTonnes + flowMech.residualMassTonnes;
  const massBalanceMechPassed = Math.abs(sumDispositionsMech - 1000.0) < 1e-3;

  results.push({
    testId: 'MIG-09',
    name: 'Three-Category Disposition Mass Balance Closure',
    passed: massBalanceChemPassed && massBalanceMechPassed,
    expected: 'input_mass == recovered + co_processed + residual (1,000.00 kg/t)',
    actual: `Chemical: ${sumDispositionsChem.toFixed(2)} kg | Mechanical: ${sumDispositionsMech.toFixed(2)} kg`,
    notes: 'Strict mass conservation across all processing routes'
  });

  // TEST 10: Chemical Route Polymer Co-Processing (113 kg/t) & Residuals (~90 kg/t)
  const polymerCoproc = flowChem.coProcessed['Polymer'];
  const polymerRec = flowChem.recovered['Polymer'];
  const residualChemKg = flowChem.residualMassTonnes;

  const chemProfilePassed = (
    polymerRec === 0 &&
    Math.abs(polymerCoproc - 113.0) < 0.2 &&
    Math.abs(residualChemKg - 89.72) < 1.0
  );
  results.push({
    testId: 'MIG-10',
    name: 'Chemical Route Polymer Co-Processing & TSDF Compliance',
    passed: chemProfilePassed,
    expected: 'Polymer rec = 0 kg, Polymer coproc = 113 kg/t, Residual = ~90 kg/t (89.72 kg/t)',
    actual: `Polymer rec = ${polymerRec} kg, Polymer coproc = ${polymerCoproc.toFixed(1)} kg, Residual = ${residualChemKg.toFixed(2)} kg`,
    notes: 'Polymer routed to cement kilns; hazardous heavy metals (lead, tin) routed to TSDF'
  });

  // TEST 11: Mechanical Route Yields 0% Silver Recovery
  const silverRecMech = flowMech.recovered['Silver'];
  const mechAgPassed = silverRecMech === 0;
  results.push({
    testId: 'MIG-11',
    name: 'Mechanical Route Yields Exactly 0% Silver Recovery',
    passed: mechAgPassed,
    expected: '0.0 g/t recovered silver',
    actual: `${silverRecMech} g/t recovered silver`,
    notes: 'Mechanical shredding cannot delaminate cell grid fingers without chemical leaching'
  });

  // TEST 12: Canonical Economics Reference Cases Match Ground Truth
  const econCases = CANONICAL_DATA.economics_reference;
  const ceewPublishedNet = econCases.Published_CEEW_Chemical.net_inr_per_tonne;
  const silverRepricedNet = econCases.Silver_Repriced_Team_Case.net_inr_per_tonne;
  const eprFloorNet = econCases.EPR_Floor_Bankable_Case.net_inr_per_tonne;
  const mechPublishedNet = econCases.Published_CEEW_Mechanical.net_inr_per_tonne;

  const econCasesPassed = (
    ceewPublishedNet === -12341 &&
    silverRepricedNet === -5938 &&
    eprFloorNet === 16062 &&
    mechPublishedNet === -10200
  );
  results.push({
    testId: 'MIG-12',
    name: 'Canonical Economics Reference Cases Truth',
    passed: econCasesPassed,
    expected: 'CEEW: -₹12,341/t | Team Repriced: -₹5,938/t | EPR Floor: +₹16,062/t | Mechanical: -₹10,200/t',
    actual: `CEEW: ₹${ceewPublishedNet}/t | Team Repriced: ₹${silverRepricedNet}/t | EPR Floor: ₹${eprFloorNet}/t | Mechanical: ₹${mechPublishedNet}/t`,
    notes: 'CEEW 2025 Exhibit 25 unit economics'
  });

  // TEST 13: Parametric Economics Calculation Matches Canonical Reference Cases
  const econRunPublished = calculateCanonicalEconomics({
    silverPriceINR_per_g: 95.8,
    silverRecoveryRate: 0.74,
    feedstockCostINR_per_module: 600.0,
    haulDistanceKm: 360.0,
    eprCertificateINR_per_kg: 0.0
  });

  const econRunRepriced = calculateCanonicalEconomics({
    silverPriceINR_per_g: 240.0,
    silverRecoveryRate: 0.74,
    feedstockCostINR_per_module: 600.0,
    haulDistanceKm: 360.0,
    eprCertificateINR_per_kg: 0.0
  });

  const econRunEpr = calculateCanonicalEconomics({
    silverPriceINR_per_g: 240.0,
    silverRecoveryRate: 0.74,
    feedstockCostINR_per_module: 600.0,
    haulDistanceKm: 360.0,
    eprCertificateINR_per_kg: 22.0
  });

  const parametricPassed = (
    Math.abs(econRunPublished.netEconomicsINRPerTonne - (-12341)) <= 50 &&
    Math.abs(econRunRepriced.netEconomicsINRPerTonne - (-5938)) <= 50 &&
    Math.abs(econRunEpr.netEconomicsINRPerTonne - 16062) <= 50
  );
  results.push({
    testId: 'MIG-13',
    name: 'Parametric Unit Economics Alignment with Reference Cases',
    passed: parametricPassed,
    expected: '-₹12,341 / -₹5,938 / +₹16,062 per tonne (+/- ₹50 tolerance)',
    actual: `Published: ₹${econRunPublished.netEconomicsINRPerTonne} | Repriced: ₹${econRunRepriced.netEconomicsINRPerTonne} | EPR: ₹${econRunEpr.netEconomicsINRPerTonne}`,
    notes: 'Direct parametric mapping of solarloop_engine.py calculate_economics()'
  });

  // TEST 14: Zero Active Repowering Assumption in Execution
  const scenarioExecution = run_scenario(SCENARIO_CONFIGS.base_regular, 'base_regular');
  const repoweringWasteSum = scenarioExecution.annualBreakdowns.reduce((s, b) => s + b.repoweringKt, 0);
  const noRepowering = repoweringWasteSum === 0;

  results.push({
    testId: 'MIG-14',
    name: 'Zero Active Repowering Assumption',
    passed: noRepowering,
    expected: '0 kt repowering waste across all forecast years',
    actual: `${repoweringWasteSum} kt repowering waste`,
    notes: 'Legacy repowering assumptions successfully excluded from active execution'
  });

  // TEST 15: Zero Active 0.22% Damage Assumption in Execution
  const damagedWasteSum = scenarioExecution.annualBreakdowns.reduce((s, b) => s + b.damagedInsuranceKt, 0);
  const noDamaged = damagedWasteSum === 0;

  results.push({
    testId: 'MIG-15',
    name: 'Zero Active 0.22% Damage Assumption',
    passed: noDamaged,
    expected: '0 kt damaged insurance waste across all forecast years',
    actual: `${damagedWasteSum} kt damaged insurance waste`,
    notes: 'Legacy damage assumptions successfully excluded from active execution'
  });

  // Summary
  const passCount = results.filter(r => r.passed).length;
  const failCount = results.length - passCount;
  const allPassed = failCount === 0;

  return {
    allPassed,
    totalTests: results.length,
    passCount,
    failCount,
    results
  };
}
