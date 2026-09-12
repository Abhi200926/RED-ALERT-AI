import React, { useState } from 'react';
import { Alert, AiEmergencyRiskAssessment } from '../types';
import { Sparkles, RefreshCw, CheckCircle, ShieldAlert, Cpu, AlertCircle, Activity } from 'lucide-react';
import { RiskAssessmentEngine } from '../services/riskAssessmentEngine';
import { AiEmergencyRiskScoreCard } from './AiEmergencyRiskScoreCard';

interface AiRiskAnalysisProps {
  alert: Alert;
  onAnalysisUpdated?: (updatedAnalysis: Alert['aiAnalysis']) => void;
}

export const AiRiskAnalysis: React.FC<AiRiskAnalysisProps> = ({
  alert,
  onAnalysisUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(alert.aiAnalysis);
  const [analysisSource, setAnalysisSource] = useState<string>('Server-Side AI Engine');

  const [riskAssessment, setRiskAssessment] = useState<AiEmergencyRiskAssessment>(() => {
    if (alert.riskAssessment) return alert.riskAssessment;
    return RiskAssessmentEngine.calculateDeterministicAssessment({
      disasterType: alert.disasterType,
      severity: alert.severity,
      peopleAffected: alert.severity === 'CRITICAL' ? 'More than 10' : '2–5',
      location: alert.location,
      urgency: alert.severity === 'CRITICAL' ? 'Trapped in rising water' : 'Need evacuation',
      description: alert.description,
      availableInfo: alert.officialWarning,
    });
  });

  // Keep state updated if alert changes
  React.useEffect(() => {
    setCurrentAnalysis(alert.aiAnalysis);
    if (alert.riskAssessment) {
      setRiskAssessment(alert.riskAssessment);
    } else {
      setRiskAssessment(
        RiskAssessmentEngine.calculateDeterministicAssessment({
          disasterType: alert.disasterType,
          severity: alert.severity,
          peopleAffected: alert.severity === 'CRITICAL' ? 'More than 10' : '2–5',
          location: alert.location,
          urgency: alert.severity === 'CRITICAL' ? 'Trapped in rising water' : 'Need evacuation',
          description: alert.description,
          availableInfo: alert.officialWarning,
        })
      );
    }
  }, [alert]);

  const handleReanalyze = async () => {
    setLoading(true);
    try {
      const [aiResponse, assessmentResult] = await Promise.allSettled([
        fetch('/api/analyze-risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            disasterType: alert.disasterType,
            severity: alert.severity,
            location: alert.location,
            parameters: alert.parameters,
            officialWarning: alert.officialWarning,
            isDemo: alert.isDemo,
          }),
        }),
        RiskAssessmentEngine.evaluateRiskAssessment({
          disasterType: alert.disasterType,
          severity: alert.severity,
          peopleAffected: alert.severity === 'CRITICAL' ? 'More than 10' : '2–5',
          location: alert.location,
          urgency: alert.severity === 'CRITICAL' ? 'Trapped in rising water' : 'Need evacuation',
          description: alert.description,
          availableInfo: alert.officialWarning,
        }),
      ]);

      if (aiResponse.status === 'fulfilled' && aiResponse.value.ok) {
        const data = await aiResponse.value.json();
        const newAnalysis = {
          explanation: data.explanation,
          safetyActions: data.safetyActions || [],
          confidenceIndicator: data.confidenceIndicator || 'High',
          disclaimer: data.disclaimer || 'Adhere strictly to official civil defense instructions.',
        };
        setCurrentAnalysis(newAnalysis);
        setAnalysisSource(data.source || 'Gemini 3.8 Flash');
        if (onAnalysisUpdated) {
          onAnalysisUpdated(newAnalysis);
        }
      }

      if (assessmentResult.status === 'fulfilled') {
        setRiskAssessment(assessmentResult.value);
      }
    } catch (err) {
      console.warn('AI risk re-analysis call failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const isCritical = alert.severity === 'CRITICAL';
  const isWarning = alert.severity === 'WARNING';

  return (
    <div
      id="ai-risk-analysis-card"
      className="space-y-6"
    >
      {/* Prominent AI Emergency Risk Assessment (Score 0-100, Priority, Explanation, Factors) */}
      <AiEmergencyRiskScoreCard
        assessment={riskAssessment}
        onRefresh={handleReanalyze}
        isRefreshing={loading}
      />

      {/* Structured Telemetry & Safety Actions Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-md space-y-4">
        {/* Header with AI badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-tech uppercase tracking-wider text-white">
                  Telemetry Assessment & Safety Directive
                </h3>
                <span className="text-[10px] uppercase font-mono-num font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-rose-300 border border-rose-500/30">
                  {analysisSource}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Correlated multi-sensor metrics evaluated against civil defense safety thresholds
              </p>
            </div>
          </div>

          <button
            id="reanalyze-gemini-btn"
            onClick={handleReanalyze}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700/70 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-rose-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Evaluating...' : 'Re-Evaluate Telemetry'}</span>
          </button>
        </div>

        {/* Structured Telemetry Input Table */}
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-tech block mb-2">
            Structured Sensor Inputs (Evaluated Telemetry)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] uppercase font-mono-num text-slate-400 block">Disaster Type</span>
              <span className="text-xs font-semibold text-slate-100">{alert.disasterType}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] uppercase font-mono-num text-slate-400 block">Official Warning</span>
              <span className="text-xs font-semibold text-slate-100 truncate block" title={alert.officialWarning}>
                {alert.officialWarning}
              </span>
            </div>

            {Object.entries(alert.parameters).slice(0, 2).map(([key, val]) => (
              <div key={key} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[10px] uppercase font-mono-num text-slate-400 block truncate" title={key}>
                  {key}
                </span>
                <span className="text-xs font-semibold text-rose-300 truncate block" title={String(val)}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Immediate Practical Actions Generated */}
        {currentAnalysis?.safetyActions && currentAnalysis.safetyActions.length > 0 && (
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-tech block mb-2">
              Priority Action Checklist (AI Recommended)
            </span>
            <div className="space-y-2">
              {currentAnalysis.safetyActions.map((action, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200"
                >
                  <CheckCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{action}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Crucial Safety Protocol Boundary Notice */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 text-[11px] text-slate-400">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <div className="leading-relaxed">
            <span className="font-semibold text-slate-300">Safety Notice: </span>
            AI interpretations distinguish verified facts from modeled estimates. Never speculate; always comply with directives from local emergency response agencies.
          </div>
        </div>
      </div>
    </div>
  );
};
