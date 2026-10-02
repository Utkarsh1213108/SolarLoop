import React from 'react';
import { EconomicModelOutputs } from '../../types';

interface WaterfallChartProps {
  economics: EconomicModelOutputs;
  title?: string;
}

export const WaterfallChart: React.FC<WaterfallChartProps> = ({
  economics,
  title = 'Per-Tonne Recycling Financial Waterfall (₹/tonne)'
}) => {
  // Elements of the waterfall
  // 1. Gross Recovered Material Value (+)
  // 2. EPR Policy Contribution (+)
  // 3. Reverse Logistics & Handling (-)
  // 4. Plant Processing OPEX (-)
  // 5. Feedstock Acquisition (-)
  // 6. Net Processing Margin (=)

  const steps = [
    {
      label: 'Material Value',
      category: 'Inflow',
      value: economics.grossRecoveredValuePerTonneINR,
      isSubtotal: false,
      color: '#0D9488' // Teal
    },
    {
      label: 'EPR Credit',
      category: 'Inflow',
      value: economics.eprContributionPerTonneINR,
      isSubtotal: false,
      color: '#14B8A6'
    },
    {
      label: 'Logistics Freight',
      category: 'Outflow',
      value: -economics.logisticsCostPerTonneINR,
      isSubtotal: false,
      color: '#E11D48' // Rose/Red
    },
    {
      label: 'Processing OPEX',
      category: 'Outflow',
      value: -economics.processingCostPerTonneINR,
      isSubtotal: false,
      color: '#F43F5E'
    },
    {
      label: 'Feedstock Cost',
      category: 'Outflow',
      value: -economics.feedstockCostPerTonneINR,
      isSubtotal: false,
      color: '#FB7185'
    },
    {
      label: 'Net Margin',
      category: 'Total',
      value: economics.netMarginPerTonneINR,
      isSubtotal: true,
      color: economics.netMarginPerTonneINR >= 0 ? '#0F172A' : '#991B1B'
    }
  ];

  // Waterfall geometry math
  const width = 640;
  const height = 260;
  const padding = { top: 25, right: 25, bottom: 40, left: 60 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Track running totals
  let running = 0;
  const bars = steps.map((step) => {
    let startY = running;
    let endY = running;

    if (step.isSubtotal) {
      startY = 0;
      endY = step.value;
    } else {
      endY = running + step.value;
      running = endY;
    }

    return {
      ...step,
      bottom: Math.min(startY, endY),
      top: Math.max(startY, endY),
      val: step.value
    };
  });

  // Scale Y
  const maxVal = Math.max(...bars.map(b => b.top), 18000) * 1.15;
  const minVal = Math.min(...bars.map(b => b.bottom), -2000, 0) * 1.1;

  const scaleY = (val: number) => {
    const range = maxVal - minVal;
    return padding.top + innerHeight - ((val - minVal) / range) * innerHeight;
  };

  const zeroY = scaleY(0);
  const barWidth = Math.floor(innerWidth / steps.length) - 16;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{title}</h3>
          <div className="text-xs text-slate-500 font-mono">
            Unit Margin: <span className={economics.netMarginPerTonneINR >= 0 ? 'text-teal-700 font-semibold' : 'text-rose-700 font-semibold'}>
              ₹{economics.netMarginPerTonneINR.toLocaleString()}/t
            </span> · Break-even feedstock: ₹{economics.breakEvenFeedstockPricePerTonneINR.toLocaleString()}/t
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          {/* Zero baseline */}
          <line
            x1={padding.left}
            y1={zeroY}
            x2={padding.left + innerWidth}
            y2={zeroY}
            stroke="#94A3B8"
            strokeWidth="1.5"
          />

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1.0].map((ratio, i) => {
            const val = minVal + (maxVal - minVal) * ratio;
            const y = scaleY(val);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-slate-400 tabular-nums"
                >
                  ₹{Math.round(val / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {bars.map((bar, i) => {
            const x = padding.left + i * (barWidth + 16) + 8;
            const yTop = scaleY(bar.top);
            const yBottom = scaleY(bar.bottom);
            const barH = Math.max(Math.abs(yBottom - yTop), 2);
            const isNegative = bar.val < 0;

            return (
              <g key={i} className="group">
                <rect
                  x={x}
                  y={yTop}
                  width={barWidth}
                  height={barH}
                  fill={bar.color}
                  rx="3"
                  className="transition-opacity group-hover:opacity-90"
                />
                {/* Numeric value label on top */}
                <text
                  x={x + barWidth / 2}
                  y={isNegative ? yBottom + 13 : yTop - 6}
                  textAnchor="middle"
                  className="text-[10px] font-mono font-semibold fill-slate-700 tabular-nums"
                >
                  {isNegative ? '-' : '+'}₹{Math.abs(bar.val).toLocaleString()}
                </text>

                {/* X-axis label */}
                <text
                  x={x + barWidth / 2}
                  y={padding.top + innerHeight + 18}
                  textAnchor="middle"
                  className="text-[10px] font-sans fill-slate-600 font-medium"
                >
                  {bar.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
        <span>Deterministic Economic Engine v2.4</span>
        <span>Includes ₹{economics.eprContributionPerTonneINR.toLocaleString()}/t EPR take-back incentive</span>
      </div>
    </div>
  );
};
