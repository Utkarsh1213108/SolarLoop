import React, { useState, useMemo } from 'react';
import { useScenario } from '../../context/ScenarioContext';
import { 
  CANONICAL_SCENARIO_MAP, 
  CANONICAL_SCENARIOS_META,
  getCanonicalTimeSeries 
} from '../../data/canonicalLoader';
import { ForecastScenarioId } from '../../types';
import { Download, Eye, EyeOff } from 'lucide-react';

interface TimeSeriesChartProps {
  title?: string;
  metric?: 'cumulative' | 'annual';
  showScenarioComparison?: boolean;
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  title = 'Solar PV Waste Accumulation Trajectory (2026–2050)',
  metric: initialMetric = 'cumulative',
  showScenarioComparison = true
}) => {
  const { unit, setUnit, activeScenario, availableScenarios } = useScenario();
  const [metric, setMetric] = useState<'cumulative' | 'annual'>(initialMetric);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  const [visibleScenarios, setVisibleScenarios] = useState<Record<ForecastScenarioId, boolean>>({
    base_regular: true,
    base_early_loss: true,
    conservative_regular: false,
    conservative_early_loss: false,
    high_regular: false,
    high_early_loss: false
  });

  const toggleScenario = (key: ForecastScenarioId) => {
    setVisibleScenarios(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Canonical years
  const years = useMemo(() => Array.from({ length: 25 }, (_, i) => 2026 + i), []);

  // SVG dimensions
  const width = 840;
  const height = 360;
  const padding = { top: 35, right: 35, bottom: 45, left: 65 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Max value: High·Early reaches 20,118 kt cumulative in 2050; annual peak ~2,100 kt
  const maxValKt = metric === 'cumulative' ? 22000 : 2500;
  const unitDivider = unit === 'Mt' ? 1000 : 1;
  const unitLabel = unit === 'Mt' ? 'Mt' : 'kt';

  const scaleX = (yr: number) => {
    return padding.left + ((yr - 2026) / (2050 - 2026)) * innerWidth;
  };

  const scaleY = (valKt: number) => {
    const clamped = Math.max(0, Math.min(valKt, maxValKt));
    return padding.top + innerHeight - (clamped / maxValKt) * innerHeight;
  };

  // Scenario Series Map
  const scenarioSeries = useMemo(() => {
    const map: Record<ForecastScenarioId, Array<{ year: number; annualKt: number; cumulativeKt: number }>> = {
      base_regular: getCanonicalTimeSeries('base_regular'),
      base_early_loss: getCanonicalTimeSeries('base_early_loss'),
      conservative_regular: getCanonicalTimeSeries('conservative_regular'),
      conservative_early_loss: getCanonicalTimeSeries('conservative_early_loss'),
      high_regular: getCanonicalTimeSeries('high_regular'),
      high_early_loss: getCanonicalTimeSeries('high_early_loss')
    };
    return map;
  }, []);

  const generatePath = (data: Array<{ year: number; annualKt: number; cumulativeKt: number }>) => {
    return data.map((pt, i) => {
      const x = scaleX(pt.year);
      const yVal = metric === 'cumulative' ? pt.cumulativeKt : pt.annualKt;
      const y = scaleY(yVal);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // CSV Export for canonical 6 scenarios
  const handleExportCSV = () => {
    let csv = `Year,Base_Regular_${unitLabel},Base_EarlyLoss_${unitLabel},Conservative_Regular_${unitLabel},Conservative_EarlyLoss_${unitLabel},High_Regular_${unitLabel},High_EarlyLoss_${unitLabel}\n`;
    years.forEach(yr => {
      const val = (id: ForecastScenarioId) => {
        const item = scenarioSeries[id]?.find(d => d.year === yr);
        if (!item) return '0.00';
        const raw = metric === 'cumulative' ? item.cumulativeKt : item.annualKt;
        return (raw / unitDivider).toFixed(2);
      };
      csv += `${yr},${val('base_regular')},${val('base_early_loss')},${val('conservative_regular')},${val('conservative_early_loss')},${val('high_regular')},${val('high_early_loss')}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solarloop_canonical_forecast_${metric}_${unit}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scenarioStyles: Record<ForecastScenarioId, { stroke: string; strokeDasharray?: string; strokeWidth: number; label: string }> = {
    base_regular: { stroke: '#0F172A', strokeWidth: 2.5, label: 'Base · Regular' },
    base_early_loss: { stroke: '#0D9488', strokeWidth: 2.5, strokeDasharray: '6 3', label: 'Base · Early-Loss' },
    conservative_regular: { stroke: '#0284C7', strokeWidth: 2, label: 'Conservative · Regular' },
    conservative_early_loss: { stroke: '#38BDF8', strokeWidth: 2, strokeDasharray: '4 3', label: 'Conservative · Early-Loss' },
    high_regular: { stroke: '#D97706', strokeWidth: 2, label: 'High · Regular' },
    high_early_loss: { stroke: '#F59E0B', strokeWidth: 2, strokeDasharray: '4 3', label: 'High · Early-Loss' }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      {/* Chart Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h3>
          <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
            <span>Canonical IRENA / IEA-PVPS Weibull Model</span>
            <span aria-hidden="true">·</span>
            <span className="text-teal-700 font-medium">solar_waste_model_v2.py (FROZEN)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Cumulative vs Annual Toggle */}
          <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50">
            <button
              type="button"
              onClick={() => setMetric('cumulative')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                metric === 'cumulative'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cumulative
            </button>
            <button
              type="button"
              onClick={() => setMetric('annual')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                metric === 'annual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual Flow
            </button>
          </div>

          {/* Unit Toggle */}
          <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50 font-mono text-xs">
            <button
              type="button"
              onClick={() => setUnit('kt')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                unit === 'kt'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              kt
            </button>
            <button
              type="button"
              onClick={() => setUnit('Mt')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                unit === 'Mt'
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Mt
            </button>
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded border border-slate-200 transition-colors cursor-pointer"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Time Series Plot */}
      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none font-sans"
          onMouseLeave={() => setHoveredYear(null)}
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1.0].map((ratio) => {
            const y = padding.top + innerHeight * (1 - ratio);
            const val = (maxValKt * ratio) / unitDivider;
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-slate-400 tabular-nums"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toLocaleString()} {unitLabel}
                </text>
              </g>
            );
          })}

          {/* Year Vertical Grid Lines */}
          {[2026, 2030, 2035, 2040, 2045, 2050].map((yr) => {
            const x = scaleX(yr);
            return (
              <g key={yr}>
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
                  className={`text-[11px] font-mono ${yr === 2040 ? 'font-bold fill-slate-900' : 'fill-slate-500'}`}
                >
                  {yr}
                </text>
              </g>
            );
          })}

          {/* 2040 Inflection Marker */}
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
            2040 Inflection Point
          </text>

          {/* Active Lines */}
          {(Object.keys(scenarioSeries) as ForecastScenarioId[]).map((scId) => {
            if (!visibleScenarios[scId]) return null;
            const style = scenarioStyles[scId];
            return (
              <path
                key={scId}
                d={generatePath(scenarioSeries[scId])}
                fill="none"
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                strokeDasharray={style.strokeDasharray}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}

          {/* Hover Crosshairs & Hitboxes */}
          {years.map((yr) => {
            const x = scaleX(yr);
            return (
              <rect
                key={yr}
                x={x - 12}
                y={padding.top}
                width={24}
                height={innerHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredYear(yr)}
              />
            );
          })}

          {/* Hover Vertical Guide */}
          {hoveredYear && (
            <line
              x1={scaleX(hoveredYear)}
              y1={padding.top}
              x2={scaleX(hoveredYear)}
              y2={padding.top + innerHeight}
              stroke="#0F172A"
              strokeWidth="1"
            />
          )}
        </svg>

        {/* Floating Tooltip */}
        {hoveredYear && (
          <div
            className="absolute top-4 pointer-events-none bg-slate-900/95 text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs w-72 z-20"
            style={{
              left: Math.min(
                Math.max(scaleX(hoveredYear) - 120, 70),
                width - 300
              )
            }}
          >
            <div className="font-mono text-slate-300 font-bold border-b border-slate-700 pb-1 mb-2 flex justify-between">
              <span>CANONICAL: {hoveredYear}</span>
              <span className="text-teal-400 uppercase font-semibold">{metric}</span>
            </div>

            <div className="space-y-1.5 font-mono text-[11px] tabular-nums">
              {(Object.keys(scenarioSeries) as ForecastScenarioId[]).map((scId) => {
                const item = scenarioSeries[scId]?.find(d => d.year === hoveredYear);
                if (!item) return null;
                const style = scenarioStyles[scId];
                const rawVal = metric === 'cumulative' ? item.cumulativeKt : item.annualKt;
                const formatted = (rawVal / unitDivider).toLocaleString(undefined, { maximumFractionDigits: 1 });
                const isSelected = activeScenario === scId;

                return (
                  <div key={scId} className={`flex justify-between items-center ${isSelected ? 'font-bold text-teal-300' : 'text-slate-300'}`}>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: style.stroke }} />
                      <span>{style.label}:</span>
                    </span>
                    <span>{formatted} {unitLabel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Scenario Toggle Legend for All 6 Scenarios */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Six Canonical Scenarios:
        </span>
        {(Object.keys(scenarioStyles) as ForecastScenarioId[]).map((scId) => {
          const style = scenarioStyles[scId];
          const isVisible = visibleScenarios[scId];

          return (
            <button
              key={scId}
              type="button"
              onClick={() => toggleScenario(scId)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer border ${
                isVisible
                  ? 'bg-slate-50 text-slate-900 border-slate-300 shadow-2xs font-semibold'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-xs inline-block"
                style={{
                  backgroundColor: isVisible ? style.stroke : '#CBD5E1'
                }}
              />
              <span>{style.label}</span>
              {isVisible ? (
                <Eye className="w-3 h-3 text-slate-500 ml-0.5" />
              ) : (
                <EyeOff className="w-3 h-3 text-slate-300 ml-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
