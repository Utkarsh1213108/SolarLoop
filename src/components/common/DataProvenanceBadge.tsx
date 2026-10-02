import React from 'react';
import { ProvenanceTier } from '../../types';
import { useScenario } from '../../context/ScenarioContext';
import { Info } from 'lucide-react';

interface DataProvenanceBadgeProps {
  tier: ProvenanceTier;
  sourceText?: string;
  className?: string;
  showIcon?: boolean;
}

export const DataProvenanceBadge: React.FC<DataProvenanceBadgeProps> = ({
  tier,
  sourceText,
  className = '',
  showIcon = true
}) => {
  const { setIsMethodologyOpen } = useScenario();

  // Clean unboxed metadata discipline with subtle color accents and hover affordance
  const getStyles = () => {
    switch (tier) {
      case 'VERIFIED SOURCE':
        return 'text-emerald-700 hover:text-emerald-800';
      case 'MODEL OUTPUT':
        return 'text-teal-700 hover:text-teal-800';
      case 'USER ASSUMPTION':
        return 'text-amber-700 hover:text-amber-800';
      case 'SCENARIO OUTPUT':
        return 'text-sky-700 hover:text-sky-800';
      case 'DEMO SCENARIO':
      case 'DEMO DATA':
        return 'text-rose-700 hover:text-rose-800';
      default:
        return 'text-slate-600 hover:text-slate-800';
    }
  };

  return (
    <button
      type="button"
      onClick={() => setIsMethodologyOpen(true)}
      title="Click to view methodology & source provenance"
      className={`inline-flex items-center gap-1.5 text-xs font-mono tracking-tight transition-colors cursor-pointer group ${getStyles()} ${className}`}
    >
      {showIcon && <Info className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 shrink-0" />}
      <span className="font-semibold uppercase tracking-wider">{tier}</span>
      {sourceText && (
        <>
          <span className="text-slate-400" aria-hidden="true">·</span>
          <span className="text-slate-600 font-sans truncate max-w-[280px]">{sourceText}</span>
        </>
      )}
    </button>
  );
};
