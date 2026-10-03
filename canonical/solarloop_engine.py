"""
solarloop_engine.py
===================
Canonical analytical engine and data layer for the SolarLoop circularity model.
Integrates with the frozen waste forecasting engine (solar_waste_model_v2.py) and
encodes the strategic architecture, material flows, technology pathways, logistics,
economics, policy mechanisms, and digital traceability defined in
'India_Solar_Circularity_10pg_Report.pdf'.

Architecture:
  solar_waste_model_v2.py (FROZEN WASTE ENGINE)
          ↓
  solarloop_engine.py (CANONICAL MODEL & PIPELINE)
          ↓
  solarloop_canonical_data.json (SINGLE SOURCE OF TRUTH)
  validation_register.json (EVIDENCE GAPS & UNRESOLVED ITEMS)
"""

import json
import math
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Tuple

# Import directly from the frozen canonical forecasting engine
import solar_waste_model_v2 as forecast_engine


# ==============================================================================
# PART 3: CANONICAL MATERIAL MODEL SPECIFICATION
# ==============================================================================
# Baseline: CEEW 2025 legacy c-Si composition (from Report Exhibit 23, p. 8)
# Normalized to sum to exactly 100.000%
CANONICAL_MATERIAL_BASELINE: Dict[str, Dict[str, Any]] = {
    "Glass": {
        "mass_fraction": 0.7420,
        "kg_per_tonne": 742.0,
        "source": "CEEW (2025) / Report Exhibit 23",
        "status": "DOCUMENTED SOURCE",
        "notes": "741.6 kg/t in report Exhibit 23; front glass of standard c-Si module."
    },
    "Polymer": {
        "mass_fraction": 0.1130,
        "kg_per_tonne": 113.0,
        "source": "CEEW (2025) / Report Exhibit 23",
        "status": "DOCUMENTED SOURCE",
        "notes": "113.1 kg/t in report Exhibit 23; EVA encapsulants and Tedlar/PET backsheet."
    },
    "Aluminium": {
        "mass_fraction": 0.1030,
        "kg_per_tonne": 103.0,
        "source": "CEEW (2025) / Report Exhibit 23",
        "status": "DOCUMENTED SOURCE",
        "notes": "103.0 kg/t; extruded frame and mounting clips."
    },
    "Silicon": {
        "mass_fraction": 0.0335,
        "kg_per_tonne": 33.5,
        "source": "CEEW (2025) / Report Exhibit 23",
        "status": "DOCUMENTED SOURCE",
        "notes": "33.5 kg/t; crystalline silicon solar cells."
    },
    "Copper": {
        "mass_fraction": 0.0057,
        "kg_per_tonne": 5.7,
        "source": "CEEW (2025) / Report Exhibit 23",
        "status": "DOCUMENTED SOURCE",
        "notes": "5.7 kg/t; tinned ribbon, bussing, junction box wiring."
    },
    "Silver": {
        "mass_fraction": 0.000060,  # 0.006% = 60 g/tonne
        "kg_per_tonne": 0.060,      # 60 grams
        "source": "CEEW (2025) / Report Exhibit 10 & 23",
        "status": "DOCUMENTED SOURCE",
        "notes": "60 g/t (~0.006% of mass); ~25% of gross recovery value at ₹240/g."
    },
    "Other": {
        "mass_fraction": 0.002740,  # 2.74 kg/tonne (closes mass balance to 100.0%)
        "kg_per_tonne": 2.74,
        "source": "Report Exhibit 23 mass balance closure",
        "status": "MODELLING ASSUMPTION",
        "notes": "3.0 kg/t in report (Pb solder, Sn, junction box resins, cables)."
    }
}

# Technology-Specific Silver Intensities (from Report Exhibit 10 & 11, p. 4)
# Explicitly decoupled from vintage assumptions
TECHNOLOGY_SILVER_PROFILES: Dict[str, Dict[str, Any]] = {
    "Legacy_cSi": {
        "description": "Historical c-Si fleet (pre-2022)",
        "silver_g_per_tonne": 60.0,
        "silver_mg_per_watt": None,
        "assumed_watts_per_tonne": 18000.0,
        "source": "CEEW (2025) / Report Exhibit 10",
        "status": "DOCUMENTED SOURCE"
    },
    "TOPCon_Class_Low": {
        "description": "Modern n-type TOPCon cell architecture (lower silver bound)",
        "silver_g_per_tonne": 367.2,  # 20.4 mg/W * 18,000 W/t
        "silver_mg_per_watt": 20.4,
        "assumed_watts_per_tonne": 18000.0,
        "source": "Report Exhibit 10 & 11 (20.4 mg/W TOPCon-class)",
        "status": "DOCUMENTED SOURCE"
    },
    "TOPCon_Class_High": {
        "description": "Modern n-type TOPCon cell architecture (upper silver bound)",
        "silver_g_per_tonne": 468.0,  # 26.0 mg/W * 18,000 W/t
        "silver_mg_per_watt": 26.0,
        "assumed_watts_per_tonne": 18000.0,
        "source": "Report Exhibit 10 & 11 (26.0 mg/W TOPCon-class)",
        "status": "DOCUMENTED SOURCE"
    }
}


# ==============================================================================
# PART 4: RECYCLING TECHNOLOGY & RECOVERY SPECIFICATION
# ==============================================================================
# Documented route efficiencies from Report Exhibit 15 & 23, p. 6 & 8.
# Strictly distinguishes three disposition categories:
# 1. RECOVERED MATERIAL
# 2. CO-PROCESSING (Energy / Mineral recovery in cement kilns; NOT material recovery)
# 3. RESIDUAL / AUTHORISED DISPOSAL (Hazardous TSDF / process losses)
RECYCLING_ROUTES_CONFIG: Dict[str, Dict[str, Any]] = {
    "Chemical": {
        "name": "Thermal Delamination + Hydrometallurgical Chemical Recovery",
        "report_cost_inr_per_tonne": 49100.0,
        "trl": "6-8",
        "description": "Acid/alkali leaching and electrowinning for high-purity metal extraction.",
        "material_recovery_yields": {
            "Aluminium": 0.99,  # 102 kg remelt
            "Glass":     0.89,  # 660 kg cullet
            "Silicon":   0.90,  # 30 kg metallurgical-grade (MG-Si)
            "Copper":    0.83,  # 4.7 kg cathode copper
            "Silver":    0.74,  # 44 g refined silver
            "Polymer":   0.00,  # No material recovery yield
            "Other":     0.00   # No material recovery yield
        },
        "co_processing_yields": {
            "Aluminium": 0.00,
            "Glass":     0.00,
            "Silicon":   0.00,
            "Copper":    0.00,
            "Silver":    0.00,
            "Polymer":   1.00,  # 113 kg/t routed to cement-kiln co-processing
            "Other":     0.00
        },
        "disposition_categories": {
            "recovered_material": "Materials extracted and processed back into economic supply chains (cullet, aluminium remelt, MG-Si, cathode copper, refined silver).",
            "co_processing": "Thermal recovery where polymer/EVA is co-processed in cement kilns for energy and mineral ash utilization (113 kg/t).",
            "residual_disposal": "Process losses, unrecovered glass fines, and hazardous elements (lead, tin, fluoride effluent) sent to authorized TSDF facilities (~90 kg/t)."
        },
        "offtake_grade_notes": {
            "Aluminium": "High-purity frame remelt; qualified for extrusion.",
            "Glass": "Cullet suitable for container/insulation glass; solar float glass requires purity verification.",
            "Silicon": "Metallurgical-grade (MG-Si); upgrade to solar-grade requires 3N refining (C-MET/CSIR).",
            "Copper": "Refinery grade cathode.",
            "Silver": "Liquid precious-metal refiner offtake (>99% purity).",
            "Polymer": "No material recycling; co-processing in cement kilns.",
            "Other": "Sent to authorized TSDF hazardous waste facilities."
        },
        "source": "CEEW (2025) / Report Exhibit 15 & 23",
        "status": "DOCUMENTED SOURCE"
    },
    "Mechanical": {
        "name": "Mechanical Shredding, Optical Sorting & Magnetic/Eddy-Current Separation",
        "report_cost_inr_per_tonne": 40100.0,
        "trl": "9",
        "description": "Mature physical separation producing bulk cullet, aluminium, and impure fractions.",
        "material_recovery_yields": {
            "Aluminium": 0.99,  # 102 kg clean frame
            "Glass":     0.89,  # 660 kg contaminated glass fines
            "Silicon":   0.95,  # 31.8 kg as ferrosilicon (low economic value)
            "Copper":    0.95,  # 5.4 kg impure mixed copper shred
            "Silver":    0.00,  # 0% recovered (lost into shredding dust/residuals)
            "Polymer":   0.00,  # Unrecovered as material
            "Other":     0.00
        },
        "co_processing_yields": {
            "Aluminium": 0.00,
            "Glass":     0.00,
            "Silicon":   0.00,
            "Copper":    0.00,
            "Silver":    0.00,
            "Polymer":   0.00,  # Unseparated in mechanical shredding; goes to residual disposal unless secondary sorting applied
            "Other":     0.00
        },
        "disposition_categories": {
            "recovered_material": "Aluminium frame (99%), Glass fines (89%), Ferrosilicon (95%), Impure Copper shred (95%). Zero silver recovery.",
            "co_processing": "0 kg (not cleanly delaminated from glass/cells; unseparated).",
            "residual_disposal": "Mixed shred dust, unrecovered glass fines, polymers, solders (~200 kg/t)."
        },
        "offtake_grade_notes": {
            "Aluminium": "Clean extruded aluminium scrap.",
            "Glass": "Downcycled into aggregate / civil construction fines.",
            "Silicon": "Low-value ferrosilicon additive.",
            "Copper": "Impure shred requiring further smelting.",
            "Silver": "Zero recovery; economically lost.",
            "Polymer": "Landfill or refuse-derived fuel (RDF).",
            "Other": "Mixed shred residual."
        },
        "source": "CEEW (2025) / Report Exhibit 15",
        "status": "DOCUMENTED SOURCE"
    }
}


# ==============================================================================
# PART 5: MATERIAL FLOW ENGINE WITH 3 DISPOSITION CATEGORIES
# ==============================================================================

def calculate_material_flow(
    waste_tonnes: float,
    technology_profile: str = "Legacy_cSi",
    route: str = "Chemical"
) -> Dict[str, Any]:
    """
    Computes material flows across the THREE canonical disposition categories:
    1. RECOVERED MATERIAL
    2. CO-PROCESSING
    3. RESIDUAL / AUTHORISED DISPOSAL

    Strict Mass-Balance Equation:
    input_mass = recovered_material_mass + co_processed_mass + residual_mass
    """
    if route not in RECYCLING_ROUTES_CONFIG:
        raise ValueError(f"Unknown route '{route}'. Choose from {list(RECYCLING_ROUTES_CONFIG.keys())}")
    if technology_profile not in TECHNOLOGY_SILVER_PROFILES:
        raise ValueError(f"Unknown technology '{technology_profile}'. Choose from {list(TECHNOLOGY_SILVER_PROFILES.keys())}")

    route_cfg = RECYCLING_ROUTES_CONFIG[route]
    rec_yields = route_cfg["material_recovery_yields"]
    coproc_yields = route_cfg["co_processing_yields"]
    offtake_notes = route_cfg["offtake_grade_notes"]
    silver_profile = TECHNOLOGY_SILVER_PROFILES[technology_profile]

    material_contained: Dict[str, float] = {}
    recovered_material: Dict[str, float] = {}
    co_processed: Dict[str, float] = {}
    residuals: Dict[str, float] = {}

    for mat, props in CANONICAL_MATERIAL_BASELINE.items():
        if mat == "Silver":
            g_per_tonne = silver_profile["silver_g_per_tonne"]
            mat_tonnes = waste_tonnes * (g_per_tonne / 1_000_000.0)
        else:
            mat_tonnes = waste_tonnes * props["mass_fraction"]

        material_contained[mat] = mat_tonnes

        y_rec = rec_yields.get(mat, 0.0)
        y_coproc = coproc_yields.get(mat, 0.0)

        # Enforce physical validity: recovery yield + co-processing yield <= 1.0
        assert y_rec + y_coproc <= 1.0 + 1e-9, f"Disposition yield overflow for {mat}: {y_rec} + {y_coproc}"

        m_rec = mat_tonnes * y_rec
        m_coproc = mat_tonnes * y_coproc
        m_res = mat_tonnes - (m_rec + m_coproc)

        recovered_material[mat] = m_rec
        co_processed[mat] = m_coproc
        residuals[mat] = m_res

    total_contained = sum(material_contained.values())
    total_recovered = sum(recovered_material.values())
    total_coprocessed = sum(co_processed.values())
    total_residual = sum(residuals.values())

    # Strict Mass Balance Assertion: input_mass = recovered + co_processed + residual
    assert math.isclose(waste_tonnes, total_recovered + total_coprocessed + total_residual, rel_tol=1e-5), \
        f"Mass balance violation: {waste_tonnes} != {total_recovered} + {total_coprocessed} + {total_residual}"

    return {
        "input_mass": waste_tonnes,
        "input_waste_tonnes": waste_tonnes,
        "recovered_material_mass": total_recovered,
        "co_processed_mass": total_coprocessed,
        "residual_mass": total_residual,
        "material_contained": material_contained,
        "recovered_material": recovered_material,
        "co_processed_material": co_processed,
        "residuals": residuals,
        "disposition_shares_pct": {
            "recovered_pct": (total_recovered / waste_tonnes) * 100.0 if waste_tonnes > 0 else 0.0,
            "co_processed_pct": (total_coprocessed / waste_tonnes) * 100.0 if waste_tonnes > 0 else 0.0,
            "residual_pct": (total_residual / waste_tonnes) * 100.0 if waste_tonnes > 0 else 0.0
        },
        "material_recovery_yields": rec_yields,
        "co_processing_yields": coproc_yields,
        "offtake_grade_notes": offtake_notes
    }


# ==============================================================================
# PART 6: RECYCLING TECHNOLOGY & STREAM ROUTING LAYER
# ==============================================================================

RECYCLING_STREAMS_ROUTING: Dict[str, Dict[str, Any]] = {
    "Early_Loss_Salvage": {
        "timing_and_size": "Current; ~60 kt in 2026 (2.3% of additions); site-based bulk at utility parks.",
        "technology_vintage": "Recent (PERC -> TOPCon): silver-rich (20.4-26 mg/W).",
        "recommended_route": "Hybrid: mechanical dismantling -> thermal delamination -> hydromet Ag/Cu/Si recovery at regional hub.",
        "economic_rationale": "Silver value alone is ₹65-83k/t; concentrated at utility sites; highest value feedstock.",
        "status": "PROPOSAL",
        "attractiveness": "5/5 (Priority 1)"
    },
    "Insurance_Salvage": {
        "timing_and_size": "Current; weather/transit damage; volumes unquantified (evidence gap).",
        "technology_vintage": "Recent (PERC -> TOPCon).",
        "recommended_route": "Consolidated via EPC/insurers directly to hybrid regional hub.",
        "economic_rationale": "High silver concentration; bulk truckloads.",
        "status": "PROPOSAL (REQUIRES VALIDATION OF VOLUMES)",
        "attractiveness": "5/5 (Priority 1)"
    },
    "Utility_Decommissioning_Legacy": {
        "timing_and_size": "From early 2030s; bulk single-site loads.",
        "technology_vintage": "Legacy c-Si (~60 g/t silver).",
        "recommended_route": "Mechanical near-site: extract aluminium frame and glass; route cell laminates to hub only if volume justifies.",
        "economic_rationale": "Low silver content (~₹10.7k/t at ₹240/g); lowest haul cost per tonne; net negative without policy.",
        "status": "PROPOSAL",
        "attractiveness": "4/5 (Priority 2)"
    },
    "Dispersed_Rooftop_PM_KUSUM": {
        "timing_and_size": "Mostly 2035-2050; 36% of current additions; highly fragmented across rural/urban nodes.",
        "technology_vintage": "Mixed vintages.",
        "recommended_route": "District spokes: strip frame, J-box, glass locally; compact laminates trucked to regional hub.",
        "economic_rationale": "Published net -₹10k to -₹12k/t; haul distance (360 km) destroys margins; requires EPR aggregator support.",
        "status": "PROPOSAL",
        "attractiveness": "2/5 today; 4/5 with EPR"
    },
    "CdTe_Thin_Film": {
        "timing_and_size": "Smaller legacy fleet (~8% of historical waste, e.g. First Solar projects in Rajasthan/Gujarat).",
        "technology_vintage": "Cadmium Telluride.",
        "recommended_route": "Dedicated closed-loop producer take-back (First Solar established recycling facility).",
        "economic_rationale": "Controlled hazardous route for Cadmium/Tellurium (>90% material recovery claim).",
        "status": "DOCUMENTED PRODUCER ROUTE",
        "attractiveness": "Treat separately"
    },
    "Future_Generations_2045": {
        "timing_and_size": "Post-2045 wave.",
        "technology_vintage": "Tandem / Perovskite / Glass-Glass / Lead-free.",
        "recommended_route": "Advanced chemical / supercritical fluid / design-for-recycling lines.",
        "economic_rationale": "Requires pilot validation in 2035.",
        "status": "EVIDENCE GAP",
        "attractiveness": "Design lever now"
    }
}


# ==============================================================================
# PART 7: LOGISTICS & HUB-AND-SPOKE NETWORK LAYER
# ==============================================================================

LOGISTICS_NETWORK_CONFIG: Dict[str, Any] = {
    "architecture": "Hub-and-Spoke Regional Network",
    "status": "PROPOSAL",
    "key_nodes": {
        "district_spokes": {
            "function": "Receive, triage (reuse vs recycle), de-frame, remove J-box, glass separation (Stages 1-3).",
            "footprint": "Candidate co-location with existing aggregator yards and INA channel partners.",
            "transport_saving": "Strips ~74% glass and 10% aluminium locally, drastically cutting heavy road freight."
        },
        "regional_hubs": {
            "function": "Thermal delamination, chemical hydrometallurgy, precious metal refining, TSDF compliance (Stages 4-6).",
            "candidate_clusters": [
                "Rajasthan (Jaipur / RIICO industrial park)",
                "Gujarat (Surat - Bharuch corridor)",
                "Maharashtra (Pune - Nagpur belt)",
                "Karnataka (Bengaluru - Tumakuru)",
                "Tamil Nadu / Andhra Pradesh (Chennai - Sri City)"
            ],
            "target_utilization": ">= 67% (minimum economic threshold per CEEW 2025)"
        }
    },
    "haul_distance_parameters": {
        "baseline_average_haul_km": 360.0,
        "freight_rate_inr_per_tonne_km": 12.0,
        "baseline_collection_cost_inr_per_tonne": 4454.0,
        "optimized_spoke_haul_km": 100.0,
        "logistics_saving_inr_per_tonne": 3217.0,
        "source": "CEEW (2025) / Report Exhibit 19 & 21"
    }
}


# ==============================================================================
# PART 8: INA SOLAR STRATEGIC FIT SPECIFICATION
# ==============================================================================

INA_STRATEGIC_FIT: Dict[str, Any] = {
    "entity_name": "Insolation Energy Limited (INA Solar)",
    "status": "STRATEGIC OPTION / PROPOSAL (NOT AN EXISTING CONTRACT)",
    "verified_company_facts": {
        "channel_network": "700+ channel partners across 100+ districts (Problem Statement / Report p. 7).",
        "manufacturing_hub": "Jaipur, Rajasthan (Rajasthan represents ~35% of India's utility additions).",
        "planned_aluminium_frame_capacity": "12,000 t/year frame manufacturing line planned (status unverified).",
        "cell_manufacturing_plans": "Planned TOPCon and 1,500 MW cell manufacturing line.",
        "installed_supply_footprint": ">700 MW supplied under JJM, SECI, PM-KUSUM, PM Surya Ghar."
    },
    "strategic_anchoring_opportunities": {
        "aggregation_spokes": "Utilize 700+ channel partner yards as district-level drop-off and triage nodes.",
        "aluminium_circularity": {
            "feasibility": "National recoverable aluminium is ~5-16 kt/yr in 2030 and ~9-36 kt/yr in 2035.",
            "implication": "INA's planned 12 kt/yr frame line could absorb a meaningful share of recycled aluminium without oversupply risk.",
            "prerequisite": "Alloy qualification, remelt certification, and operational line confirmation."
        },
        "closed_loop_take_back": "Traceable take-back mechanism for INA-branded modules under PM Surya Ghar / KUSUM.",
        "design_for_recycling": "Incorporate recyclability standards into upcoming 1,500 MW cell/module lines."
    }
}


# ==============================================================================
# PART 9: RECYCLING ECONOMICS ENGINE
# ==============================================================================

def calculate_economics(
    silver_price_inr_per_g: float = 240.0,
    silver_recovery_rate: float = 0.74,
    feedstock_cost_inr_per_module: float = 600.0,
    modules_per_tonne: float = 45.45,
    haul_distance_km: float = 360.0,
    freight_rate_inr_per_tkm: float = 12.0,
    epr_certificate_inr_per_kg: float = 0.0,
    route: str = "Chemical",
    technology_profile: str = "Legacy_cSi"
) -> Dict[str, Any]:
    """
    Parametric unit economics calculator per tonne of solar waste.
    Strictly separates PUBLISHED figures from TEAM RECOMPUTATIONS and HYPOTHETICAL POLICY SCENARIOS.
    """
    # 1. Base cost parameters from CEEW 2025 published report
    ceew_published_net_inr = -12341.0
    ceew_baseline_silver_price_inr = 95.8
    ceew_silver_yield_g = 60.0 * 0.74  # 44.4 g recovered

    # 2. Feedstock Procurement Cost (recurring)
    feedstock_cost_inr_per_tonne = feedstock_cost_inr_per_module * modules_per_tonne

    # 3. Logistics Cost Adjustment
    baseline_haul_km = 360.0
    logistics_delta_inr = (haul_distance_km - baseline_haul_km) * freight_rate_inr_per_tkm

    # 4. Silver Revenue Adjustment
    profile = TECHNOLOGY_SILVER_PROFILES[technology_profile]
    contained_ag_g = profile["silver_g_per_tonne"]
    recovered_ag_g = contained_ag_g * silver_recovery_rate
    silver_rev_actual_inr = recovered_ag_g * silver_price_inr_per_g
    ceew_ref_silver_rev_inr = ceew_silver_yield_g * ceew_baseline_silver_price_inr
    silver_delta_inr = silver_rev_actual_inr - ceew_ref_silver_rev_inr

    # 5. EPR Certificate Credit (Hypothetical policy intervention)
    epr_credit_inr_per_tonne = epr_certificate_inr_per_kg * 1000.0

    # 6. Recomputed Net Economics
    baseline_feedstock_inr = 600.0 * 45.45
    feedstock_delta_inr = feedstock_cost_inr_per_tonne - baseline_feedstock_inr

    net_economics_inr_per_tonne = (
        ceew_published_net_inr
        + silver_delta_inr
        - feedstock_delta_inr
        - logistics_delta_inr
        + epr_credit_inr_per_tonne
    )

    return {
        "status": "TEAM RECOMPUTATION",
        "inputs": {
            "silver_price_inr_per_g": silver_price_inr_per_g,
            "silver_recovery_rate": silver_recovery_rate,
            "feedstock_cost_inr_per_module": feedstock_cost_inr_per_module,
            "haul_distance_km": haul_distance_km,
            "epr_certificate_inr_per_kg": epr_certificate_inr_per_kg,
            "technology_profile": technology_profile,
            "route": route
        },
        "breakdown_inr_per_tonne": {
            "ceew_published_baseline_net": ceew_published_net_inr,
            "silver_revenue_delta": silver_delta_inr,
            "feedstock_cost_delta": -feedstock_delta_inr,
            "logistics_cost_delta": -logistics_delta_inr,
            "epr_certificate_credit": epr_credit_inr_per_tonne,
            "final_net_economics_inr_per_tonne": net_economics_inr_per_tonne
        },
        "capex_benchmarks": {
            "chemical_plant_capex_cr": 14.4,
            "capex_breakdown_cr": {"land": 4.75, "construction": 2.30, "machinery": 7.13, "compliance": 0.20},
            "national_capex_299_plants_cr": 4274.0,
            "source": "CEEW (2025) / Report Exhibit 25"
        }
    }


# Standard Benchmark Cases (from Report Exhibit 25, p. 9)
ECONOMIC_REFERENCE_CASES: Dict[str, Dict[str, Any]] = {
    "Published_CEEW_Chemical": {
        "label": "Published CEEW Reference Case (Chemical Route)",
        "net_inr_per_tonne": -12341.0,
        "classification": "PUBLISHED BENCHMARK",
        "notes": "Silver at ₹95.8/g, paid feedstock ₹600/module, no EPR support."
    },
    "Silver_Repriced_Team_Case": {
        "label": "Silver Re-Priced Team Case (Chemical Route)",
        "net_inr_per_tonne": -5938.0,
        "classification": "TEAM RECOMPUTATION",
        "notes": "Silver repriced to ₹240/g (30 Sep 2026 quote); adds +₹6,403/t; no policy support."
    },
    "EPR_Floor_Bankable_Case": {
        "label": "Hypothetical EPR Floor Case (Chemical Route)",
        "net_inr_per_tonne": 16062.0,
        "classification": "HYPOTHETICAL POLICY SCENARIO",
        "notes": "Silver at ₹240/g + EPR certificate floor of ₹22/kg (+₹22,000/t). NOT CURRENT MARKET REALITY."
    },
    "Published_CEEW_Mechanical": {
        "label": "Published CEEW Reference Case (Mechanical Route)",
        "net_inr_per_tonne": -10200.0,
        "classification": "PUBLISHED BENCHMARK",
        "notes": "Lower capex/opex (₹40.1k/t), but zero silver recovery leaves net economics negative."
    }
}


# ==============================================================================
# PART 10: POLICY LAYER SPECIFICATION
# ==============================================================================

POLICY_MATRIX: List[Dict[str, Any]] = [
    {
        "mechanism": "Solar EPR Targets and Certificates",
        "current_state": "E-Waste Rules 2022 classify solar PV under category CEEW14, but no recycling targets or tradable certificates are notified.",
        "proposed_intervention": "Notify mandatory recycling targets (40% collection / 80% recycling by 2030) and establish EPR credit floor of ₹22/kg (ceiling ₹74/kg).",
        "economic_effect": "+₹22,000/tonne revenue; flips chemical recycling from -₹5.9k/t to +₹16.0k/t.",
        "responsible_institution": "MoEFCC / CPCB",
        "status": "PROPOSED (EVIDENCE GAP IN GAZETTE TIMING)"
    },
    {
        "mechanism": "Bulk-Consumer Channelling Duty",
        "current_state": "Solar park developers and IPPs have no statutory duty to channel end-of-life modules to formal recyclers.",
        "proposed_intervention": "Mandate that solar power developers (>1 MW) declare decommissioning schedules and surrender modules to registered recyclers at zero cost.",
        "economic_effect": "Feedstock certainty; eliminates ₹600/module procurement cost (+₹27,300/t saving for recyclers).",
        "responsible_institution": "MoEFCC / MNRE / SECI tender clauses",
        "status": "PROPOSED"
    },
    {
        "mechanism": "Material-Specific Recovery Mandates",
        "current_state": "General e-waste targets allow cherry-picking aluminium and steel, abandoning cells and glass.",
        "proposed_intervention": "Notify material-specific recovery thresholds (e.g. 70% Ag, 80% Cu, 80% Si) to enforce deep recycling.",
        "economic_effect": "Protects ~₹10.7k/t silver value from being landfilled or lost in mechanical shredding.",
        "responsible_institution": "MoEFCC / CPCB",
        "status": "PROPOSED"
    },
    {
        "mechanism": "National Installed-Asset Registry",
        "current_state": "MNRE mandates RFID tags, and NISE manages the ALMM portal, but data is fragmented and not accessible for waste planning.",
        "proposed_intervention": "Extend ALMM/RFID traceability into a public district-level digital registry tracking location, vintage, and technology.",
        "economic_effect": "Optimizes hub siting and vehicle routing, cutting average haul from 360 km to 100 km (saves ₹3,217/t).",
        "responsible_institution": "MNRE / NISE",
        "status": "PROPOSED"
    },
    {
        "mechanism": "Pre-Funded End-of-Life Disposal Fee",
        "current_state": "No advance disposal fee collected at commissioning.",
        "proposed_intervention": "Levy an upfront escrow fee of ₹0.3-0.5/W on new installations to fund eventual decommissioning.",
        "economic_effect": "Guarantees long-term solvency of recycling funds without recurring state subsidy.",
        "responsible_institution": "MNRE / MoEFCC",
        "status": "PROPOSED"
    }
]


# ==============================================================================
# PART 11: DIGITAL TRACEABILITY STACK
# ==============================================================================

DIGITAL_STACK_CONFIG: Dict[str, Any] = {
    "architecture": "Layered Traceability & Logistics Protocol",
    "blockchain_status": "EXCLUDED (no multi-party trust failure that a cryptographically signed registry cannot solve)",
    "layers": [
        {
            "layer": "Physical Identity",
            "technology": "RFID tags (already mandated in scheme projects) + 2D QR codes on frame and backsheet.",
            "function": "Module serialization, manufacturer ID, bill of materials, warranty registration."
        },
        {
            "layer": "Asset Registry",
            "technology": "Central database extending NISE ALMM traceability portal to district levels.",
            "function": "Tracks plant coordinates, commissioning date, module technology, and expected retirement."
        },
        {
            "layer": "Predictive Triage",
            "technology": "Survival model + SCADA degradation algorithms + drone EL/thermography.",
            "function": "Predicts field failure and gates modules between second-life reuse and material recycling."
        },
        {
            "layer": "Logistics & Routing",
            "technology": "Vehicle routing API connected to district spoke consolidation hubs.",
            "function": "Minimizes transport mileage and enables reverse-logistics backhauls."
        },
        {
            "layer": "Compliance & EPR Ledger",
            "technology": "CPCB EPR portal API with cryptographic chain-of-custody handoffs.",
            "function": "Validates mass balance and issues tamper-proof EPR recycling certificates."
        }
    ]
}


# ==============================================================================
# PART 12: DECISION ENGINE
# ==============================================================================

def generate_decision_output(
    target_year: int = 2030,
    scenario_name: str = "Base·Regular",
    silver_price_quote: float = 240.0,
    include_epr: bool = False
) -> Dict[str, Any]:
    """
    Synthesizes forecasting, material disposition, logistics, economic, and policy dimensions
    into an integrated executive decision framework.
    All recommendations are clearly labeled as MODEL / TEAM RECOMMENDATIONS.
    """
    scenarios_data = forecast_engine.run_all_scenarios()
    sc = scenarios_data[scenario_name]
    ann_waste = sc["annual_waste_kt"][target_year]
    cum_waste = sc["cumulative_waste_kt"][target_year]

    # Material flows across the 3 disposition categories (Chemical route)
    flows = calculate_material_flow(ann_waste * 1000.0, technology_profile="Legacy_cSi", route="Chemical")

    # Economics
    epr_rate = 22.0 if include_epr else 0.0
    econ = calculate_economics(silver_price_inr_per_g=silver_price_quote, epr_certificate_inr_per_kg=epr_rate)

    # Plants required (at 3,600 tpa effective capacity per CEEW)
    effective_capacity_kt = 3.6
    plants_needed = math.ceil(ann_waste / effective_capacity_kt)

    return {
        "analysis_year": target_year,
        "selected_scenario": scenario_name,
        "waste_metrics": {
            "annual_waste_kt": ann_waste,
            "cumulative_waste_kt": cum_waste,
            "commissioning_scrap_kt": sc["commissioning_scrap_kt"][target_year],
            "operational_failure_kt": sc["operational_failure_kt"][target_year]
        },
        "capacity_requirements": {
            "standard_plant_size_tpa": 3600,
            "plants_needed_national": plants_needed,
            "national_capex_requirement_cr": plants_needed * 14.4
        },
        "material_disposition_summary_kt": {
            "input_waste_kt": flows["input_mass"] / 1000.0,
            "recovered_material_kt": flows["recovered_material_mass"] / 1000.0,
            "co_processed_material_kt": flows["co_processed_mass"] / 1000.0,
            "residual_disposal_kt": flows["residual_mass"] / 1000.0,
            "disposition_shares_pct": flows["disposition_shares_pct"]
        },
        "material_recovery_breakdown_kt": {
            "glass_cullet": flows["recovered_material"]["Glass"] / 1000.0,
            "aluminium_remelt": flows["recovered_material"]["Aluminium"] / 1000.0,
            "silicon_mg": flows["recovered_material"]["Silicon"] / 1000.0,
            "copper_refining": flows["recovered_material"]["Copper"] / 1000.0,
            "silver_refining_tonnes": flows["recovered_material"]["Silver"]  # metric tonnes
        },
        "economic_status_per_tonne": {
            "net_economics_inr": econ["breakdown_inr_per_tonne"]["final_net_economics_inr_per_tonne"],
            "epr_included": include_epr,
            "silver_price_assumed_inr_per_g": silver_price_quote
        },
        "ina_strategic_context": {
            "national_aluminium_pool_kt": flows["recovered_material"]["Aluminium"] / 1000.0,
            "ina_planned_frame_line_kt": 12.0,
            "ina_potential_absorption_pct": min(100.0, (flows["recovered_material"]["Aluminium"] / 1000.0 / 12.0) * 100.0)
        },
        "team_recommendations": [
            "[MODEL/TEAM RECOMMENDATION] Focus near-term commercial activity (2026-2028) on silver-rich early-loss and insurance salvage streams rather than waiting for EPR mandates.",
            "[MODEL/TEAM RECOMMENDATION] Establish district-level spoke yards in Rajasthan and Gujarat to de-frame modules and strip glass locally, cutting 360 km haul freight by ~₹3,200/tonne.",
            "[MODEL/TEAM RECOMMENDATION] Advocate for MoEFCC to notify solar EPR targets with an initial certificate floor of ≥₹22/kg to bridge the -₹5,938/t chemical recycling operating deficit.",
            "[MODEL/TEAM RECOMMENDATION] For INA Solar: conduct an alloy-qualification trial to test whether remelted aluminium frames meet extrusion specifications for its planned 12 kt/yr frame line."
        ]
    }


# ==============================================================================
# PART 14: DATA INTEGRITY TEST SUITE
# ==============================================================================

def run_integrity_suite() -> List[str]:
    """Executes programmatic validation across forecasting, material disposition, and economic modules."""
    log = []

    # 1. Forecasting Engine Consistency & Monotonicity
    scenarios = forecast_engine.run_all_scenarios()
    assert len(scenarios) == 6, "Expected 6 scenarios"
    log.append("[PASS] All 6 forecast scenarios generated successfully.")

    for name, data in scenarios.items():
        for yr in [2030, 2040, 2050]:
            assert data["annual_waste_kt"][yr] >= 0.0, f"Negative waste in {name} {yr}"
            assert data["cumulative_waste_kt"][yr] >= data["cumulative_waste_kt"][yr - 1], f"Non-monotonic cumulative in {name} {yr}"
    log.append("[PASS] Non-negativity and monotonicity verified across all scenarios.")

    # 2. Material Mass Balance Check (Inputs Sum to 100%)
    total_share = sum(p["mass_fraction"] for p in CANONICAL_MATERIAL_BASELINE.values())
    assert math.isclose(total_share, 1.0, rel_tol=1e-5), f"Material shares sum to {total_share}"
    log.append("[PASS] Canonical material baseline shares sum exactly to 100.000%.")

    # 3. Mass-Balance Equation Verification across 3 Disposition Categories
    # Equation: input_mass = recovered_material_mass + co_processed_mass + residual_mass
    for route in ["Chemical", "Mechanical"]:
        for test_mass in [1.0, 1000.0, 50341.6]:
            flow = calculate_material_flow(test_mass, route=route)
            m_in = flow["input_mass"]
            m_rec = flow["recovered_material_mass"]
            m_coproc = flow["co_processed_mass"]
            m_res = flow["residual_mass"]
            
            assert math.isclose(m_in, m_rec + m_coproc + m_res, rel_tol=1e-5), \
                f"Mass balance identity failed for {route} with input {m_in}: {m_rec} + {m_coproc} + {m_res}"
            
            # Individual material checks
            for mat in CANONICAL_MATERIAL_BASELINE.keys():
                contained = flow["material_contained"][mat]
                rec = flow["recovered_material"][mat]
                coproc = flow["co_processed_material"][mat]
                res = flow["residuals"][mat]
                assert math.isclose(contained, rec + coproc + res, rel_tol=1e-5), \
                    f"Component balance failed for {mat} in {route}"
    log.append("[PASS] Identity 'input_mass = recovered_material_mass + co_processed_mass + residual_mass' strictly verified.")

    # 4. Route-Specific Yield & Co-Processing Integrity
    chem_1t = calculate_material_flow(1000.0, route="Chemical")
    # Chemical route: Polymer has 0 material recovery and 100% co-processing
    assert chem_1t["recovered_material"]["Polymer"] == 0.0, "Polymer must not have material recovery yield"
    assert math.isclose(chem_1t["co_processed_material"]["Polymer"], 113.0, abs_tol=0.2), "Polymer co-processed mass must equal ~113 kg/t"
    # Chemical route: Residuals match ~90 kg/t (glass fines, Pb, Sn)
    assert math.isclose(chem_1t["residual_mass"], 89.72, abs_tol=1.0), "Chemical route residuals must equal ~90 kg/t"
    log.append("[PASS] Chemical route co-processing (113 kg/t polymer) and residuals (~90 kg/t) verified against report.")

    mech_1t = calculate_material_flow(1000.0, route="Mechanical")
    assert mech_1t["recovered_material"]["Silver"] == 0.0, "Mechanical route must yield 0% silver recovery"
    log.append("[PASS] Mechanical route correctly yields 0% silver recovery.")

    # 5. Economic Calculations Check
    econ_ref = calculate_economics(silver_price_inr_per_g=95.8, epr_certificate_inr_per_kg=0.0)
    assert math.isclose(econ_ref["breakdown_inr_per_tonne"]["final_net_economics_inr_per_tonne"], -12341.0, abs_tol=50.0), "Published baseline deviation"

    econ_silver = calculate_economics(silver_price_inr_per_g=240.0, epr_certificate_inr_per_kg=0.0)
    assert math.isclose(econ_silver["breakdown_inr_per_tonne"]["final_net_economics_inr_per_tonne"], -5938.0, abs_tol=50.0), "Silver repriced deviation"

    econ_epr = calculate_economics(silver_price_inr_per_g=240.0, epr_certificate_inr_per_kg=22.0)
    assert math.isclose(econ_epr["breakdown_inr_per_tonne"]["final_net_economics_inr_per_tonne"], 16062.0, abs_tol=50.0), "EPR floor case deviation"
    log.append("[PASS] Reference economic cases (-₹12.3k, -₹5.9k, +₹16.0k) verified within tolerance.")

    return log


# ==============================================================================
# PART 2 & 15: FILE EXPORTERS
# ==============================================================================

def export_canonical_data_json(filepath: str = "solarloop_canonical_data.json") -> None:
    """Exports the complete, auditable single source of truth for SolarLoop."""
    scenarios_data = forecast_engine.run_all_scenarios()
    sensitivity_data = forecast_engine.run_sensitivity_analysis([2030, 2040, 2050])

    # Serializing scenarios
    scenario_export = {}
    for sc_name, sc_data in scenarios_data.items():
        scenario_export[sc_name] = {
            "capacity_path": sc_data["capacity_path"],
            "alpha": sc_data["alpha"],
            "annual_series_kt": {str(y): round(sc_data["annual_waste_kt"][y], 2) for y in range(2026, 2051)},
            "cumulative_series_kt": {str(y): round(sc_data["cumulative_waste_kt"][y], 2) for y in range(2026, 2051)},
            "commissioning_scrap_series_kt": {str(y): round(sc_data["commissioning_scrap_kt"][y], 2) for y in range(2026, 2051)},
            "operational_failure_series_kt": {str(y): round(sc_data["operational_failure_kt"][y], 2) for y in range(2026, 2051)},
            "milestone_years": {
                str(yr): {
                    "annual_waste_kt": round(sc_data["annual_waste_kt"][yr], 2),
                    "cumulative_waste_kt": round(sc_data["cumulative_waste_kt"][yr], 2),
                    "commissioning_scrap_kt": round(sc_data["commissioning_scrap_kt"][yr], 2),
                    "operational_failure_kt": round(sc_data["operational_failure_kt"][yr], 2)
                } for yr in [2030, 2040, 2050]
            }
        }

    canonical_data = {
        "model_metadata": {
            "system_name": "SolarLoop Canonical Analytical Platform",
            "model_version": "2.0-SolarLoop",
            "forecast_engine_version": "solar_waste_model_v2.py (FROZEN)",
            "generated_at_utc": datetime.now(timezone.utc).isoformat(),
            "status": "CANONICAL DATA LAYER",
            "strategic_reference_document": "India_Solar_Circularity_10pg_Report.pdf",
            "source_hierarchy": [
                "1. Observed National Statistics (MNRE, CEA, CPCB)",
                "2. Peer-Reviewed & Foundational Research (IRENA/IEA-PVPS 2016, CEEW 2024-2025)",
                "3. Strategic Report Architecture (India_Solar_Circularity_10pg_Report.pdf)",
                "4. Team Recomputations & Sensitivity Boundaries",
                "5. Analytical Proposals (Clearly Tagged)"
            ]
        },
        "forecast_outputs": scenario_export,
        "sensitivity_outputs": sensitivity_data,
        "material_model": {
            "canonical_baseline_cSi": CANONICAL_MATERIAL_BASELINE,
            "technology_silver_profiles": TECHNOLOGY_SILVER_PROFILES,
            "disposition_accounting": {
                "equation": "input_mass = recovered_material_mass + co_processed_mass + residual_mass",
                "category_1": "Recovered Material (Materially recovered and refined for economic offtake)",
                "category_2": "Co-Processing (Energy and mineral recovery in cement kilns; NOT material recovery)",
                "category_3": "Residual / Authorised Disposal (Process losses, glass fines, TSDF hazardous waste)"
            }
        },
        "recycling_routes": RECYCLING_ROUTES_CONFIG,
        "stream_routing": RECYCLING_STREAMS_ROUTING,
        "logistics_network": LOGISTICS_NETWORK_CONFIG,
        "ina_strategic_context": INA_STRATEGIC_FIT,
        "economics_reference": ECONOMIC_REFERENCE_CASES,
        "policy_matrix": POLICY_MATRIX,
        "digital_stack": DIGITAL_STACK_CONFIG
    }

    with open(filepath, "w") as f:
        json.dump(canonical_data, f, indent=2)
    print(f"[SUCCESS] Exported canonical data layer to '{filepath}'.")


def export_validation_register_json(filepath: str = "validation_register.json") -> None:
    """Exports the complete validation register of unresolved evidence gaps and empirical assumptions."""
    register = [
        {
            "id": "GAP-01",
            "issue": "Vintage-Specific Silver Intensity Evolution",
            "why_it_matters": "Silver drives ~25% of gross recovery value at ₹240/g. A 20x discrepancy exists between legacy IRENA (500 g/t) and CEEW (60 g/t legacy down to modern TOPCon 20.4-26 mg/W).",
            "affected_module": "Material Model & Economics Engine",
            "current_assumption": "Legacy c-Si fixed at 60 g/tonne (CEEW 2025); TOPCon silver-rich profiles modeled separately.",
            "validation_needed": "Empirical metallization surveys across Indian cell lines and module procurement batches.",
            "status": "REQUIRES EMPIRICAL VALIDATION"
        },
        {
            "id": "GAP-02",
            "issue": "Glass-Glass Bifacial Module Penetration",
            "why_it_matters": "Modern utility installations use dual 2.0 mm glass, increasing glass fraction to 80-84% and eliminating aluminium frames on some tracker configurations.",
            "affected_module": "Material Flow Engine & Mass Intensity (t/MW)",
            "current_assumption": "74.2% glass and 10.3% aluminium based on standard framed single-glass modules.",
            "validation_needed": "Procurement share breakdown between glass-backsheet and glass-glass in Indian utility bids.",
            "status": "REQUIRES VALIDATION"
        },
        {
            "id": "GAP-03",
            "issue": "Official Statistics Capacity Basis (AC vs. DC)",
            "why_it_matters": "MNRE grid reporting is AC-based. A DC/AC ratio of 1.25 increases physical module mass and waste by 25%.",
            "affected_module": "Forecast Waste Engine",
            "current_assumption": "Canonical baseline 1.0 (DC nameplate); 1.25 evaluated as sensitivity.",
            "validation_needed": "Reconciliation of CEA grid export records with developer inverter loading ratios.",
            "status": "VALIDATION FLAGGED"
        },
        {
            "id": "GAP-04",
            "issue": "Indian Field Failure and Replacement Rates",
            "why_it_matters": "NCPRE surveys report India field median degradation of ~0.91%/yr vs 0.5-0.6% global, accelerating premature failures.",
            "affected_module": "Weibull Shape & Early-Loss Hazard",
            "current_assumption": "IRENA Early-Loss alpha=2.4928 + 2.3% commissioning scrap treated as conservative stress upper bound.",
            "validation_needed": "Actual insurance claim logs and developer O&M warranty replacement registries.",
            "status": "REQUIRES FIELD DATA"
        },
        {
            "id": "GAP-05",
            "issue": "Insurance Salvage Volume and Current Disposal Practices",
            "why_it_matters": "Insurance claims from hail, windstorms, and transit damage represent early high-value feedstock, but current disposal often leaks to the informal sector.",
            "affected_module": "Stream Routing & Feedstock Procurement",
            "current_assumption": "Classified as priority feedstock; volume currently unquantified.",
            "validation_needed": "Survey of national general insurers (GIC, New India Assurance) solar salvage auctions.",
            "status": "EVIDENCE GAP"
        },
        {
            "id": "GAP-06",
            "issue": "Repowering Pipeline for Early JNNSM Assets",
            "why_it_matters": "India has ~3 GW installed before 2015. Repowering could release concentrated bulk waste earlier than 30-year Weibull wearout.",
            "affected_module": "Retirement Hazard Model",
            "current_assumption": "Excluded from baseline; repowering rate = 0.0.",
            "validation_needed": "MNRE policy notification on repowering guidelines and tariff restructuring.",
            "status": "POLICY DEPENDENT"
        },
        {
            "id": "GAP-07",
            "issue": "Formal Recycling Capacity Reconciliation",
            "why_it_matters": "Unreconciled discrepancy between CPCB-listed capacity (1,800 tpa) and company-reported capacity (Regain 250 MW/yr line ≈ 14.5 kt/yr).",
            "affected_module": "Capacity Requirements & Plant Gap",
            "current_assumption": "Reported as an unreconciled evidence gap (1.8 - 14.5 kt/yr).",
            "validation_needed": "State Pollution Control Board (SPCB) consent-to-operate (CTO) physical audit.",
            "status": "REQUIRES AUDIT"
        },
        {
            "id": "GAP-08",
            "issue": "Recovered Glass Cullet Purity and Industrial Offtake",
            "why_it_matters": "Glass constitutes ~74% of module mass and 83% of recovered output. If float glass makers reject cullet due to antimony/iron contamination, recyclers face disposal costs.",
            "affected_module": "Material Flow & Recycler Offtake",
            "current_assumption": "Gross recovery 89%; offtake acceptability untested with float glass makers.",
            "validation_needed": "Cullet chemical assays and offtake trials with domestic container/flat glass producers.",
            "status": "CRITICAL OFFTAKE GAP"
        },
        {
            "id": "GAP-09",
            "issue": "Recycler Plant Utilization & Fixed/Variable Cost Structure",
            "why_it_matters": "CEEW assumes 67% utilization for 3,600 tpa plants. Without feedstock certainty, sub-scale plants face stranded capital.",
            "affected_module": "Economics Engine",
            "current_assumption": "Unit cost taken as static ₹49.1k/t; full fixed/variable split unmodeled.",
            "validation_needed": "Detailed cost ledger from operational Indian recycling facilities.",
            "status": "EVIDENCE GAP"
        },
        {
            "id": "GAP-10",
            "issue": "Domestic Machinery Capex Reduction Claim (~43%)",
            "why_it_matters": "Report notes domestic machinery could cut plant capex by ~43% (machinery is 45-50% of capex), but supplier base is embryonic.",
            "affected_module": "Plant Capex & National Capital Requirements",
            "current_assumption": "Baseline capex ₹14.4 cr per chemical plant; 43% reduction treated as unconfirmed claim.",
            "validation_needed": "Vendor quotation benchmark for indigenised thermal delamination and hydromet skids.",
            "status": "UNCONFIRMED CLAIM"
        },
        {
            "id": "GAP-11",
            "issue": "Future Technology Composition (Perovskite / Tandem / Thin-Film)",
            "why_it_matters": "Post-2040 waste will be dominated by emerging technologies with different material footprints (lead, bismuth, carbon).",
            "affected_module": "Long-Term Material Forecast",
            "current_assumption": "Not modeled numerically; flagged for review in 2035.",
            "validation_needed": "Long-term R&D monitoring with NISE, C-MET, and global PV consortiums.",
            "status": "LONG-TERM RESEARCH TRACK"
        }
    ]

    with open(filepath, "w") as f:
        json.dump(register, f, indent=2)
    print(f"[SUCCESS] Exported validation register to '{filepath}'.")


# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

if __name__ == "__main__":
    print("=" * 80)
    print("SOLARLOOP CANONICAL ANALYTICAL ENGINE & DATA PIPELINE")
    print("=" * 80)

    # 1. Run Data Integrity Tests
    print("\n--- [RUNNING CANONICAL INTEGRITY TEST SUITE] ---")
    test_results = run_integrity_suite()
    for res in test_results:
        print(f"  {res}")

    # 2. Export Single Source of Truth JSON Files
    print("\n--- [GENERATING CANONICAL DATA ARTIFACTS] ---")
    export_canonical_data_json("solarloop_canonical_data.json")
    export_validation_register_json("validation_register.json")

    # 3. Generate and Display Integrated Decision Output
    print("\n" + "=" * 80)
    print("INTEGRATED EXECUTIVE DECISION OUTPUT (2030 BASE·REGULAR BENCHMARK)")
    print("=" * 80)
    decision = generate_decision_output(
        target_year=2030,
        scenario_name="Base·Regular",
        silver_price_quote=240.0,
        include_epr=False
    )
    print(json.dumps(decision, indent=2))

    print("\n" + "=" * 80)
    print("[EXECUTION COMPLETE] Canonical data layer and validation register generated.")
