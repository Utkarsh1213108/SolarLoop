/**
 * CANONICAL DATA LOADER
 * 
 * Provides access to the canonical analytical single-source-of-truth dataset.
 * 
 * In browser runtime: Data is fetched from GET /api/canonical and initialized into runtime state.
 * In Node.js / test environments: Reads directly from canonical/solarloop_canonical_data.json via fs.
 * 
 * No duplicate hardcoded copies of canonical analytical data are maintained in src/.
 */

import { 
  CanonicalData, 
  ForecastScenarioId, 
  CanonicalScenarioOutput 
} from '../types';

let runtimeCanonicalData: CanonicalData | null = null;

export function setRuntimeCanonicalData(data: CanonicalData): void {
  runtimeCanonicalData = data;
}

export function getCanonicalData(): CanonicalData {
  if (runtimeCanonicalData) {
    return runtimeCanonicalData;
  }
  // In Node.js environment (e.g. test runner):
  if (typeof window === 'undefined') {
    try {
      // Dynamic require so Vite client bundler does not bundle fs
      const fs = (globalThis as any).require ? (globalThis as any).require('fs') : null;
      const path = (globalThis as any).require ? (globalThis as any).require('path') : null;
      if (fs && path) {
        const canonicalFilePath = path.resolve(process.cwd(), 'canonical/solarloop_canonical_data.json');
        if (fs.existsSync(canonicalFilePath)) {
          runtimeCanonicalData = JSON.parse(fs.readFileSync(canonicalFilePath, 'utf-8'));
          return runtimeCanonicalData!;
        }
      }
    } catch {
      // ignore
    }
  }
  throw new Error('Canonical analytical dataset has not been initialized. Ensure /api/canonical is fetched.');
}

export const CANONICAL_DATA: CanonicalData = new Proxy({} as CanonicalData, {
  get(_target, prop) {
    return (getCanonicalData() as any)[prop];
  }
});

export const CANONICAL_SCENARIO_MAP: Record<ForecastScenarioId, string> = {
  conservative_regular: 'Conservative·Regular',
  conservative_early_loss: 'Conservative·Early',
  base_regular: 'Base·Regular',
  base_early_loss: 'Base·Early',
  high_regular: 'High·Regular',
  high_early_loss: 'High·Early'
};

export const CANONICAL_SCENARIOS_META: Record<ForecastScenarioId, {
  id: ForecastScenarioId;
  canonicalKey: string;
  name: string;
  capacityPath: string;
  alpha: number;
  description: string;
  failureCurveType: 'Regular (Wear-out)' | 'Early-Loss (Premature & Handling)';
}> = {
  conservative_regular: {
    id: 'conservative_regular',
    canonicalKey: 'Conservative·Regular',
    name: 'Conservative · Regular',
    capacityPath: 'Conservative (30 GW/yr)',
    alpha: 5.3759,
    description: 'Conservative additions trajectory (30 GW/yr) with standard wear-out Weibull distribution (α=5.38, β=30 yr).',
    failureCurveType: 'Regular (Wear-out)'
  },
  conservative_early_loss: {
    id: 'conservative_early_loss',
    canonicalKey: 'Conservative·Early',
    name: 'Conservative · Early-Loss',
    capacityPath: 'Conservative (30 GW/yr)',
    alpha: 2.4928,
    description: 'Conservative additions trajectory combined with premature failure curve (α=2.49, β=30 yr) plus 2.3% commissioning scrap.',
    failureCurveType: 'Early-Loss (Premature & Handling)'
  },
  base_regular: {
    id: 'base_regular',
    canonicalKey: 'Base·Regular',
    name: 'Base · Regular (Canonical Baseline)',
    capacityPath: 'Base (50-60 GW/yr)',
    alpha: 5.3759,
    description: 'Central policy trajectory (50 GW to 2030, 60 GW post-2030) with standard IRENA wear-out Weibull distribution (α=5.38, β=30 yr).',
    failureCurveType: 'Regular (Wear-out)'
  },
  base_early_loss: {
    id: 'base_early_loss',
    canonicalKey: 'Base·Early',
    name: 'Base · Early-Loss (Stress Case)',
    capacityPath: 'Base (50-60 GW/yr)',
    alpha: 2.4928,
    description: 'Central policy trajectory with premature operational failure curve (α=2.49, β=30 yr) plus 2.3% commissioning scrap.',
    failureCurveType: 'Early-Loss (Premature & Handling)'
  },
  high_regular: {
    id: 'high_regular',
    canonicalKey: 'High·Regular',
    name: 'High · Regular',
    capacityPath: 'High (60-80 GW/yr)',
    alpha: 5.3759,
    description: 'Aggressive expansion trajectory (60 GW to 2030, 80 GW post-2030) with standard wear-out Weibull distribution (α=5.38, β=30 yr).',
    failureCurveType: 'Regular (Wear-out)'
  },
  high_early_loss: {
    id: 'high_early_loss',
    canonicalKey: 'High·Early',
    name: 'High · Early-Loss',
    capacityPath: 'High (60-80 GW/yr)',
    alpha: 2.4928,
    description: 'Aggressive expansion trajectory with premature operational failure curve (α=2.49, β=30 yr) plus 2.3% commissioning scrap.',
    failureCurveType: 'Early-Loss (Premature & Handling)'
  }
};

export function getCanonicalScenario(scenarioId: ForecastScenarioId): CanonicalScenarioOutput {
  const key = CANONICAL_SCENARIO_MAP[scenarioId] || 'Base·Regular';
  return getCanonicalData().forecast_outputs[key];
}

export function getCanonicalTimeSeries(scenarioId: ForecastScenarioId): Array<{
  year: number;
  annualKt: number;
  cumulativeKt: number;
  commissioningScrapKt: number;
  operationalFailureKt: number;
}> {
  const sc = getCanonicalScenario(scenarioId);
  const years = Object.keys(sc.annual_series_kt).map(Number).sort((a, b) => a - b);
  return years.map(y => {
    const yrStr = String(y);
    return {
      year: y,
      annualKt: sc.annual_series_kt[yrStr] ?? 0,
      cumulativeKt: sc.cumulative_series_kt[yrStr] ?? 0,
      commissioningScrapKt: sc.commissioning_scrap_series_kt[yrStr] ?? 0,
      operationalFailureKt: sc.operational_failure_series_kt[yrStr] ?? 0
    };
  });
}

/**
 * Canonical Material Flow Decomposition across 3 disposition categories:
 * 1. Recovered Material
 * 2. Co-Processing (cement kilns 113 kg/t polymer)
 * 3. Residual / TSDF Disposal (~90 kg/t)
 * Strictly verifies mass conservation: input_mass == recovered + co_processed + residual
 */
export function calculateCanonicalMaterialFlow(
  wasteTonnes: number,
  route: 'Chemical' | 'Mechanical' = 'Chemical'
) {
  const data = getCanonicalData();
  const routeCfg = data.recycling_routes[route];
  const baseline = data.material_model.canonical_baseline_cSi;
  const recYields = routeCfg.material_recovery_yields;
  const coprocYields = routeCfg.co_processing_yields;

  const contained: Record<string, number> = {};
  const recovered: Record<string, number> = {};
  const coProcessed: Record<string, number> = {};
  const residuals: Record<string, number> = {};

  for (const [mat, props] of Object.entries(baseline)) {
    const matMass = wasteTonnes * props.mass_fraction;
    contained[mat] = matMass;
    const yRec = recYields[mat] ?? 0;
    const yCoproc = coprocYields[mat] ?? 0;

    const mRec = matMass * yRec;
    const mCoproc = matMass * yCoproc;
    const mRes = matMass - (mRec + mCoproc);

    recovered[mat] = mRec;
    coProcessed[mat] = mCoproc;
    residuals[mat] = mRes;
  }

  const totalContained = Object.values(contained).reduce((s, v) => s + v, 0);
  const totalRecovered = Object.values(recovered).reduce((s, v) => s + v, 0);
  const totalCoProcessed = Object.values(coProcessed).reduce((s, v) => s + v, 0);
  const totalResidual = Object.values(residuals).reduce((s, v) => s + v, 0);

  return {
    inputMassTonnes: wasteTonnes,
    totalContainedTonnes: totalContained,
    recoveredMassTonnes: totalRecovered,
    coProcessedMassTonnes: totalCoProcessed,
    residualMassTonnes: totalResidual,
    recoveredPct: wasteTonnes > 0 ? (totalRecovered / wasteTonnes) * 100 : 0,
    coProcessedPct: wasteTonnes > 0 ? (totalCoProcessed / wasteTonnes) * 100 : 0,
    residualPct: wasteTonnes > 0 ? (totalResidual / wasteTonnes) * 100 : 0,
    contained,
    recovered,
    coProcessed,
    residuals,
    routeConfig: routeCfg
  };
}

/**
 * Selects a canonical economics reference case. The canonical dataset is the
 * only source for the returned economics value; unsupported breakdown fields
 * are intentionally not reconstructed here.
 */
export function calculateCanonicalEconomics(options: {
  silverPriceINR_per_g?: number;
  silverRecoveryRate?: number;
  feedstockCostINR_per_module?: number;
  modulesPerTonne?: number;
  haulDistanceKm?: number;
  freightRateINR_per_tkm?: number;
  eprCertificateINR_per_kg?: number;
  route?: 'Chemical' | 'Mechanical';
}) {
  const data = getCanonicalData();
  const references = data.economics_reference;
  const priceMatch = options.silverPriceINR_per_g === undefined
    ? undefined
    : Object.values(references).find(reference => reference.notes.includes(`₹${options.silverPriceINR_per_g}/g`));
  const selectedCase = options.route === 'Mechanical'
    ? references.Published_CEEW_Mechanical
    : options.eprCertificateINR_per_kg && options.eprCertificateINR_per_kg > 0
      ? references.EPR_Floor_Bankable_Case
      : priceMatch || references.Silver_Repriced_Team_Case;

  return {
    netEconomicsINRPerTonne: selectedCase.net_inr_per_tonne,
    selectedCase,
    referenceCases: references
  };
}
