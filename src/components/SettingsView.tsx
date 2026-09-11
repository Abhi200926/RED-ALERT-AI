import React, { useState } from 'react';
import { UserSettings, AlertSeverity } from '../types';
import { playEmergencyAlertSound, playSafetyChime } from '../utils/audio';
import { requestNotificationPermission } from '../utils/notifications';
import {
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  Bell,
  MapPin,
  Shield,
  RotateCcw,
  Check,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetToDefaults: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetToDefaults,
}) => {
  const [testSoundPlaying, setTestSoundPlaying] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<string>(
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [saveToast, setSaveToast] = useState(false);

  const triggerSoundTest = () => {
    setTestSoundPlaying(true);
    playEmergencyAlertSound(1800);
    setTimeout(() => {
      setTestSoundPlaying(false);
    }, 1900);
  };

  const triggerChimeTest = () => {
    playSafetyChime();
  };

  const handleNotificationRequest = async () => {
    const res = await requestNotificationPermission();
    setNotificationStatus(res);
    onUpdateSettings({ notificationsEnabled: res === 'granted' });
  };

  const notifySave = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <div id="settings-view" className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-rose-500" />
          <div>
            <h1 className="font-tech text-2xl font-bold uppercase tracking-wider text-white">
              System Configuration & Preferences
            </h1>
            <p className="text-xs text-slate-400">
              Customize alerting thresholds, broadcast audio, and device integration
            </p>
          </div>
        </div>

        {saveToast && (
          <span className="text-xs font-mono-num font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-lg flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            Preferences Saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Audio Alert Preferences */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-rose-400" />
              <h2 className="font-tech text-base font-bold text-white uppercase tracking-wider">
                Emergency Audio Alarm
              </h2>
            </div>
            <button
              id="sound-toggle-switch"
              onClick={() => {
                onUpdateSettings({ soundEnabled: !settings.soundEnabled });
                notifySave();
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.soundEnabled ? 'bg-rose-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Plays a synthesized dual-tone EAS emergency broadcast chime (853Hz & 960Hz) whenever a CRITICAL RED ALERT is triggered.
          </p>

          <div className="pt-2 flex flex-wrap gap-2">
            <button
              id="test-emergency-siren-btn"
              onClick={triggerSoundTest}
              disabled={testSoundPlaying}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-rose-400 border border-slate-700 transition-all disabled:opacity-50"
            >
              {testSoundPlaying ? 'Playing Alarm...' : 'Test Emergency Siren'}
            </button>
            <button
              id="test-safety-chime-btn"
              onClick={triggerChimeTest}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-400 border border-slate-700 transition-all"
            >
              Test Safety Chime
            </button>
          </div>
        </div>

        {/* Browser Push Notifications */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-rose-400" />
              <h2 className="font-tech text-base font-bold text-white uppercase tracking-wider">
                System Notifications
              </h2>
            </div>
            <span
              className={`text-[10px] font-mono-num font-bold px-2 py-0.5 rounded-full ${
                notificationStatus === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {notificationStatus.toUpperCase()}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Send immediate desktop/mobile push banners when high-severity hazards cross your threshold radius.
          </p>

          <div className="pt-2">
            <button
              id="request-push-perm-btn"
              onClick={handleNotificationRequest}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold tracking-wide transition-all shadow-md shadow-rose-600/30"
            >
              Request Browser Notification Access
            </button>
          </div>
        </div>

        {/* Severity Notification Threshold */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-rose-400" />
            <h2 className="font-tech text-base font-bold text-white uppercase tracking-wider">
              Alert Severity Sensitivity Threshold
            </h2>
          </div>

          <p className="text-xs text-slate-400">
            Select the minimum hazard severity level required to pop up emergency full-screen overlays:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {(['SAFE', 'WATCH', 'WARNING', 'CRITICAL'] as AlertSeverity[]).map((level) => {
              const isSelected = settings.severityThreshold === level;
              return (
                <button
                  key={level}
                  id={`threshold-${level.toLowerCase()}`}
                  onClick={() => {
                    onUpdateSettings({ severityThreshold: level });
                    notifySave();
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-rose-950/40 border-rose-500 text-rose-300 ring-1 ring-rose-500/50'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <span className="font-tech text-xs font-bold block">{level}</span>
                  <span className="text-[10px] text-slate-400">
                    {level === 'CRITICAL'
                      ? 'Life-threatening hazards only'
                      : level === 'WARNING'
                      ? 'Severe warnings & above'
                      : level === 'WATCH'
                      ? 'Watches, advisories & alerts'
                      : 'All event notifications'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Persistence & Local Storage State */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-rose-400" />
            <h2 className="font-tech text-base font-bold text-white uppercase tracking-wider">
              System Reset & Storage
            </h2>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            User preferences (selected location, audio alerts, and thresholds) are stored locally in your browser storage.
          </p>

          <div className="pt-2">
            <button
              id="restore-defaults-btn"
              onClick={() => {
                onResetToDefaults();
                notifySave();
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold tracking-wide border border-slate-700 transition-all"
            >
              Restore Factory Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
