"""
solar_waste_model_v2.py
=======================
Analytical forecasting model for solar photovoltaic (PV) waste streams in India.
Methodology aligned with IRENA/IEA-PVPS (2016) Weibull lifetime distribution framework,
incorporating distinct pre-commissioning handling/logistics scrap and operational end-of-life streams.

Model Version: 2.0 (Refactored from solar_waste_model.py)
Status:
  [A] Forecasting Engine: FROZEN
  [B] Material Model:     NOT FROZEN (Pending empirical Silver validation)
  [C] Publication Ready:  NOT PUBLICATION-READY (Requires material baseline reconciliation)
"""

import math
import json
from typing import Dict, Tuple, List, Any

# ==============================================================================
# MODEL CONFIGURATION & PARAMETER CLASSIFICATION
# ==============================================================================
# Every parameter is classified into one of four categories:
# [OBSERVED INPUT]       - Empirically observed data from official statistical reporting
# [LITERATURE PARAMETER] - Standard parameter derived from peer-reviewed literature / IRENA benchmarks
# [MODELLING ASSUMPTION]  - Explicit policy scenario or EPC structural assumption
# [DERIVED OUTPUT]       - Computed by the model engine
# ==============================================================================

# --- Historical and Pipeline Capacity Additions (GW) ---
# 2010-2024: [OBSERVED INPUT] Historical annual grid-connected solar capacity additions in India (MNRE/CEA).
# 2025-2026: [MODELLING ASSUMPTION / PIPELINE ESTIMATE] Near-term target additions from existing model baseline.
HISTORICAL_ADDITIONS: Dict[int, float] = {
    2010: 0.10,  2011: 0.40,  2012: 0.70,  2013: 1.00,  2014: 0.65,
    2015: 0.92,  2016: 3.02,  2017: 5.53,  2018: 9.36,  2019: 6.53,
    2020: 6.45,  2021: 5.47,  2022: 13.89, 2023: 12.79, 2024: 15.03,
    2025: 23.84, 2026: 44.61
}

# --- Long-Term Capacity Trajectories (GW/year) [MODELLING ASSUMPTION] ---
# Defined from 2027 to 2055 across three distinct policy/macro paths.
CAPACITY_PATHS_CONFIG: Dict[str, Dict[str, Any]] = {
    "Conservative": {"near_term_2027_2030": 30.0, "long_term_post_2030": 30.0},
    "Base":         {"near_term_2027_2030": 50.0, "long_term_post_2030": 60.0},
    "High":         {"near_term_2027_2030": 60.0, "long_term_post_2030": 80.0},
}

# --- Weibull Lifetime Distribution Parameters [LITERATURE PARAMETER] ---
# Source: IRENA & IEA-PVPS (2016) "End-of-Life Management: Solar Photovoltaic Panels"
# CDF: F(t) = 1 - exp(-(t / BETA) ** ALPHA)
ALPHA_REGULAR: float = 5.3759   # [LITERATURE PARAMETER] Regular-loss shape factor (wear-out focused)
ALPHA_EARLY: float   = 2.4928   # [LITERATURE PARAMETER] Early-loss shape factor (premature failure focused)
BETA_SCALE: float    = 30.0     # [LITERATURE PARAMETER] Characteristic lifetime / scale parameter (years)

# --- Module Material Intensity (tonnes / MW) ---
TPM_HISTORIC: float = 65.0      # [LITERATURE PARAMETER] Vintages <= 2022 (c-Si baseline)
TPM_NEW: float      = 58.0      # [MODELLING ASSUMPTION] Vintages > 2022 (efficiency & wafer thinning)

# --- Pre-Commissioning Logistics & Handling Loss Rate [MODELLING ASSUMPTION] ---
# Represents transit damage, port handling, micro-cracks, and EPC installation scrap
# typical in Indian utility projects prior to grid synchronization (CEEW 2024 / Bridge to India).
COMMISSIONING_LOSS_RATE: float = 0.023   # 2.3% of installed module mass

# --- DC/AC Inverter Loading Ratio (ILR) Basis [MODELLING ASSUMPTION] ---
DC_AC_RATIO_BASELINE: float    = 1.0     # Canonical baseline: assumes capacity is reported on DC nameplate basis
DC_AC_RATIO_SENSITIVITY: float = 1.25    # Sensitivity case: assumes AC grid capacity with 25% DC oversizing

# --- Simulation Time Horizons [MODELLING ASSUMPTION] ---
START_YEAR: int          = 2010
FORECAST_END_YEAR: int   = 2050
PATH_HORIZON_YEAR: int   = 2055

# --- Material Composition Breakdown (c-Si Standard Module) ---
# Verified against IRENA/IEA-PVPS (2016) Table 2 and CEEW (2024) Indian solar waste benchmarks.
# Status values: DOCUMENTED SOURCE | MODELLING ASSUMPTION | REQUIRES VALIDATION
MATERIAL_COMPOSITION: Dict[str, Dict[str, Any]] = {
    "Glass": {
        "mass_fraction": 0.7600,
        "source_or_assumption": "IRENA/IEA-PVPS (2016) Table 2 (c-Si average)",
        "status": "DOCUMENTED SOURCE",
        "confidence_validation": "High for standard single-glass backsheet modules; glass-glass bifacial modules reach 80-84%.",
        "recovery_efficiency": None
    },
    "Aluminium": {
        "mass_fraction": 0.1030,
        "source_or_assumption": "IRENA/IEA-PVPS (2016) Table 2 & original project baseline (solar_waste_model.py Line 63)",
        "status": "DOCUMENTED SOURCE",
        "confidence_validation": "High for framed modules; recovery yield fixed at 99.0% per existing model baseline.",
        "recovery_efficiency": 0.99
    },
    "Silicon": {
        "mass_fraction": 0.0335,
        "source_or_assumption": "IRENA/IEA-PVPS (2016) Table 2",
        "status": "DOCUMENTED SOURCE",
        "confidence_validation": "Moderate; wafer thinning reduces cell mass, but typical mass share remains 2.5-3.5%.",
        "recovery_efficiency": None
    },
    "Copper": {
        "mass_fraction": 0.0090,
        "source_or_assumption": "IRENA/IEA-PVPS (2016) Table 2",
        "status": "DOCUMENTED SOURCE",
        "confidence_validation": "Moderate; ribbon/wiring typically 0.6-1.0% across c-Si modules.",
        "recovery_efficiency": None
    },
    "Silver": {
        "mass_fraction": 0.0005,
        "source_or_assumption": "IRENA/IEA-PVPS (2016) Table 2 (0.05% / 500 ppm) vs. CEEW (2024) Indian baseline (0.0025% / 25 ppm)",
        "status": "REQUIRES VALIDATION",
        "confidence_validation": "CRITICAL DISCREPANCY: Current 0.05% exceeds CEEW 2024 Indian project baseline (12-18 t Ag in 600 kt waste) by 20x. Do NOT freeze without empirical reconciliation.",
        "recovery_efficiency": None
    },
    "Polymer/other": {
        "mass_fraction": 0.0940,
        "source_or_assumption": "IRENA/IEA-PVPS (2016) Table 2 & mass balance closure",
        "status": "MODELLING ASSUMPTION",
        "confidence_validation": "Moderate; represents EVA encapsulants, backsheets, junction box polymers, and solder closure to 100.0%.",
        "recovery_efficiency": None
    },
}

# --- Validation and External Parameter Notes ---
VALIDATION_NOTES = {
    "HISTORICAL_DATA": (
        "Additions for 2025 (23.84 GW) and 2026 (44.61 GW) represent ambitious project pipeline / target "
        "assumptions from the original script and should be verified against realized MNRE grid-commissioning data."
    ),
    "DC_AC_RATIO": (
        "The canonical baseline of 1.0 treats capacity figures as DC nameplate capacity (MWp). "
        "If official statistics report AC grid export capacity (MWac), the DC/AC sensitivity case of 1.25 applies."
    ),
    "COMPOUND_EARLY_LOSS": (
        "In pure IRENA methodology, alpha=2.4928 already incorporates 0.5% transport and 0.5% early installation failure. "
        "Combining alpha=2.4928 with explicit 2.3% commissioning scrap is an intentionally conservative Indian compound scenario."
    ),
    "REPOWERING_EXCLUSION": (
        "Repowering is currently excluded from baseline modeling because no defensible empirical repowering rate "
        "has been established for India's young solar fleet (<3 GW installed before 2015)."
    ),
    "MATERIAL_RECOVERY": (
        "Only Aluminium has an empirical recovery efficiency of 99% retained from the original model. "
        "Other materials are reported as gross contained mass to avoid inventing unverified recycling yields."
    ),
    "SILVER_DISCREPANCY": (
        "IRENA (2016) Table 2 reports silver at 0.05% (500 g/tonne), reflecting 2010-era thick screen-printed metallization. "
        "CEEW (2024) 'Enabling a Circular Economy in India's Solar Industry' reports only 12-18 tonnes of silver across "
        "600 kilotonnes of cumulative waste by 2030, implying ~0.0025% (25 g/tonne) due to aggressive de-silvering and thin-film inclusion. "
        "This 20x discrepancy must be empirically validated before external publication."
    )
}


# ==============================================================================
# CORE ENGINE FUNCTIONS
# ==============================================================================

def get_capacity_path(name: str, horizon_year: int = PATH_HORIZON_YEAR) -> Dict[int, float]:
    """
    Constructs the annual capacity addition trajectory (GW/year) for a named scenario.
    """
    if name not in CAPACITY_PATHS_CONFIG:
        raise ValueError(f"Unknown capacity path: '{name}'. Choose from {list(CAPACITY_PATHS_CONFIG.keys())}")
    
    additions = dict(HISTORICAL_ADDITIONS)
    cfg = CAPACITY_PATHS_CONFIG[name]
    for y in range(2027, horizon_year + 1):
        additions[y] = cfg["near_term_2027_2030"] if y <= 2030 else cfg["long_term_post_2030"]
    return additions


def weibull_cdf(t: float, alpha: float, beta: float) -> float:
    """
    Computes the cumulative distribution function (CDF) of the Weibull distribution.
    F(t) = 1 - exp(-(t / beta) ** alpha) for t > 0, else 0.0.
    """
    if t <= 0.0:
        return 0.0
    return 1.0 - math.exp(- (t / beta) ** alpha)


def calculate_waste(
    capacity_additions: Dict[int, float],
    alpha: float = ALPHA_REGULAR,
    beta: float = BETA_SCALE,
    commissioning_loss: float = COMMISSIONING_LOSS_RATE,
    tpm_historic: float = TPM_HISTORIC,
    tpm_new: float = TPM_NEW,
    dc_ac_ratio: float = DC_AC_RATIO_BASELINE,
    end_year: int = FORECAST_END_YEAR
) -> Tuple[Dict[int, float], Dict[int, float]]:
    """
    Calculates annual commissioning scrap and operational end-of-life failure streams (in metric tonnes).

    Methodology:
    1. Pre-commissioning handling/logistics scrap:
       W_commissioning(y0) = mass(y0) * commissioning_loss
       Occurs immediately at installation year y0 prior to grid operation.
    2. Operational Weibull failure on surviving operating cohort:
       rem = mass(y0) * (1 - commissioning_loss)
       W_operational(y) = rem * [F(age) - F(age - 1)] for age = y - y0 >= 1
    """
    years = list(range(START_YEAR, end_year + 1))
    commissioning_scrap = {y: 0.0 for y in years}
    operational_failure = {y: 0.0 for y in years}

    for y0, gw in capacity_additions.items():
        if y0 > end_year or y0 < START_YEAR:
            continue
        
        # Total physical module mass installed in year y0 (tonnes)
        mass_tpm = tpm_historic if y0 <= 2022 else tpm_new
        mass_total = gw * 1000.0 * dc_ac_ratio * mass_tpm

        # Stream 1: Pre-commissioning handling / transport scrap (tonnes)
        commissioning_scrap[y0] += mass_total * commissioning_loss

        # Stream 2: Cohort entering operational service (tonnes)
        surviving_operating_mass = mass_total * (1.0 - commissioning_loss)

        # Discrete annual failure probability: F(t) - F(t - 1)
        for y in range(y0 + 1, end_year + 1):
            age = y - y0
            delta_f = weibull_cdf(age, alpha, beta) - weibull_cdf(age - 1, alpha, beta)
            operational_failure[y] += surviving_operating_mass * delta_f

    return commissioning_scrap, operational_failure


def to_kilotonnes(stream_tonnes: Dict[int, float]) -> Dict[int, float]:
    """Converts a dict of metric tonnes to kilotonnes (kt)."""
    return {y: val / 1000.0 for y, val in stream_tonnes.items()}


def get_cumulative_waste(annual_kt: Dict[int, float], upto_year: int) -> float:
    """Computes cumulative waste (kt) up to and including a specified year."""
    return sum(v for y, v in annual_kt.items() if y <= upto_year)


# ==============================================================================
# PRIMARY SCENARIO MATRIX DEFINITIONS (3x2 GRID)
# ==============================================================================
PRIMARY_SCENARIO_MATRIX: Dict[str, Tuple[str, float]] = {
    "Conservative·Regular": ("Conservative", ALPHA_REGULAR),
    "Conservative·Early":   ("Conservative", ALPHA_EARLY),
    "Base·Regular":         ("Base",         ALPHA_REGULAR),
    "Base·Early":           ("Base",         ALPHA_EARLY),
    "High·Regular":         ("High",         ALPHA_REGULAR),
    "High·Early":           ("High",         ALPHA_EARLY),
}


def run_all_scenarios(
    commissioning_loss: float = COMMISSIONING_LOSS_RATE,
    dc_ac_ratio: float = DC_AC_RATIO_BASELINE,
    end_year: int = FORECAST_END_YEAR
) -> Dict[str, Dict[str, Any]]:
    """Runs all primary scenarios and returns structured annual and cumulative metrics in kt."""
    results = {}
    for sc_name, (cap_path, alpha) in PRIMARY_SCENARIO_MATRIX.items():
        additions = get_capacity_path(cap_path, horizon_year=PATH_HORIZON_YEAR)
        c_tonnes, o_tonnes = calculate_waste(
            additions,
            alpha=alpha,
            beta=BETA_SCALE,
            commissioning_loss=commissioning_loss,
            dc_ac_ratio=dc_ac_ratio,
            end_year=end_year
        )
        c_kt = to_kilotonnes(c_tonnes)
        o_kt = to_kilotonnes(o_tonnes)
        tot_kt = {y: c_kt[y] + o_kt[y] for y in c_kt}
        cum_kt = {y: get_cumulative_waste(tot_kt, y) for y in tot_kt}

        results[sc_name] = {
            "capacity_path": cap_path,
            "alpha": alpha,
            "commissioning_scrap_kt": c_kt,
            "operational_failure_kt": o_kt,
            "annual_waste_kt": tot_kt,
            "cumulative_waste_kt": cum_kt
        }
    return results


# ==============================================================================
# SENSITIVITY ANALYSIS (MULTI-HORIZON: 2030, 2040, 2050)
# ==============================================================================

def run_sensitivity_analysis(horizons: List[int] = [2030, 2040, 2050]) -> Dict[str, Any]:
    """
    Evaluates sensitivity variations against the Base·Regular baseline across multiple time horizons.
    Clearly categorizes variations as:
    - [One-sided]: Asymmetric / discrete scenario deviations
    - [Two-sided]: Parametric swings around the central baseline
    """
    def cum_at(year: int, **kwargs) -> float:
        cap_name = kwargs.pop("capacity_path", "Base")
        alpha = kwargs.pop("alpha", ALPHA_REGULAR)
        beta = kwargs.pop("beta", BETA_SCALE)
        comm = kwargs.pop("commissioning_loss", COMMISSIONING_LOSS_RATE)
        tpm_n = kwargs.pop("tpm_new", TPM_NEW)
        dcac = kwargs.pop("dc_ac_ratio", DC_AC_RATIO_BASELINE)

        additions = get_capacity_path(cap_name)
        c_t, o_t = calculate_waste(
            additions,
            alpha=alpha,
            beta=beta,
            commissioning_loss=comm,
            tpm_new=tpm_n,
            dc_ac_ratio=dcac,
            end_year=max(horizons)
        )
        ann_kt = {y: (c_t[y] + o_t[y]) / 1000.0 for y in c_t}
        return get_cumulative_waste(ann_kt, year)

    sensitivity_cases = [
        {
            "name": "Loss curve (Regular -> Early)",
            "type": "One-sided scenario switch",
            "low_call": lambda yr: cum_at(yr, alpha=ALPHA_REGULAR),
            "high_call": lambda yr: cum_at(yr, alpha=ALPHA_EARLY),
            "param_bounds": "alpha: 5.3759 -> 2.4928"
        },
        {
            "name": "Capacity trajectory (Conservative <-> High)",
            "type": "Two-sided parametric",
            "low_call": lambda yr: cum_at(yr, capacity_path="Conservative"),
            "high_call": lambda yr: cum_at(yr, capacity_path="High"),
            "param_bounds": "path: Conservative (30 GW) <-> High (60-80 GW)"
        },
        {
            "name": "DC/AC ratio basis (1.00 -> 1.25)",
            "type": "One-sided reporting sensitivity",
            "low_call": lambda yr: cum_at(yr, dc_ac_ratio=1.0),
            "high_call": lambda yr: cum_at(yr, dc_ac_ratio=1.25),
            "param_bounds": "DC/AC: 1.00 (DC nameplate) -> 1.25 (AC with oversizing)"
        },
        {
            "name": "Commissioning loss rate (1.0% <-> 4.0%)",
            "type": "Two-sided parametric",
            "low_call": lambda yr: cum_at(yr, commissioning_loss=0.01),
            "high_call": lambda yr: cum_at(yr, commissioning_loss=0.04),
            "param_bounds": "handling loss: 1.0% <-> 4.0% (baseline: 2.3%)"
        },
        {
            "name": "Module mass intensity, post-2022 (50 <-> 65 t/MW)",
            "type": "Two-sided parametric",
            "low_call": lambda yr: cum_at(yr, tpm_new=50.0),
            "high_call": lambda yr: cum_at(yr, tpm_new=65.0),
            "param_bounds": "t/MW: 50.0 <-> 65.0 (baseline: 58.0)"
        },
        {
            "name": "Weibull scale beta (33 yr <-> 27 yr)",
            "type": "Two-sided parametric (inverted: longer life = lower waste)",
            "low_call": lambda yr: cum_at(yr, beta=33.0),
            "high_call": lambda yr: cum_at(yr, beta=27.0),
            "param_bounds": "beta: 33 yr (low waste) <-> 27 yr (high waste)"
        }
    ]

    results_by_horizon = {}
    for yr in horizons:
        base_val = cum_at(yr)
        records = []
        for case in sensitivity_cases:
            lo = case["low_call"](yr)
            hi = case["high_call"](yr)
            delta = hi - lo
            records.append({
                "parameter": case["name"],
                "type": case["type"],
                "bounds": case["param_bounds"],
                "low_kt": lo,
                "high_kt": hi,
                "range_kt": delta,
                "pct_swing_vs_base": (delta / base_val) * 100.0 if base_val > 0 else 0.0
            })
        results_by_horizon[yr] = {"baseline_cumulative_kt": base_val, "cases": records}

    return results_by_horizon


# ==============================================================================
# MATERIAL FLOW DECOMPOSITION & VALIDATION
# ==============================================================================

def calculate_material_flows(annual_waste_kt: float) -> Dict[str, Dict[str, float]]:
    """
    Decomposes total annual solar waste into individual material components.
    Distinguishes gross contained mass from recoverable mass.
    """
    flows = {}
    for mat, props in MATERIAL_COMPOSITION.items():
        contained_kt = annual_waste_kt * props["mass_fraction"]
        rec_eff = props["recovery_efficiency"]
        recoverable_kt = (contained_kt * rec_eff) if rec_eff is not None else None
        flows[mat] = {
            "share_pct": props["mass_fraction"] * 100.0,
            "contained_kt": contained_kt,
            "recovery_yield_pct": (rec_eff * 100.0) if rec_eff is not None else None,
            "recoverable_kt": recoverable_kt
        }
    return flows


# ==============================================================================
# INTEGRITY CHECKS & VALIDATION
# ==============================================================================

def run_integrity_checks(all_scenarios: Dict[str, Dict[str, Any]]) -> List[str]:
    """
    Validates model consistency, mathematical boundaries, and mass preservation.
    Returns a list of validation status strings.
    """
    messages = []

    # 1. Check all scenarios executed
    expected_scenarios = set(PRIMARY_SCENARIO_MATRIX.keys())
    actual_scenarios = set(all_scenarios.keys())
    assert expected_scenarios == actual_scenarios, f"Scenario mismatch: {expected_scenarios - actual_scenarios}"
    messages.append("[PASS] All 6 primary scenarios executed successfully.")

    # 2. Check non-negativity and cumulative monotonicity
    for sc_name, data in all_scenarios.items():
        prev_cum = 0.0
        for y in range(START_YEAR, FORECAST_END_YEAR + 1):
            c = data["commissioning_scrap_kt"][y]
            o = data["operational_failure_kt"][y]
            tot = data["annual_waste_kt"][y]
            cum = data["cumulative_waste_kt"][y]

            assert c >= 0.0, f"Negative commissioning scrap in {sc_name} year {y}: {c}"
            assert o >= 0.0, f"Negative operational failure in {sc_name} year {y}: {o}"
            assert tot >= 0.0, f"Negative annual waste in {sc_name} year {y}: {tot}"
            assert math.isclose(tot, c + o, rel_tol=1e-5), f"Sum mismatch in {sc_name} year {y}"
            assert cum >= prev_cum - 1e-6, f"Decreasing cumulative waste in {sc_name} year {y}"
            prev_cum = cum
    messages.append("[PASS] Non-negativity and cumulative monotonicity verified for all years.")

    # 3. Check scenario dominance consistency
    # For same failure curve, High >= Base >= Conservative
    for curve in ["Regular", "Early"]:
        hi = all_scenarios[f"High·{curve}"]["cumulative_waste_kt"][FORECAST_END_YEAR]
        ba = all_scenarios[f"Base·{curve}"]["cumulative_waste_kt"][FORECAST_END_YEAR]
        co = all_scenarios[f"Conservative·{curve}"]["cumulative_waste_kt"][FORECAST_END_YEAR]
        assert hi >= ba >= co, f"Capacity dominance failure in {curve}: High={hi}, Base={ba}, Cons={co}"
    messages.append("[PASS] Capacity trajectory dominance (High >= Base >= Conservative) verified.")

    # For same capacity path, Early cumulative >= Regular cumulative
    for path in ["Conservative", "Base", "High"]:
        early_cum = all_scenarios[f"{path}·Early"]["cumulative_waste_kt"][FORECAST_END_YEAR]
        reg_cum = all_scenarios[f"{path}·Regular"]["cumulative_waste_kt"][FORECAST_END_YEAR]
        assert early_cum >= reg_cum, f"Early failure dominance failure in {path}: Early={early_cum}, Regular={reg_cum}"
    messages.append("[PASS] Failure curve dominance (Early cumulative >= Regular cumulative) verified.")

    # 4. Check material share preservation
    total_share = sum(p["mass_fraction"] for p in MATERIAL_COMPOSITION.values())
    assert math.isclose(total_share, 1.0, rel_tol=1e-5), f"Material shares sum to {total_share} instead of 1.0"
    messages.append("[PASS] Material breakdown shares sum exactly to 100.0%.")

    return messages


# ==============================================================================
# MAIN EXECUTION & MACHINE-READABLE REPORTING
# ==============================================================================

if __name__ == "__main__":
    print("=" * 80)
    print("SOLAR PHOTOVOLTAIC WASTE FORECASTING MODEL (VERSION 2.0)")
    print("=" * 80)

    # 1. Run primary scenarios
    scenarios = run_all_scenarios()

    # 2. Run integrity checks
    print("\n--- [INTEGRITY CHECKS] ---")
    check_results = run_integrity_checks(scenarios)
    for res in check_results:
        print(f"  {res}")

    # 3. Primary Scenario Results Table (2030, 2040, 2050)
    print("\n" + "=" * 80)
    print("PRIMARY SCENARIO RESULTS (ANNUAL & CUMULATIVE WASTE IN KILOTONNES)")
    print("=" * 80)
    header = f"{'Scenario':<24} | {'Year':<5} | {'Annual (kt)':<12} | {'Cumul. (kt)':<12} | {'Comm. Scrap':<12} | {'Oper. Failure':<13}"
    print(header)
    print("-" * len(header))

    output_records = []
    for sc_name in PRIMARY_SCENARIO_MATRIX.keys():
        data = scenarios[sc_name]
        for yr in [2030, 2040, 2050]:
            ann = data["annual_waste_kt"][yr]
            cum = data["cumulative_waste_kt"][yr]
            com = data["commissioning_scrap_kt"][yr]
            ops = data["operational_failure_kt"][yr]
            print(f"{sc_name:<24} | {yr:<5} | {ann:<12.1f} | {cum:<12.1f} | {com:<12.1f} | {ops:<13.1f}")
            output_records.append({
                "scenario": sc_name,
                "year": yr,
                "annual_waste_kt": round(ann, 2),
                "cumulative_waste_kt": round(cum, 2),
                "commissioning_scrap_kt": round(com, 2),
                "operational_failure_kt": round(ops, 2)
            })

    # Export machine-readable summary
    with open("scenario_results.json", "w") as f:
        json.dump(output_records, f, indent=2)
    print(f"\n[INFO] Machine-readable scenario table saved to 'scenario_results.json'.")

    # 4. Pure-IRENA Comparison Mode (Handling Loss = 0.0 vs Compound 2.3%)
    print("\n" + "=" * 80)
    print("METHODOLOGICAL COMPARISON: PURE IRENA (0% COMM.) VS. INDIAN COMPOUND (2.3% COMM.)")
    print("=" * 80)
    sc_pure_irena = run_all_scenarios(commissioning_loss=0.0)
    print(f"{'Metric (Base·Early)':<35} | {'2030':<10} | {'2040':<10} | {'2050':<10}")
    print("-" * 72)
    for label, key in [
        ("Pure IRENA Cumulative (kt)", "cumulative_waste_kt"),
        ("Indian Compound Cumulative (kt)", "cumulative_waste_kt")
    ]:
        src = sc_pure_irena if "Pure" in label else scenarios
        v30 = src["Base·Early"][key][2030]
        v40 = src["Base·Early"][key][2040]
        v50 = src["Base·Early"][key][2050]
        print(f"{label:<35} | {v30:<10.1f} | {v40:<10.1f} | {v50:<10.1f}")
    diff30 = scenarios["Base·Early"]["cumulative_waste_kt"][2030] - sc_pure_irena["Base·Early"]["cumulative_waste_kt"][2030]
    diff50 = scenarios["Base·Early"]["cumulative_waste_kt"][2050] - sc_pure_irena["Base·Early"]["cumulative_waste_kt"][2050]
    print(f"{'Difference (Commissioning Impact, kt)':<35} | {diff30:<10.1f} | {'--':<10} | {diff50:<10.1f}")

    # 5. Crossover Analysis (Accurately Defined)
    print("\n" + "=" * 80)
    print("ANNUAL STREAM DYNAMICS: OPERATIONAL FAILURES VS. NEW COMMISSIONING SCRAP")
    print("Description: Calendar year when fleet-wide operational Weibull retirements from all past")
    print("vintages exceed the single-year commissioning scrap from that year's new capacity additions.")
    print("=" * 80)
    for sc_name in ["Base·Regular", "Base·Early", "Conservative·Regular", "High·Regular"]:
        data = scenarios[sc_name]
        crossover_years = [
            y for y in range(2026, FORECAST_END_YEAR + 1)
            if data["operational_failure_kt"][y] > data["commissioning_scrap_kt"][y]
        ]
        first_crossover = crossover_years[0] if crossover_years else "None before 2050"
        print(f"  {sc_name:<24}: Operational wear-out exceeds new installation scrap in {first_crossover}")

    # 6. Multi-Horizon Sensitivity Analysis (2030, 2040, 2050)
    print("\n" + "=" * 80)
    print("MULTI-HORIZON SENSITIVITY ANALYSIS (AGAINST BASE·REGULAR BASELINE)")
    print("=" * 80)
    sensitivity_results = run_sensitivity_analysis(horizons=[2030, 2040, 2050])
    for yr in [2030, 2040, 2050]:
        base_c = sensitivity_results[yr]["baseline_cumulative_kt"]
        print(f"\n--- Horizon Year: {yr} (Baseline Cumulative Waste = {base_c:.1f} kt) ---")
        print(f"{'Parameter / Case':<42} | {'Type':<22} | {'Low (kt)':<9} | {'High (kt)':<9} | {'Range (kt)':<10} | {'Swing %':<8}")
        print("-" * 110)
        for rec in sensitivity_results[yr]["cases"]:
            print(f"{rec['parameter']:<42} | {rec['type']:<22} | {rec['low_kt']:<9.1f} | {rec['high_kt']:<9.1f} | {rec['range_kt']:<10.1f} | {rec['pct_swing_vs_base']:<8.1f}%")

    with open("sensitivity_results.json", "w") as f:
        json.dump(sensitivity_results, f, indent=2)
    print(f"\n[INFO] Machine-readable sensitivity results saved to 'sensitivity_results.json'.")

    # 7. Material Source / Assumption Table & Discrepancy Audit
    print("\n" + "=" * 80)
    print("MATERIAL COMPOSITION VALIDATION AUDIT")
    print("=" * 80)
    mat_hdr = f"{'Material':<14} | {'Fraction':<9} | {'Status':<21} | {'Source or Assumption':<38}"
    print(mat_hdr)
    print("-" * len(mat_hdr))
    for mat, info in MATERIAL_COMPOSITION.items():
        print(f"{mat:<14} | {info['mass_fraction']*100:<8.2f}% | {info['status']:<21} | {info['source_or_assumption'][:38]:<38}")

    print("\n--- [MATERIAL DISCREPANCY & CONFIDENCE NOTES] ---")
    for mat, info in MATERIAL_COMPOSITION.items():
        print(f"  * {mat:<14} [{info['status']}]: {info['confidence_validation']}")

    # Explicit Silver Discrepancy Highlight
    base_reg_ann = scenarios["Base·Regular"]["annual_waste_kt"]
    print("\n--- [CRITICAL AUDIT ITEM: SILVER FRACTION DISCREPANCY] ---")
    print("  Baseline A (IRENA 2016 Table 2)      : 0.0500% (500 g/tonne) [c-Si legacy paste standard]")
    print("  Baseline B (CEEW 2024 Indian Study) : 0.0025% (25 g/tonne)  [Derived from 12-18 t Ag in 600 kt waste]")
    print("  Divergence Ratio                     : 20.0x difference")
    print("  Forecast Impact (Base·Regular):")
    for yr in [2030, 2040, 2050]:
        w_tot = base_reg_ann[yr]
        ag_irena = w_tot * 0.0005 * 1000.0   # tonnes
        ag_ceew = w_tot * 0.000025 * 1000.0  # tonnes
        print(f"    {yr}: Total Waste = {w_tot:.1f} kt -> Ag at 0.05%: {ag_irena:6.1f} t  vs.  Ag at 0.0025%: {ag_ceew:5.1f} t")
    print("  Recommendation: Neither value should be arbitrarily discarded. External validation required before publication.")

    # 8. Material Flow Decomposition (Base·Regular Scenario)
    print("\n" + "=" * 80)
    print("MATERIAL FLOW DECOMPOSITION (BASE·REGULAR SCENARIO)")
    print("=" * 80)
    print(f"{'Material':<16} | {'Mass Share':<11} | {'2030 (kt)':<10} | {'2040 (kt)':<10} | {'2050 (kt)':<10} | {'Recoverable (2040)':<26}")
    print("-" * 94)
    for mat, info in MATERIAL_COMPOSITION.items():
        share = info["mass_fraction"]
        eff = info["recovery_efficiency"]
        w30 = base_reg_ann[2030] * share
        w40 = base_reg_ann[2040] * share
        w50 = base_reg_ann[2050] * share
        rec40 = f"{w40 * eff:.1f} kt (at {eff*100:.0f}%)" if eff is not None else "Unquantified (gross only)"
        print(f"{mat:<16} | {share*100:<10.2f}% | {w30:<10.1f} | {w40:<10.1f} | {w50:<10.1f} | {rec40:<26}")
    print("=" * 80)
    print("[EXECUTION COMPLETE] Model executed without errors.")
