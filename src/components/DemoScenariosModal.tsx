import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  Radio,
  Satellite,
  LifeBuoy,
  Truck,
  RotateCcw,
  X,
  ChevronRight,
  Info,
} from 'lucide-react';
import { globalMultiChannelManager, PROTOTYPE_DISCLAIMER } from '../services/communicationService';

interface DemoScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerSosModal: () => void;
  onSwitchToDashboard: () => void;
  onSwitchToAlerts: () => void;
}

export const DemoScenariosModal: React.FC<DemoScenariosModalProps> = ({
  isOpen,
  onClose,
  onTriggerSosModal,
  onSwitchToDashboard,
  onSwitchToAlerts,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  if (!isOpen) return null;

  const handleStep1 = () => {
    // Step 1: Trigger Heavy Rain alert view
    setCurrentStep(1);
    onSwitchToAlerts();
  };

  const handleStep2 = () => {
    // Step 2: Storm intensifies, simulate broadband collapse
    setCurrentStep(2);
    globalMultiChannelManager.setChannelOverride('INTERNET', false);
    globalMultiChannelManager.setChannelOverride('CELLULAR', false);
    globalMultiChannelManager.setChannelOverride('SMS', true);
  };

  const handleStep3 = () => {
    // Step 3: Open SOS Modal with Heavy Rain pre-selected
    setCurrentStep(3);
    onClose();
    onTriggerSosModal();
  };

  const handleStep4 = () => {
    // Step 4: Open Rescue Command Center
    setCurrentStep(4);
    onClose();
    onSwitchToDashboard();
  };

  const handleResetScenario = () => {
    globalMultiChannelManager.setChannelOverride('INTERNET', true);
    globalMultiChannelManager.setChannelOverride('CELLULAR', true);
    globalMultiChannelManager.setChannelOverride('SMS', true);
    globalMultiChannelManager.setChannelOverride('SATELLITE', false);
    globalMultiChannelManager.setChannelOverride('RELAY', false);
    setCurrentStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <Play className="w-5 h-5 fill-rose-500" />
            </div>
            <div>
              <h2 className="font-tech text-base font-bold uppercase tracking-wider text-white">
                Demonstration Walkthroughs
              </h2>
              <p className="text-xs text-slate-400">
                Simulate disaster escalation and multi-channel rescue failover
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <strong className="text-white block mb-1">Scenario: Rain / Flood Outage Walkthrough</strong>
            During cloudbursts and flooding, Wi-Fi lines disconnect and cellular towers suffer power loss. This guided flow demonstrates how RED ALERT AI adapts gracefully across channels without losing distress calls.
          </div>

          {/* Stepper */}
          <div className="space-y-3">
            {/* Step 1 */}
            <div
              className={`p-3.5 rounded-xl border transition ${
                currentStep === 1
                  ? 'bg-rose-950/30 border-rose-500/60'
                  : currentStep > 1
                  ? 'bg-slate-950/60 border-emerald-500/40'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      currentStep > 1
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {currentStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs">
                      1. Natural Disaster Alert Warning
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Citizen receives early warning for Heavy Rain & Flash Flooding with AI telemetry assessment and safety instructions.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleStep1}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0"
                >
                  View Alert
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div
              className={`p-3.5 rounded-xl border transition ${
                currentStep === 2
                  ? 'bg-rose-950/30 border-rose-500/60'
                  : currentStep > 2
                  ? 'bg-slate-950/60 border-emerald-500/40'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      currentStep > 2
                        ? 'bg-emerald-500 text-slate-950'
                        : currentStep === 2
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {currentStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs flex items-center gap-1.5">
                      <span>2. Infrastructure Fails (Simulate Outage)</span>
                      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Cut Internet and Cellular data towers. The system detects outage and activates the SMS Fallback signaling channel.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleStep2}
                  className="px-2.5 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 text-xs font-semibold shrink-0"
                >
                  Trigger Outage
                </button>
              </div>
            </div>

            {/* Step 3 */}
            <div
              className={`p-3.5 rounded-xl border transition ${
                currentStep === 3
                  ? 'bg-rose-950/30 border-rose-500/60'
                  : currentStep > 3
                  ? 'bg-slate-950/60 border-emerald-500/40'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      currentStep > 3
                        ? 'bg-emerald-500 text-slate-950'
                        : currentStep === 3
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {currentStep > 3 ? <CheckCircle2 className="w-4 h-4" /> : '3'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs flex items-center gap-1.5">
                      <span>3. Transmit Distress Beacon</span>
                      <LifeBuoy className="w-3.5 h-3.5 text-rose-400" />
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Open "I NEED RESCUE" with GPS coordinates, people count, and situation. System transmits through the fallback channel.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleStep3}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shrink-0"
                >
                  Send SOS
                </button>
              </div>
            </div>

            {/* Step 4 */}
            <div
              className={`p-3.5 rounded-xl border transition ${
                currentStep === 4
                  ? 'bg-rose-950/30 border-rose-500/60'
                  : 'bg-slate-950/40 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      currentStep === 4 ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs flex items-center gap-1.5">
                      <span>4. Rescue Command Hub & AI Dispatch</span>
                      <Truck className="w-3.5 h-3.5 text-cyan-400" />
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Responders receive the distress beacon, verify the communication channel used, review AI priority analysis, and assign a rescue unit.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleStep4}
                  className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shrink-0"
                >
                  View Hub
                </button>
              </div>
            </div>
          </div>

          {/* Prototype Disclaimer */}
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{PROTOTYPE_DISCLAIMER}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleResetScenario}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
