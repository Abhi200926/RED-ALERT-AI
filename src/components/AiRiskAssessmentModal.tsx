import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
  Send,
  CheckCircle2,
  AlertTriangle,
  Users,
  Compass,
  FileText,
  Clock,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { AiEmergencyRiskAssessment } from '../types';
import { RiskAssessmentEngine, EvaluateRiskParams } from '../services/riskAssessmentEngine';
import { AiEmergencyRiskScoreCard } from './AiEmergencyRiskScoreCard';

interface AiRiskAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDispatchSos?: (assessment: AiEmergencyRiskAssessment) => void;
  initialParams?: EvaluateRiskParams;
}

export const AiRiskAssessmentModal: React.FC<AiRiskAssessmentModalProps> = ({
  isOpen,
  onClose,
  onDispatchSos,
  initialParams,
}) => {
  const presets = RiskAssessmentEngine.getPresetScenarios();

  const [disasterType, setDisasterType] = useState<string>(initialParams?.disasterType || 'Flood');
  const [severity, setSeverity] = useState<string>(initialParams?.severity || 'CRITICAL');
  const [peopleAffected, setPeopleAffected] = useState<string>(initialParams?.peopleAffected || 'More than 10');
  const [location, setLocation] = useState<string>(initialParams?.location || 'Riverbank Lowlands, Zone 4');
  const [urgency, setUrgency] = useState<string>(initialParams?.urgency || 'Trapped in rising water');
  const [description, setDescription] = useState<string>(
    initialParams?.description || 'Water has reached roof line. 12 residents trapped including elderly and children.'
  );
  const [availableInfo, setAvailableInfo] = useState<string>(
    initialParams?.availableInfo || 'Hydrological gauge: 4.2m above crest. Power and broadband failed.'
  );

  const [assessment, setAssessment] = useState<AiEmergencyRiskAssessment>(() =>
    RiskAssessmentEngine.calculateDeterministicAssessment({
      disasterType: initialParams?.disasterType || 'Flood',
      severity: initialParams?.severity || 'CRITICAL',
      peopleAffected: initialParams?.peopleAffected || 'More than 10',
      location: initialParams?.location || 'Riverbank Lowlands, Zone 4',
      urgency: initialParams?.urgency || 'Trapped in rising water',
      description:
        initialParams?.description || 'Water has reached roof line. 12 residents trapped including elderly and children.',
      availableInfo:
        initialParams?.availableInfo || 'Hydrological gauge: 4.2m above crest. Power and broadband failed.',
    })
  );

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [activePresetIndex, setActivePresetIndex] = useState<number | null>(0);

  // Recalculate deterministic score in real-time when inputs change
  useEffect(() => {
    const updated = RiskAssessmentEngine.calculateDeterministicAssessment({
      disasterType,
      severity,
      peopleAffected,
      location,
      urgency,
      description,
      availableInfo,
    });
    setAssessment(updated);
  }, [disasterType, severity, peopleAffected, location, urgency, description, availableInfo]);

  if (!isOpen) return null;

  const handleApplyPreset = (index: number) => {
    const preset = presets[index];
    setActivePresetIndex(index);
    setDisasterType(preset.params.disasterType || 'Flood');
    setSeverity(preset.params.severity || 'CRITICAL');
    setPeopleAffected(preset.params.peopleAffected || '1');
    setLocation(preset.params.location || '');
    setUrgency(preset.params.urgency || '');
    setDescription(preset.params.description || '');
    setAvailableInfo(preset.params.availableInfo || '');
  };

  const handleRunAiEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const result = await RiskAssessmentEngine.evaluateRiskAssessment({
        disasterType,
        severity,
        peopleAffected,
        location,
        urgency,
        description,
        availableInfo,
      });
      setAssessment(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div
      id="ai-risk-assessment-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  AI Emergency Risk Assessment Simulator
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                  Judge Feature
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-factor hazard analysis synthesizing severity, exposed population, and extraction constraints.
              </p>
            </div>
          </div>
          <button
            id="close-ai-risk-modal"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Benchmark Scenarios Ribbon */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto flex items-center space-x-2 scrollbar-thin">
          <span className="text-[11px] font-semibold text-slate-400 uppercase shrink-0 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-rose-400" />
            Benchmark Scenarios:
          </span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(idx)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                activePresetIndex === idx
                  ? 'bg-rose-500/20 border-rose-500 text-rose-200 shadow-sm'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <span>{p.name}</span>
              <span className="ml-1.5 text-[10px] opacity-80 font-mono">[{p.tag}]</span>
            </button>
          ))}
        </div>

        {/* Modal Body: 2-Column Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Input Form (5 cols) */}
          <div className="lg:col-span-5 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-rose-400" />
                Emergency Incident Parameters
              </h4>
              <span className="text-[10px] text-slate-400">Reactive Triage</span>
            </div>

            {/* Disaster Type & Severity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Disaster Type
                </label>
                <select
                  value={disasterType}
                  onChange={(e) => {
                    setDisasterType(e.target.value);
                    setActivePresetIndex(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                >
                  <option value="Flood">Flood / Flash Surge</option>
                  <option value="Wildfire">Wildfire / Crown Fire</option>
                  <option value="Cyclone">Cyclone / Hurricane</option>
                  <option value="Earthquake">Earthquake Tremor</option>
                  <option value="Landslide">Landslide / Mudflow</option>
                  <option value="Tsunami">Tsunami Wave</option>
                  <option value="Heavy Rain">Heavy Rain Runoff</option>
                  <option value="Extreme Heat">Extreme Heat Advisory</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => {
                    setSeverity(e.target.value);
                    setActivePresetIndex(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500 font-semibold"
                >
                  <option value="CRITICAL" className="text-rose-400 font-bold">
                    CRITICAL
                  </option>
                  <option value="WARNING" className="text-orange-400 font-bold">
                    WARNING
                  </option>
                  <option value="WATCH" className="text-amber-400 font-bold">
                    WATCH
                  </option>
                  <option value="SAFE" className="text-emerald-400 font-bold">
                    SAFE / ADVISORY
                  </option>
                </select>
              </div>
            </div>

            {/* People Affected & Urgency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3 text-rose-400" />
                  People Affected
                </label>
                <select
                  value={peopleAffected}
                  onChange={(e) => {
                    setPeopleAffected(e.target.value);
                    setActivePresetIndex(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                >
                  <option value="1">1 Person</option>
                  <option value="2–5">2–5 People</option>
                  <option value="6–10">6–10 People</option>
                  <option value="More than 10">More than 10 People (Mass Hazard)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  Urgency / Condition
                </label>
                <select
                  value={urgency}
                  onChange={(e) => {
                    setUrgency(e.target.value);
                    setActivePresetIndex(null);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
                >
                  <option value="Trapped in rising water">Trapped in rising water</option>
                  <option value="Trapped inside damaged building">Trapped inside damaged building</option>
                  <option value="Injured needing medical evacuation">Injured / Acute Trauma</option>
                  <option value="Road blocked by fallen timber & flames">Road blocked by flames / debris</option>
                  <option value="Need evacuation">Standard Evacuation Need</option>
                  <option value="Need precautionary guidance">Precautionary Standby</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Compass className="w-3 h-3 text-cyan-400" />
                Incident Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setActivePresetIndex(null);
                }}
                placeholder="e.g. Riverbank Lowlands, Zone 4"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-emerald-400" />
                Emergency Description / Survivor Message
              </label>
              <textarea
                value={description}
                rows={2}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setActivePresetIndex(null);
                }}
                placeholder="Describe current status, waterline, trapped residents..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500 resize-none"
              />
            </div>

            {/* Available Emergency Information */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-blue-400" />
                Available Telemetry & Official Warnings
              </label>
              <input
                type="text"
                value={availableInfo}
                onChange={(e) => {
                  setAvailableInfo(e.target.value);
                  setActivePresetIndex(null);
                }}
                placeholder="e.g. Hydrological gauge crest +4.2m; power offline"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center gap-2">
              <button
                id="run-ai-eval-btn"
                onClick={handleRunAiEvaluation}
                disabled={isEvaluating}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-900/40 flex items-center justify-center space-x-2 transition-all"
              >
                <Sparkles className={`w-4 h-4 ${isEvaluating ? 'animate-spin' : ''}`} />
                <span>{isEvaluating ? 'Evaluating with Gemini...' : 'Analyze with Gemini 3.8 Flash'}</span>
              </button>

              <button
                onClick={() => handleApplyPreset(0)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
                title="Reset to Benchmark Preset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: AI Output Card (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Live AI Risk Assessment Result
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">
                Model: {assessment.model}
              </span>
            </div>

            <AiEmergencyRiskScoreCard
              assessment={assessment}
              onRefresh={handleRunAiEvaluation}
              isRefreshing={isEvaluating}
            />

            {/* Optional Dispatch to CAD Button */}
            {onDispatchSos && (
              <button
                onClick={() => {
                  onDispatchSos(assessment);
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <Send className="w-4 h-4 text-rose-400" />
                <span>Inject Assessment Into Rescue CAD Operations Hub</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
