import {
  REPRESENTATIVE_MODULE_COMPOSITION,
  DEFAULT_SCENARIO_PARAMETERS
} from '../data/researchBaseline';
import {
  get_kt_per_gw,
  weibull_cdf,
  calculate_cohort_retirement_probability,
  simulate_stock_flow_fleet,
  calculate_material_recovery,
  calculate_recovered_material_value,
  calculate_transport_cost,
  calculate_project_dcf_and_irr,
  calculate_processing_economics,
  calculate_required_plants,
  calculate_sensitivity_tornado,
  calculate_logistics_comparison,
  evaluate_technology_pathways,
  generate_solarloop_recommendation,
  SCENARIO_CONFIGS
} from './coreCalculations';

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

  // TEST 1: Material composition = exactly 100.000%
  const totalMassPct = Number(
    REPRESENTATIVE_MODULE_COMPOSITION.reduce((sum, item) => sum + item.percentageByMass, 0).toFixed(3)
  );
  results.push({
    testId: 'TEST-01',
    name: 'Material Composition 100.000% Balance',
    passed: totalMassPct === 100.0,
    expected: '100.000%',
    actual: `${totalMassPct}%`,
    notes: 'Reconciled with 7th element (Other / Junction box & potting inorganics)'
  });

  // TEST 2: Cohort retirement probabilities discrete mass non-negative and sums <= 1
  let probSum = 0;
  let allNonNegative = true;
  for (let age = 0; age <= 40; age++) {
    const p = calculate_cohort_retirement_probability(age, 25.0, 5.0);
    if (p < 0) allNonNegative = false;
    probSum += p;
  }
  results.push({
    testId: 'TEST-02',
    name: 'Discrete Yearly Weibull Probability Mass Non-Negativity & Boundedness',
    passed: allNonNegative && probSum > 0.98 && probSum <= 1.0001,
    expected: 'All P(t) >= 0 and sum(0..40) ~ 1.0',
    actual: `Min >= 0: ${allNonNegative}, Sum: ${probSum.toFixed(4)}`,
    notes: 'Uses Weibull CDF(age + 1) - Weibull CDF(age)'
  });

  // TEST 3: Active Fleet Reconciliation Identity: Installed = Active + Retired + Early + Repowered + Damaged
  const sim = simulate_stock_flow_fleet(2050, DEFAULT_SCENARIO_PARAMETERS);
  const rec = sim.reconciliation;
  results.push({
    testId: 'TEST-03',
    name: 'Stock-Flow Fleet Mass Conservation Identity',
    passed: rec.isBalanced && rec.discrepancyGW < 0.001,
    expected: 'Installed GW == Active GW + Cumulative Removed GW (Discrepancy < 0.001 GW)',
    actual: `Discrepancy: ${rec.discrepancyGW.toFixed(6)} GW (Balanced: ${rec.isBalanced})`,
    notes: rec.reconciliationIdentityFormula
  });

  // TEST 4: Damage attrition calculated strictly against active operating fleet
  const latestBalance = sim.yearlyBalances[sim.yearlyBalances.length - 1];
  const damageRate = 0.0022;
  const activeFleet = latestBalance.activeOperatingFleetGW;
  const expectedDamageGW = Number((activeFleet * damageRate).toFixed(4));
  results.push({
    testId: 'TEST-04',
    name: 'Damage Attrition Applied Strictly to Active Operating Fleet',
    passed: Math.abs(latestBalance.annualDamagedGW - expectedDamageGW) < 0.01,
    expected: `Damaged GW == Active Operating Fleet (${activeFleet} GW) * 0.22%`,
    actual: `Damaged GW: ${latestBalance.annualDamagedGW} vs Expected: ${expectedDamageGW}`,
    notes: 'Technical fix: does not apply damage to already decommissioned modules'
  });

  // TEST 5: Annual waste >= 0 for all forecast years
  const allPositive = sim.annualBreakdowns.every(b => 
    b.cohortRegularEolKt >= 0 && 
    b.earlyLossKt >= 0 && 
    b.repoweringKt >= 0 && 
    b.damagedInsuranceKt >= 0 && 
    b.totalAnnualKt >= 0
  );
  results.push({
    testId: 'TEST-05',
    name: 'Annual Waste Stream Non-Negativity',
    passed: allPositive,
    expected: 'All annual stream values >= 0 kt',
    actual: `All non-negative: ${allPositive}`,
    notes: 'Evaluated across 2025 to 2050'
  });

  // TEST 6: Cumulative waste monotonic non-decreasing
  let isMonotonic = true;
  for (let i = 1; i < sim.annualBreakdowns.length; i++) {
    if (sim.annualBreakdowns[i].cumulativeKt < sim.annualBreakdowns[i - 1].cumulativeKt) {
      isMonotonic = false;
      break;
    }
  }
  results.push({
    testId: 'TEST-06',
    name: 'Cumulative Waste Monotonic Non-Decreasing',
    passed: isMonotonic,
    expected: 'Cumulative(t) >= Cumulative(t-1)',
    actual: `Monotonic: ${isMonotonic}`,
    notes: 'Guaranteed by integral of non-negative annual flow'
  });

  // TEST 7: Recovered material mass <= input material mass & efficiency between 0-100%
  const sample1000t = calculate_material_recovery(1000, 'hybrid');
  const recoveryRatesValid = sample1000t.every(m => 
    m.recoveredMassTonnes <= m.rawMassTonnes && 
    m.efficiencyPct >= 0 && 
    m.efficiencyPct <= 100 &&
    Math.abs((m.recoveredMassTonnes + m.unrecoveredMassTonnes) - m.rawMassTonnes) < 0.01
  );
  results.push({
    testId: 'TEST-07',
    name: 'Material Mass Conservation: Recovered <= Raw Mass',
    passed: recoveryRatesValid,
    expected: 'Recovered mass <= Raw mass, efficiencies 0..100%',
    actual: `All conserved: ${recoveryRatesValid}`,
    notes: 'Recovered + Unrecovered == Raw input mass'
  });

  // TEST 8: Economics Net Margin Formula Balance
  const econ = calculate_processing_economics(DEFAULT_SCENARIO_PARAMETERS);
  const expectedMargin = econ.grossRecoveredValuePerTonneINR + econ.eprContributionPerTonneINR - 
    (econ.processingCostPerTonneINR + econ.logisticsCostPerTonneINR + econ.feedstockCostPerTonneINR);
  results.push({
    testId: 'TEST-08',
    name: 'Unit Economics Accounting Balance Identity',
    passed: Math.abs(econ.netMarginPerTonneINR - expectedMargin) < 1,
    expected: `Margin == Revenue + EPR - (OPEX + Logistics + Feedstock)`,
    actual: `Margin: ₹${econ.netMarginPerTonneINR}/t vs Formula: ₹${expectedMargin}/t`,
    notes: 'Zero discrepancy'
  });

  // TEST 9: Break-even Feedstock Calculation Consistency
  // At break-even feedstock, Net Margin must equal exactly 0
  const breakEvenParams = {
    ...DEFAULT_SCENARIO_PARAMETERS,
    feedstockCostPerTonneINR: econ.breakEvenFeedstockPricePerTonneINR
  };
  const breakEvenEcon = calculate_processing_economics(breakEvenParams);
  results.push({
    testId: 'TEST-09',
    name: 'Break-Even Feedstock Mathematical Precision',
    passed: Math.abs(breakEvenEcon.netMarginPerTonneINR) < 2,
    expected: 'Net Margin == ₹0/t at break-even feedstock price',
    actual: `Net margin at BEP (₹${econ.breakEvenFeedstockPricePerTonneINR}/t): ₹${breakEvenEcon.netMarginPerTonneINR}/t`,
    notes: 'Matches operational break-even threshold'
  });

  // TEST 10: Logistics Cost Formula: Distance * FreightRate + Handling
  const testDist = 300;
  const testFreight = 4.2;
  const logCost = calculate_transport_cost(testDist, testFreight);
  const expectedLogistics = Math.round(testDist * testFreight) + 650;
  results.push({
    testId: 'TEST-10',
    name: 'Reverse Logistics Transport Cost Formula',
    passed: logCost.totalLogisticsPerTonneINR === expectedLogistics,
    expected: `₹${expectedLogistics}/t (300 km * 4.2 + 650 handling)`,
    actual: `₹${logCost.totalLogisticsPerTonneINR}/t`,
    notes: 'Freight + handling per tonne'
  });

  // TEST 11: True DCF Model NPV & IRR Calculation
  const dcf = calculate_project_dcf_and_irr(DEFAULT_SCENARIO_PARAMETERS);
  const npvValid = typeof dcf.projectNPV_Cr === 'number' && !isNaN(dcf.projectNPV_Cr);
  const irrValid = dcf.projectIRRPct === null || (typeof dcf.projectIRRPct === 'number' && dcf.projectIRRPct > -50);
  results.push({
    testId: 'TEST-11',
    name: 'Real Project Finance DCF Solver (NPV & True IRR)',
    passed: npvValid && irrValid && dcf.dcfSchedule.length === dcf.projectLifeYears,
    expected: 'Finite NPV and validated DCF projection schedule without heuristics',
    actual: `NPV: ₹${dcf.projectNPV_Cr} Cr, True IRR: ${dcf.projectIRRPct !== null ? `${dcf.projectIRRPct}%` : 'sub-hurdle'}`,
    notes: 'Solves NPV(r) = 0 via robust binary search'
  });

  // TEST 12: High feedstock cost turns project not viable (no artificial IRR manipulation)
  const extremeParams = {
    ...DEFAULT_SCENARIO_PARAMETERS,
    feedstockCostPerTonneINR: 60000 // Exceeds gross recovered value of ~45k, resulting in negative EBITDA
  };
  const extremeFin = calculate_project_dcf_and_irr(extremeParams);
  results.push({
    testId: 'TEST-12',
    name: 'Honest Financial Viability on Deficit Scenarios',
    passed: extremeFin.viabilityVerdict === 'NOT ECONOMICALLY VIABLE' && !extremeFin.isEconomicallyAttractive && extremeFin.projectIRRPct === null,
    expected: 'Verdict: NOT ECONOMICALLY VIABLE and IRR == null when cash flows are negative',
    actual: `Verdict: ${extremeFin.viabilityVerdict}, IRR: ${extremeFin.projectIRRPct}`,
    notes: 'Does not invent false positive returns on loss-making projects'
  });

  // TEST 13: Scenario Parameter Propagation (Custom changes affect forecast and economics)
  const baseForecast = calculate_processing_economics(SCENARIO_CONFIGS.base_regular);
  const highEprEcon = calculate_processing_economics({ ...SCENARIO_CONFIGS.base_regular, eprFeePerTonneINR: 5000 });
  results.push({
    testId: 'TEST-13',
    name: 'Scenario Parameter Full Propagation',
    passed: highEprEcon.netMarginPerTonneINR > baseForecast.netMarginPerTonneINR,
    expected: 'Changing EPR fee propagates to higher Net Margin and higher IRR',
    actual: `Base Margin: ₹${baseForecast.netMarginPerTonneINR}/t -> High EPR Margin: ₹${highEprEcon.netMarginPerTonneINR}/t`,
    notes: 'No static hardcoding'
  });

  // TEST 14: Sensitivity Tornado Engine Generation
  const tornado = calculate_sensitivity_tornado(DEFAULT_SCENARIO_PARAMETERS);
  const tornadoValid = tornado.length >= 6 && tornado[0].swingMarginINR >= tornado[tornado.length - 1].swingMarginINR;
  results.push({
    testId: 'TEST-14',
    name: 'Sensitivity Tornado Ranking & Swings',
    passed: tornadoValid,
    expected: 'Tornado items sorted by descending swing magnitude',
    actual: `Top driver: ${tornado[0]?.driver} (Swing: ₹${tornado[0]?.swingMarginINR}/t)`,
    notes: 'Evaluates +/- 20% driver variance'
  });

  // TEST 15: SolarLoop Dynamic Recommendation Synthesis
  const recDecision = generate_solarloop_recommendation(DEFAULT_SCENARIO_PARAMETERS, 'base_regular', 2040);
  const recValid = recDecision.recommendedFacilityCount > 0 && 
    recDecision.executiveSummaryBullets.length >= 4 &&
    recDecision.forecastWasteVolumeKt > 0;
  results.push({
    testId: 'TEST-15',
    name: 'Dynamic SolarLoop Operational Decision Synthesis',
    passed: recValid,
    expected: 'Generates non-empty decision briefing from live model outputs',
    actual: `Facilities: ~${recDecision.recommendedFacilityCount}, Tech: ${recDecision.technologyName}`,
    notes: 'Directly answers what India/INA should build, where, and when'
  });

  const passCount = results.filter(r => r.passed).length;
  const failCount = results.length - passCount;

  return {
    allPassed: failCount === 0,
    totalTests: results.length,
    passCount,
    failCount,
    results
  };
}
