import React, { useState } from 'react';
import { BASELINE_SCENARIOS } from '../../data/researchBaseline';
import { useScenario } from '../../context/ScenarioContext';
import { Download, Eye, EyeOff } from 'lucide-react';

interface TimeSeriesChartProps {
  title?: string;
  metric?: 'cumulative' | 'annual';
  showScenarioComparison?: boolean;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  title = 'Solar Waste Accumulation Trajectory (2025–2050)',
  metric: initialMetric = 'cumulative',
  showScenarioComparison = true
}) => {
  const { unit, setUnit, activeScenario, simulationResult } = useScenario();
  const [metric, setMetric] = useState<'cumulative' | 'annual'>(initialMetric);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);
  const [visibleScenarios, setVisibleScenarios] = useState<Record<string, boolean>>({
    base_regular: true,
    base_early_loss: true,
    conservative_regular: false,
    conservative_early_loss: false,
    custom: activeScenario === 'custom_scenario'
  });

  const toggleScenario = (key: string) => {
    setVisibleScenarios(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const years = [2025, 2027, 2030, 2033, 2035, 2038, 2040, 2043, 2045, 2047, 2050];

  // SVG viewport
  const width = 840;
  const height = 360;
  const padding = { top: 35, right: 35, bottom: 45, left: 65 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Max value calculation based on metric
  const maxValKt = metric === 'cumulative' ? 18000 : 2500;
  const unitDivider = unit === 'Mt' ? 1000 : 1;
  const unitLabel = unit === 'Mt' ? 'Mt' : 'kt';

  const scaleX = (yr: number) => {
    return padding.left + ((yr - 2025) / (2050 - 2025)) * innerWidth;
  };

  const scaleY = (valKt: number) => {
    const clamped = Math.max(0, Math.min(valKt, maxValKt));
    return padding.top + innerHeight - (clamped / maxValKt) * innerHeight;
  };

  // Generate path string
  const generatePath = (data: { year: number; cumulativeKt: number; annualKt: number }[]) => {
    return data.map((pt, i) => {
      const x = scaleX(pt.year);
      const yVal = metric === 'cumulative' ? pt.cumulativeKt : pt.annualKt;
      const y = scaleY(yVal);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // Export CSV
  const handleExportCSV = () => {
    let csv = `Year,Base_Regular_${unitLabel},Base_EarlyLoss_${unitLabel},Conservative_Regular_${unitLabel},Conservative_EarlyLoss_${unitLabel}\n`;
    years.forEach(yr => {
      const br = BASELINE_SCENARIOS.base_regular.data.find(d => d.year === yr);
      const bel = BASELINE_SCENARIOS.base_early_loss.data.find(d => d.year === yr);
      const cr = BASELINE_SCENARIOS.conservative_regular.data.find(d => d.year === yr);
      const cel = BASELINE_SCENARIOS.conservative_early_loss.data.find(d => d.year === yr);

      const val = (item: any) => {
        if (!item) return 0;
        const raw = metric === 'cumulative' ? item.cumulativeKt : item.annualKt;
        return (raw / unitDivider).toFixed(2);
      };

      csv += `${yr},${val(br)},${val(bel)},${val(cr)},${val(cel)}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solarloop_waste_forecast_${metric}_${unit}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Hovered item details
  const hoveredIndex = hoveredYear ? years.indexOf(hoveredYear) : null;
  const hoveredBaseRegular = hoveredYear ? BASELINE_SCENARIOS.base_regular.data.find(d => d.year === hoveredYear) : null;
  const hoveredBaseEarly = hoveredYear ? BASELINE_SCENARIOS.base_early_loss.data.find(d => d.year === hoveredYear) : null;
  const hoveredConservative = hoveredYear ? BASELINE_SCENARIOS.conservative_regular.data.find(d => d.year === hoveredYear) : null;
  const hoveredCustom = hoveredYear ? simulationResult.forecast.find(d => d.year === hoveredYear) : null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      {/* Chart Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h3>
          <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
            <span>Deterministic Scenario Projection</span>
            <span aria-hidden="true">·</span>
            <span className="text-teal-700 font-medium">Model v2.4</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Toggle */}
          <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setMetric('cumulative')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                metric === 'cumulative' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cumulative Waste
            </button>
            <button
              type="button"
              onClick={() => setMetric('annual')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                metric === 'annual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual Waste Flow
            </button>
          </div>

          {/* Unit Toggle */}
          <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setUnit('kt')}
              className={`px-2 py-1 text-xs font-mono font-medium rounded transition-colors ${
                unit === 'kt' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              kt
            </button>
            <button
              type="button"
              onClick={() => setUnit('Mt')}
              className={`px-2 py-1 text-xs font-mono font-medium rounded transition-colors ${
                unit === 'Mt' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Mt
            </button>
          </div>

          {/* CSV Export */}
          <button
            type="button"
            onClick={handleExportCSV}
            title="Export forecast data to CSV"
            className="p-1.5 rounded border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scenario Visibility Toggles */}
      {showScenarioComparison && (
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
          <button
            type="button"
            onClick={() => toggleScenario('base_regular')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
              visibleScenarios.base_regular 
                ? 'border-slate-800 bg-slate-900 text-white' 
                : 'border-slate-200 text-slate-500 bg-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Base Regular (25y EoL)</span>
          </button>

          <button
            type="button"
            onClick={() => toggleScenario('base_early_loss')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
              visibleScenarios.base_early_loss 
                ? 'border-teal-700 bg-teal-800 text-white' 
                : 'border-slate-200 text-slate-500 bg-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            <span>Base Early-Loss (Defects & Attrition)</span>
          </button>

          <button
            type="button"
            onClick={() => toggleScenario('conservative_regular')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
              visibleScenarios.conservative_regular 
                ? 'border-sky-700 bg-sky-800 text-white' 
                : 'border-slate-200 text-slate-500 bg-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-sky-300"></span>
            <span>Conservative Regular</span>
          </button>

          {activeScenario === 'custom_scenario' && (
            <button
              type="button"
              onClick={() => toggleScenario('custom')}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-colors ${
                visibleScenarios.custom 
                  ? 'border-amber-600 bg-amber-600 text-white' 
                  : 'border-slate-200 text-slate-500 bg-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-200"></span>
              <span>Scenario Lab Live Simulation</span>
            </button>
          )}
        </div>
      )}

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          onMouseLeave={() => setHoveredYear(null)}
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
            const y = padding.top + innerHeight * (1 - ratio);
            const val = (ratio * maxValKt) / unitDivider;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] font-mono fill-slate-400 tabular-nums"
                >
                  {val.toLocaleString()} {i === 4 ? unitLabel : ''}
                </text>
              </g>
            );
          })}

          {/* Vertical Year Grid & Labels */}
          {years.map((yr, i) => {
            const x = scaleX(yr);
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + innerHeight}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={padding.top + innerHeight + 20}
                  textAnchor="middle"
                  className="text-[11px] font-mono fill-slate-500 font-medium"
                >
                  {yr}
                </text>
              </g>
            );
          })}

          {/* Inflection Milestone Markers */}
          <line
            x1={scaleX(2040)}
            y1={padding.top}
            x2={scaleX(2040)}
            y2={padding.top + innerHeight}
            stroke="#94A3B8"
            strokeDasharray="2 2"
            strokeWidth="1.2"
          />
          <text
            x={scaleX(2040) + 4}
            y={padding.top + 14}
            className="text-[10px] font-mono fill-slate-400 tracking-wider uppercase font-semibold"
          >
            2040 Surge Point
          </text>

          {/* Area fill for Base Early-Loss */}
          {visibleScenarios.base_early_loss && (
            <path
              d={`${generatePath(BASELINE_SCENARIOS.base_early_loss.data)} L ${scaleX(2050)} ${padding.top + innerHeight} L ${scaleX(2025)} ${padding.top + innerHeight} Z`}
              fill="#0D9488"
              fillOpacity="0.08"
            />
          )}

          {/* Base Regular Path */}
          {visibleScenarios.base_regular && (
            <path
              d={generatePath(BASELINE_SCENARIOS.base_regular.data)}
              fill="none"
              stroke="#0F172A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Base Early-Loss Path */}
          {visibleScenarios.base_early_loss && (
            <path
              d={generatePath(BASELINE_SCENARIOS.base_early_loss.data)}
              fill="none"
              stroke="#0F766E"
              strokeWidth="2.5"
              strokeDasharray="6 3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Conservative Regular Path */}
          {visibleScenarios.conservative_regular && (
            <path
              d={generatePath(BASELINE_SCENARIOS.conservative_regular.data)}
              fill="none"
              stroke="#0369A1"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Custom Scenario Lab Path */}
          {visibleScenarios.custom && simulationResult.forecast && (
            <path
              d={generatePath(simulationResult.forecast)}
              fill="none"
              stroke="#D97706"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Hover Crosshair & Trigger Bars */}
          {years.map((yr) => {
            const x = scaleX(yr);
            return (
              <rect
                key={yr}
                x={x - 18}
                y={padding.top}
                width={36}
                height={innerHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredYear(yr)}
              />
            );
          })}

          {/* Active Hover Crosshair Line */}
          {hoveredYear && (
            <g>
              <line
                x1={scaleX(hoveredYear)}
                y1={padding.top}
                x2={scaleX(hoveredYear)}
                y2={padding.top + innerHeight}
                stroke="#0F172A"
                strokeWidth="1"
              />
              <circle
                cx={scaleX(hoveredYear)}
                cy={scaleY(
                  metric === 'cumulative'
                    ? (hoveredBaseRegular?.cumulativeKt || 0)
                    : (hoveredBaseRegular?.annualKt || 0)
                )}
                r="4"
                fill="#0F172A"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              {visibleScenarios.base_early_loss && (
                <circle
                  cx={scaleX(hoveredYear)}
                  cy={scaleY(
                    metric === 'cumulative'
                      ? (hoveredBaseEarly?.cumulativeKt || 0)
                      : (hoveredBaseEarly?.annualKt || 0)
                  )}
                  r="4"
                  fill="#0F766E"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              )}
            </g>
          )}
        </svg>

        {/* Hover Floating Tooltip */}
        {hoveredYear && (
          <div
            className="absolute top-4 pointer-events-none bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs w-64 z-20"
            style={{
              left: Math.min(
                Math.max(scaleX(hoveredYear) - 100, 70),
                width - 250
              )
            }}
          >
            <div className="font-mono text-slate-300 font-bold border-b border-slate-700 pb-1 mb-2 flex justify-between">
              <span>PROJECTION: {hoveredYear}</span>
              <span className="text-teal-400 uppercase">{metric}</span>
            </div>

            <div className="space-y-1.5 font-mono text-[11px] tabular-nums">
              {hoveredBaseRegular && (
                <div className="flex justify-between items-center text-slate-200">
                  <span className="text-slate-400">Base Regular:</span>
                  <span className="font-semibold text-white">
                    {((metric === 'cumulative' ? hoveredBaseRegular.cumulativeKt : hoveredBaseRegular.annualKt) / unitDivider).toLocaleString()}{' '}
                    {unitLabel}
                  </span>
                </div>
              )}

              {hoveredBaseEarly && visibleScenarios.base_early_loss && (
                <div className="flex justify-between items-center text-teal-300">
                  <span className="text-teal-400">Base Early-Loss:</span>
                  <span className="font-semibold text-teal-200">
                    {((metric === 'cumulative' ? hoveredBaseEarly.cumulativeKt : hoveredBaseEarly.annualKt) / unitDivider).toLocaleString()}{' '}
                    {unitLabel}
                  </span>
                </div>
              )}

              {hoveredConservative && visibleScenarios.conservative_regular && (
                <div className="flex justify-between items-center text-sky-300">
                  <span className="text-sky-400">Conservative:</span>
                  <span className="font-semibold text-sky-200">
                    {((metric === 'cumulative' ? hoveredConservative.cumulativeKt : hoveredConservative.annualKt) / unitDivider).toLocaleString()}{' '}
                    {unitLabel}
                  </span>
                </div>
              )}

              {hoveredCustom && visibleScenarios.custom && (
                <div className="flex justify-between items-center text-amber-300 border-t border-slate-700/60 pt-1">
                  <span className="text-amber-400">Custom Sim:</span>
                  <span className="font-semibold text-amber-200">
                    {((metric === 'cumulative' ? hoveredCustom.cumulativeKt : hoveredCustom.annualKt) / unitDivider).toLocaleString()}{' '}
                    {unitLabel}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
              Source: SolarLoop model scenario
            </div>
          </div>
        )}
      </div>

      {/* Baseline Verification Footnote */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>Verified Reference: 2030 = 503 kt (Regular) / 839 kt (Early-Loss) · 2050 = 8,874 kt / 16,768 kt</span>
        </div>
        <div className="text-slate-400 font-sans italic">
          Calculations are closed-form deterministic. Uncertainty preserved.
        </div>
      </div>
    </div>
  );
};
