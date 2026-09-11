import React from 'react';
import { AlertSeverity } from '../types';
import { ShieldCheck, AlertCircle, AlertTriangle, Flame } from 'lucide-react';

interface AlertLevelBadgeProps {
  severity: AlertSeverity;
  size?: 'sm' | 'md' | 'lg';
  showPulse?: boolean;
}

export const AlertLevelBadge: React.FC<AlertLevelBadgeProps> = ({
  severity,
  size = 'md',
  showPulse = false,
}) => {
  const config = {
    SAFE: {
      label: 'GREEN — Normal',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/15',
      borderColor: 'border-emerald-500/40',
      dotColor: 'bg-emerald-400',
      icon: ShieldCheck,
    },
    WATCH: {
      label: 'YELLOW — Watch',
      textColor: 'text-yellow-300',
      bgColor: 'bg-yellow-500/15',
      borderColor: 'border-yellow-500/40',
      dotColor: 'bg-yellow-400',
      icon: AlertCircle,
    },
    WARNING: {
      label: 'ORANGE — Danger',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
      borderColor: 'border-amber-500/50',
      dotColor: 'bg-amber-400',
      icon: AlertTriangle,
    },
    CRITICAL: {
      label: 'RED — Emergency',
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-500/25',
      borderColor: 'border-rose-500/60',
      dotColor: 'bg-rose-500',
      icon: Flame,
    },
  }[severity] || {
    label: severity,
    textColor: 'text-slate-300',
    bgColor: 'bg-slate-800',
    borderColor: 'border-slate-700',
    dotColor: 'bg-slate-400',
    icon: ShieldCheck,
  };

  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-3 py-1 gap-2 font-semibold tracking-wider',
    lg: 'text-sm px-4 py-1.5 gap-2.5 font-bold tracking-widest',
  }[size];

  return (
    <span
      id={`badge-${severity.toLowerCase()}`}
      className={`inline-flex items-center rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses} uppercase font-tech transition-all shadow-sm`}
    >
      <span className="relative flex h-2 w-2">
        {showPulse && severity === 'CRITICAL' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
      </span>
      <IconComponent className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};
