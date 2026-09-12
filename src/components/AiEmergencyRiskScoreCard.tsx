import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  Users,
  Activity,
  Compass,
  FileText,
  Clock,
  CheckCircle2,
  Cpu,
  Layers,
  Zap,
} from 'lucide-react';
import { AiEmergencyRiskAssessment, RiskClassification } from '../types';

interface AiEmergencyRiskScoreCardProps {
  assessment: AiEmergencyRiskAssessment;
  compact?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AiEmergencyRiskScoreCard: React.FC<AiEmergencyRiskScoreCardProps> = ({
  assessment,
  compact = false,
  onRefresh,
  isRefreshing = false,
}) => {
  const getTheme = (level: RiskClassification) => {
    switch (level) {
      case 'CRITICAL':
        return {
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          gradient: 'from-rose-500 via-red-600 to-amber-600',
          accent: 'text-rose-400',
          border: 'border-rose-500/30',
          bgGlow: 'bg-rose-950/40',
          progressColor: 'bg-rose-500',
          ringColor: '#f43f5e',
        };
      case 'HIGH':
        return {
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          gradient: 'from-orange-500 via-amber-500 to-yellow-500',
          accent: 'text-orange-400',
          border: 'border-orange-500/30',
          bgGlow: 'bg-orange-950/30',
          progressColor: 'bg-orange-500',
          ringColor: '#f97316',
        };
      case 'MODERATE':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          gradient: 'from-amber-400 to-yellow-500',
          accent: 'text-amber-400',
          border: 'border-amber-500/30',
          bgGlow: 'bg-amber-950/20',
          progressColor: 'bg-amber-400',
          ringColor: '#fbbf24',
        };
      case 'LOW':
      default:
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          gradient: 'from-emerald-400 to-teal-500',
          accent: 'text-emerald-400',
          border: 'border-emerald-500/30',
          bgGlow: 'bg-emerald-950/20',
          progressColor: 'bg-emerald-400',
          ringColor: '#34d399',
        };
    }
  };

  const theme = getTheme(assessment.priorityLevel);
  const strokeDashoffset = 283 - (283 * assessment.riskScore) / 100;

  return (
    <div
      id={`ai-risk-card-${assessment.riskScore}`}
      className={`relative rounded-2xl border ${theme.border} ${theme.bgGlow} backdrop-blur-md overflow-hidden transition-all duration-300 shadow-xl`}
    >
      {/* Simulation Watermark Ribbon */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px]">
        <div className="flex items-center space-x-2 text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="font-semibold tracking-wide uppercase text-slate-200">
            AI Emergency Risk Assessment
          </span>
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 text-[10px]">
            {assessment.model || 'Gemini 3.8 Flash'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30">
            Simulated Assessment (Demo)
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Recalculate Risk Score"
            >
              <Zap className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Top Metric Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-5 border-b border-slate-800/80">
          {/* Radial Score Gauge */}
          <div className="flex items-center space-x-5">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={theme.ringColor}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="283"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {assessment.riskScore}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  / 100
                </span>
              </div>
            </div>

            <div className="space-y-2 text-left">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Priority Level
                </span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-black uppercase rounded-md tracking-wider border ${theme.badge}`}
                >
                  {assessment.priorityLevel}
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert className={`w-5 h-5 ${theme.accent}`} />
                {assessment.priorityLevel === 'CRITICAL' && 'Critical Life Threat & Rescue Priority'}
                {assessment.priorityLevel === 'HIGH' && 'Elevated Urgency — Expedited Triage'}
                {assessment.priorityLevel === 'MODERATE' && 'Moderate Operational Hazard'}
                {assessment.priorityLevel === 'LOW' && 'Low Risk / Precautionary Monitoring'}
              </h4>
              <p className="text-xs text-slate-400 flex items-center gap-3">
                <span>Calc: {assessment.calculatedAt || 'Just now'}</span>
                <span>•</span>
                <span className="text-slate-300 font-medium">
                  {assessment.location} ({assessment.disasterType})
                </span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 w-full sm:w-auto">
            <div className="px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-left">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-rose-400" />
                People Affected
              </div>
              <div className="text-sm font-bold text-slate-200 mt-0.5">
                {assessment.peopleAffected || '1 person'}
              </div>
            </div>
            <div className="px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800 text-left">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-400" />
                Urgency Status
              </div>
              <div className="text-sm font-bold text-slate-200 mt-0.5 truncate max-w-[140px]">
                {assessment.urgency || 'Standard'}
              </div>
            </div>
          </div>
        </div>

        {/* Short AI Explanation (Formatted cleanly as required) */}
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              AI Risk Explanation
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Triage Engine v3.8</span>
          </div>
          <p className="text-sm font-medium text-slate-100 leading-relaxed font-mono bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
            {assessment.explanation}
          </p>
        </div>

        {/* Main Factors Influencing the Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              Main Factors Influencing Score
            </h5>
            <span className="text-[10px] text-slate-400">Weighted Multi-Hazard Matrix</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {assessment.mainFactors.map((factor, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    {idx === 0 && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                    {idx === 1 && <Users className="w-3.5 h-3.5 text-rose-400" />}
                    {idx === 2 && <Compass className="w-3.5 h-3.5 text-cyan-400" />}
                    {idx === 3 && <FileText className="w-3.5 h-3.5 text-emerald-400" />}
                    {factor.factor}
                  </span>
                  <span className="text-xs font-bold font-mono text-slate-300 bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700">
                    {factor.weight}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      factor.impact === 'critical'
                        ? 'bg-rose-500'
                        : factor.impact === 'high'
                        ? 'bg-orange-500'
                        : factor.impact === 'moderate'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(10, factor.score))}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {factor.details}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Response Priority */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className={`w-4 h-4 ${theme.accent}`} />
              Recommended Response Priority
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
              Operational Directive
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            {assessment.recommendedResponsePriority}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2">
          <span className="font-semibold text-slate-300">Judges Notice:</span>
          <span>
            This is a simulated AI assessment for CAD demonstration, not an operational prediction system.
          </span>
        </div>
      </div>
    </div>
  );
};
