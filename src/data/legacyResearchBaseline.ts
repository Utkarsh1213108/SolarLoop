import { MaterialCompositionItem, RecyclingPathwaySpec } from '../types';

/**
 * Legacy analytical datasets preserved for src/models/coreCalculations.ts.legacy.ts.
 * This module must never be imported by active runtime code.
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

export const REPRESENTATIVE_MODULE_COMPOSITION: MaterialCompositionItem[] = [
  {
    element: 'Glass', label: 'Solar Grade Low-Iron Glass', percentageByMass: 74.2, massPerModuleKg: 16.324, pricePerKgINR: 14.5,
    recoveryEfficiency: { mechanical: 0.88, thermal: 0.94, chemical: 0.92, hybrid: 0.96 },
    circularPathway: 'Cullet / Glass float furnace remelting or foam glass insulation', downcycleRisk: 'Crushed into road aggregate or construction fill if cross-contaminated by polymer EVA'
  },
  {
    element: 'Polymer', label: 'Encapsulant (EVA) & Backsheet (PVDF/PET)', percentageByMass: 11.3, massPerModuleKg: 2.486, pricePerKgINR: -8.0,
    recoveryEfficiency: { mechanical: 0.40, thermal: 0.85, chemical: 0.70, hybrid: 0.88 },
    circularPathway: 'Controlled pyrolysis / high-temperature cement kiln co-processing', downcycleRisk: 'Unregulated incineration generates hazardous fluorinated/brominated emissions'
  },
  {
    element: 'Aluminium', label: 'Anodized Module Frame (6000-series Al)', percentageByMass: 10.3, massPerModuleKg: 2.266, pricePerKgINR: 215.0,
    recoveryEfficiency: { mechanical: 0.98, thermal: 0.98, chemical: 0.98, hybrid: 0.99 },
    circularPathway: 'Closed-loop remelting into architectural & solar mounting extrusions (INA aluminium loop)', downcycleRisk: 'Secondary casting into low-spec automotive iron scrap if frame alloys cross-contaminate'
  },
  {
    element: 'Silicon', label: 'Solar Grade Metallurgical / Polysilicon Cells', percentageByMass: 3.35, massPerModuleKg: 0.737, pricePerKgINR: 180.0,
    recoveryEfficiency: { mechanical: 0.35, thermal: 0.75, chemical: 0.85, hybrid: 0.92 },
    circularPathway: 'Ferrosilicon alloying / chemical purification to 5N+ metallurgical solar grade', downcycleRisk: 'Loss into glass cullet as dust or slag'
  },
  {
    element: 'Copper', label: 'Busbars, Ribbon & Junction Box Wire', percentageByMass: 0.57, massPerModuleKg: 0.125, pricePerKgINR: 760.0,
    recoveryEfficiency: { mechanical: 0.82, thermal: 0.90, chemical: 0.94, hybrid: 0.96 },
    circularPathway: 'Secondary copper smelting & electrolytic refining (Cathode grade A)', downcycleRisk: 'Oxidation during unbuffered shredding'
  },
  {
    element: 'Silver', label: 'Screen-Printed Front/Back Metallization Paste', percentageByMass: 0.006, massPerModuleKg: 0.00132, pricePerKgINR: 88000.0,
    recoveryEfficiency: { mechanical: 0.15, thermal: 0.65, chemical: 0.88, hybrid: 0.94 },
    circularPathway: 'Hydrometallurgical nitric leaching / electrowinning bullion recovery (99.9% purity)', downcycleRisk: 'Permanent loss into glass tailings if mechanical crushing without delamination is used'
  },
  {
    element: 'Other', label: 'Junction Box Housing, Potting Silicone & Trace Inorganics', percentageByMass: 0.274, massPerModuleKg: 0.06028, pricePerKgINR: 0.0,
    recoveryEfficiency: { mechanical: 0.10, thermal: 0.50, chemical: 0.20, hybrid: 0.40 },
    circularPathway: 'Separation into inert non-hazardous residues / waste-to-energy co-processing', downcycleRisk: 'Residual landfilling if not segregated during preliminary de-framing'
  }
];

export const SILVER_PRICE_SCENARIOS = {
  low: { label: 'Conservative / Bearish (₹68,000/kg)', pricePerKgINR: 68000, description: 'Reflects cyclical commodity slump or higher supply substitution' },
  base: { label: 'Base Model Assumption (₹88,000/kg)', pricePerKgINR: 88000, description: 'Long-term 2024–2026 industrial silver bullion median benchmark' },
  high: { label: 'Bullish / Supply Scarcity (₹112,000/kg)', pricePerKgINR: 112000, description: 'Elevated industrial silver deficit driven by gigawatt-scale PV demand' }
};

export const RECYCLING_PATHWAYS: RecyclingPathwaySpec[] = [
  {
    id: 'mechanical', name: 'Mechanical Delamination & Shredding', maturity: 'Commercially Mature', capexPer10ktINR_Cr: 12.5, opexPerTonneINR: 4200, glassPurity: 'Low to Moderate (70-80% clean; polymer contamination)', siliconRecoveryPurity: 'Metallurgical aggregate (3N-4N); broken cell fragments', silverRecoveryRatePct: 18.0, environmentalScore: 7.2, energyIntensityMJ_per_kg: 1.8, recommendedFor: 'Near-term baseline compliance; high-throughput frame and coarse glass reclamation.', tradeOffs: 'Low capital expenditure and simple operations, but sacrifices precious silver recovery (loses ~82% Ag) and downcycles glass into road base.'
  },
  {
    id: 'thermal', name: 'Thermal Decomposition & Pyrolysis', maturity: 'Industrial Scaling', capexPer10ktINR_Cr: 28.0, opexPerTonneINR: 7800, glassPurity: 'High (>95% intact whole glass sheets possible)', siliconRecoveryPurity: 'Intact wafer recovery potential; 4N-5N after surface acid wash', silverRecoveryRatePct: 68.0, environmentalScore: 6.8, energyIntensityMJ_per_kg: 8.5, recommendedFor: 'Medium-to-large regional hubs recovering intact glass and intact cell wafers.', tradeOffs: 'High energy intensity and required flue-gas scrubbing infrastructure for toxic fluorinated polymer off-gases (HF emissions).'
  },
  {
    id: 'chemical', name: 'Hydrometallurgical Leaching & Solvent Dissolution', maturity: 'Pilot / Demonstration', capexPer10ktINR_Cr: 36.5, opexPerTonneINR: 9600, glassPurity: 'Ultra-High (>98% pure cullet suitable for float glass)', siliconRecoveryPurity: 'Chemical solar grade recovery (5N-6N)', silverRecoveryRatePct: 91.0, environmentalScore: 7.8, energyIntensityMJ_per_kg: 5.2, recommendedFor: 'Specialized chemical refining hubs processing stripped cell metallization cakes.', tradeOffs: 'Requires intensive wastewater neutralization, acid handling, and hazardous chemical compliance.'
  },
  {
    id: 'hybrid', name: 'Hybrid Thermo-Mechanical + Hydrometallurgical', maturity: 'Industrial Scaling', capexPer10ktINR_Cr: 44.0, opexPerTonneINR: 8400, glassPurity: 'Premium Ultra-Clean Float Grade (>98.5%)', siliconRecoveryPurity: 'High-purity polysilicon feedstock (5N+)', silverRecoveryRatePct: 94.5, environmentalScore: 8.9, energyIntensityMJ_per_kg: 6.1, recommendedFor: 'Long-term Tier-1 circular hubs maximizing total recovered mineral value under EPR.', tradeOffs: 'Higher initial CAPEX, requires skilled chemical engineering personnel and consistent minimum feedstocks (>25,000 tonnes/year).'
  }
];
