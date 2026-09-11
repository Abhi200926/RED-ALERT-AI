import React, { useState, useEffect } from 'react';
import { Alert, DisasterType, UserSettings, TimelineEvent, EmergencyRequest, SosStatus } from './types';
import {
  SAFE_ALERT,
  INITIAL_TIMELINE_EVENTS,
  HISTORICAL_ALERTS,
  generateSimulatedAlert,
  PRESET_LOCATIONS,
} from './data/mockDisasters';
import { playEmergencyAlertSound, playSafetyChime } from './utils/audio';
import { sendBrowserNotification } from './utils/notifications';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { CurrentSafetyStatus } from './components/CurrentSafetyStatus';
import { LocationCard } from './components/LocationCard';
import { DisasterGrid } from './components/DisasterGrid';
import { Timeline } from './components/Timeline';
import { InteractiveMap } from './components/InteractiveMap';
import { AiRiskAnalysis } from './components/AiRiskAnalysis';
import { DemoModeBar } from './components/DemoModeBar';
import { RedAlertOverlay } from './components/RedAlertOverlay';
import { SafetyCenterView } from './components/SafetyCenterView';
import { AlertHistoryView } from './components/AlertHistoryView';
import { SettingsView } from './components/SettingsView';
import { AboutView } from './components/AboutView';
import { RedAlertAssistant } from './components/RedAlertAssistant';
import { SosButtonCard } from './components/SosButtonCard';
import { SosModal } from './components/SosModal';
import { RescueDashboardView } from './components/RescueDashboardView';
import { NetworkStatusIndicatorBar } from './components/NetworkStatusIndicatorBar';
import { WorldwideEmergencyBar } from './components/WorldwideEmergencyBar';
import { DemoScenariosModal } from './components/DemoScenariosModal';
import { LocationService } from './services/locationService';
import { CountryEmergencyConfig } from './types';

const SETTINGS_STORAGE_KEY = 'redalert_user_settings_v1';
const SOS_STORAGE_KEY = 'redalert_active_sos_request_v1';

export default function App() {
  // Navigation tab state: 'dashboard' | 'rescue-hub' | 'live-alerts' | 'safety-center' | 'history' | 'about' | 'settings'
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Country and Worldwide Emergency config state
  const [selectedCountry, setSelectedCountry] = useState<CountryEmergencyConfig>(() =>
    LocationService.getDefaultCountry()
  );
  const [isDemoScenarioOpen, setIsDemoScenarioOpen] = useState<boolean>(false);

  // User Settings state
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      soundEnabled: true,
      notificationsEnabled: false,
      severityThreshold: 'CRITICAL',
      autoResetDemoMinutes: 5,
      theme: 'dark',
      defaultLocation: PRESET_LOCATIONS[0].name,
    };
  });

  // Location state
  const [location, setLocation] = useState({
    name: PRESET_LOCATIONS[0].name,
    lat: PRESET_LOCATIONS[0].lat,
    lng: PRESET_LOCATIONS[0].lng,
  });

  // Current active disaster alert state (Starts in Safe/nominal state)
  const [currentAlert, setCurrentAlert] = useState<Alert>(SAFE_ALERT);

  // Alert overlay state (Full-screen RED ALERT modal)
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  // Timeline & History lists
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(INITIAL_TIMELINE_EVENTS);
  const [historyAlerts, setHistoryAlerts] = useState<Alert[]>(HISTORICAL_ALERTS);

  // Emergency SOS state
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [activeSosRequest, setActiveSosRequest] = useState<EmergencyRequest | null>(() => {
    try {
      const saved = localStorage.getItem(SOS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  });
  const [rescueRequests, setRescueRequests] = useState<EmergencyRequest[]>([]);

  // Fetch initial rescue requests from backend
  const fetchRescueRequests = async () => {
    try {
      const res = await fetch('/api/sos');
      if (res.ok) {
        const data = await res.json();
        if (data.requests) {
          setRescueRequests(data.requests);
        }
      }
    } catch (err) {
      console.warn('Could not fetch SOS rescue requests:', err);
    }
  };

  useEffect(() => {
    fetchRescueRequests();
  }, []);

  // Save settings when changed
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleResetSettings = () => {
    const defaults: UserSettings = {
      soundEnabled: true,
      notificationsEnabled: false,
      severityThreshold: 'CRITICAL',
      autoResetDemoMinutes: 5,
      theme: 'dark',
      defaultLocation: PRESET_LOCATIONS[0].name,
    };
    setSettings(defaults);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  };

  // Trigger simulated disaster alert
  const handleSimulateDisaster = (type: DisasterType) => {
    const simulated = generateSimulatedAlert(type, location.name);
    setCurrentAlert(simulated);

    // Audio Alert if enabled
    if (settings.soundEnabled && simulated.severity === 'CRITICAL') {
      playEmergencyAlertSound(1600);
    }

    // Push Notification if enabled & permitted
    if (settings.notificationsEnabled) {
      sendBrowserNotification(
        `RED ALERT AI: ${simulated.title}`,
        `${simulated.description} (${simulated.location})`
      );
    }

    // Determine if overlay should open based on severity threshold
    const severityRanks: Record<string, number> = { SAFE: 0, WATCH: 1, WARNING: 2, CRITICAL: 3 };
    const alertRank = severityRanks[simulated.severity] || 0;
    const thresholdRank = severityRanks[settings.severityThreshold] || 2;

    if (alertRank >= thresholdRank) {
      setShowOverlay(true);
    }

    // Append to live timeline
    const newEvent: TimelineEvent = {
      id: `evt-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: `${simulated.disasterType} [${simulated.severity}] detected in ${location.name.split(',')[0]}`,
      severity: simulated.severity,
      disasterType: simulated.disasterType,
      source: simulated.source,
      isDemo: true,
    };
    setTimelineEvents((prev) => [newEvent, ...prev]);

    // Append to alert history
    setHistoryAlerts((prev) => [simulated, ...prev]);
  };

  // Dedicated "Simulate RED ALERT" button action
  const handleSimulateRedAlert = () => {
    handleSimulateDisaster('Flood');
    setShowOverlay(true);
  };

  // Reset to All Clear
  const handleClearAlert = () => {
    setCurrentAlert(SAFE_ALERT);
    setShowOverlay(false);
    if (settings.soundEnabled) {
      playSafetyChime();
    }
  };

  const handleUpdateLocation = (name: string, lat: number, lng: number) => {
    setLocation({ name, lat, lng });
  };

  // SOS Submission handler
  const handleSosSubmitted = (req: EmergencyRequest) => {
    setActiveSosRequest(req);
    try {
      localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify(req));
    } catch {
      // ignore
    }

    // Add to rescue requests list
    setRescueRequests((prev) => [req, ...prev.filter((r) => r.id !== req.id)]);

    // Play alert sound & notification
    if (settings.soundEnabled) {
      playEmergencyAlertSound(1200);
    }
    if (settings.notificationsEnabled) {
      sendBrowserNotification(
        '🚨 EMERGENCY RESCUE SOS TRANSMITTED',
        `Request #${req.id} sent for ${req.locationName}. Responders notified.`
      );
    }

    // Add to live timeline
    const newEvent: TimelineEvent = {
      id: `sos-evt-${Date.now()}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: `🚨 EMERGENCY RESCUE SOS [#${req.id}] broadcast for ${req.locationName}`,
      severity: 'CRITICAL',
      disasterType: (req.disasterType === 'Other' ? 'Severe Storm' : req.disasterType) as DisasterType,
      source: 'Citizen SOS Distress Beacon',
      isDemo: true,
    };
    setTimelineEvents((prev) => [newEvent, ...prev]);
  };

  // Cancel SOS handler
  const handleCancelSos = async (id: string) => {
    setActiveSosRequest(null);
    localStorage.removeItem(SOS_STORAGE_KEY);

    try {
      await fetch(`/api/sos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
    } catch (err) {
      console.warn('Failed to notify backend of SOS cancellation:', err);
    }

    setRescueRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'CANCELLED' } : r))
    );
  };

  // Update rescue request status from Responder Dashboard
  const handleUpdateRescueStatus = async (id: string, newStatus: SosStatus, team?: string) => {
    try {
      await fetch(`/api/sos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, assignedTeam: team }),
      });
    } catch (err) {
      console.warn('Failed to update status on server:', err);
    }

    setRescueRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: newStatus,
              assignedTeam: team || r.assignedTeam,
            }
          : r
      )
    );

    if (activeSosRequest && activeSosRequest.id === id) {
      const updated = {
        ...activeSosRequest,
        status: newStatus,
        assignedTeam: team || activeSosRequest.assignedTeam,
      };
      setActiveSosRequest(updated);
      localStorage.setItem(SOS_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const hasActiveCriticalAlert = currentAlert.severity === 'CRITICAL';
  const pendingSosCount = rescueRequests.filter((r) => r.status === 'PENDING' || r.status === 'SERVER_RECEIVED').length;

  return (
    <div id="red-alert-app" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-600 selection:text-white">
      {/* Worldwide Emergency Number & Civil Protection Preset Ribbon */}
      <WorldwideEmergencyBar
        selectedCountry={selectedCountry}
        onSelectCountry={setSelectedCountry}
      />

      {/* Real-time Multi-Channel Connectivity & Failover Bar */}
      <NetworkStatusIndicatorBar
        onSimulateRainFloodScenario={() => setIsDemoScenarioOpen(true)}
      />

      {/* Top Main Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onSimulateRedAlert={handleSimulateRedAlert}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
        hasActiveAlert={hasActiveCriticalAlert}
        activeSosCount={pendingSosCount}
        onOpenSos={() => setIsSosModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* VIEW 1: DASHBOARD */}
        {currentTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Landing Hero (introduces the platform & allows instant simulation) */}
            <LandingHero
              onGoToDashboard={() => {
                const el = document.getElementById('current-safety-status-card');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onSimulateRedAlert={handleSimulateRedAlert}
            />

            {/* Hackathon Demo Simulator Ribbon */}
            <DemoModeBar
              onSimulateDisaster={handleSimulateDisaster}
              onClearAlert={handleClearAlert}
              isSimulated={currentAlert.isDemo}
              activeType={currentAlert.severity !== 'SAFE' ? currentAlert.disasterType : undefined}
            />

            {/* PROMINENT EMERGENCY SOS BUTTON CARD */}
            <SosButtonCard
              onOpenSosModal={() => setIsSosModalOpen(true)}
              activeSosRequest={activeSosRequest}
              onViewActiveSos={() => setIsSosModalOpen(true)}
            />

            {/* Section 1: Central Safety Status Card */}
            <CurrentSafetyStatus
              alert={currentAlert}
              onViewSafetyInstructions={() => setCurrentTab('safety-center')}
              onScrollToAiAnalysis={() => {
                const el = document.getElementById('ai-risk-analysis-card');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onClearAlert={handleClearAlert}
            />

            {/* Section 2: Selected Area Location Card */}
            <LocationCard
              currentLocationName={location.name}
              latitude={location.lat}
              longitude={location.lng}
              onUpdateLocation={handleUpdateLocation}
            />

            {/* Two Column Grid: Tactical Radar Map + Live Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <InteractiveMap
                  currentAlert={currentAlert}
                  locationName={location.name}
                  latitude={location.lat}
                  longitude={location.lng}
                />
              </div>

              <div className="lg:col-span-5">
                <Timeline events={timelineEvents} />
              </div>
            </div>

            {/* AI Risk Analysis Component */}
            <AiRiskAnalysis
              alert={currentAlert}
              onAnalysisUpdated={(newAnalysis) => {
                setCurrentAlert((prev) => ({ ...prev, aiAnalysis: newAnalysis }));
              }}
            />

            {/* Section 3: 8 Disaster Types Peril Grid */}
            <DisasterGrid
              activeDisasterType={currentAlert.severity !== 'SAFE' ? currentAlert.disasterType : undefined}
              currentSeverity={currentAlert.severity}
              onSelectDisasterDemo={handleSimulateDisaster}
            />
          </div>
        )}

        {/* VIEW: RESCUE HUB (Authorized Responder Dashboard) */}
        {currentTab === 'rescue-hub' && (
          <RescueDashboardView
            rescueRequests={rescueRequests}
            onUpdateStatus={handleUpdateRescueStatus}
            onRefreshRequests={fetchRescueRequests}
          />
        )}

        {/* VIEW 2: LIVE ALERTS VIEW */}
        {currentTab === 'live-alerts' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-800 pb-4">
              <h1 className="font-tech text-2xl font-bold uppercase text-white tracking-wide">
                Active Telemetry & Live Alert Feeds
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time situational awareness stream for monitored jurisdiction: {location.name}
              </p>
            </div>

            {/* Emergency SOS Button also available on Live Alerts */}
            <SosButtonCard
              onOpenSosModal={() => setIsSosModalOpen(true)}
              activeSosRequest={activeSosRequest}
              onViewActiveSos={() => setIsSosModalOpen(true)}
            />

            <CurrentSafetyStatus
              alert={currentAlert}
              onViewSafetyInstructions={() => setCurrentTab('safety-center')}
              onScrollToAiAnalysis={() => {
                const el = document.getElementById('ai-risk-analysis-card');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onClearAlert={handleClearAlert}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <InteractiveMap
                  currentAlert={currentAlert}
                  locationName={location.name}
                  latitude={location.lat}
                  longitude={location.lng}
                />
              </div>
              <div className="lg:col-span-5">
                <Timeline events={timelineEvents} />
              </div>
            </div>

            <AiRiskAnalysis
              alert={currentAlert}
              onAnalysisUpdated={(newAnalysis) => {
                setCurrentAlert((prev) => ({ ...prev, aiAnalysis: newAnalysis }));
              }}
            />
          </div>
        )}

        {/* VIEW 3: SAFETY CENTER */}
        {currentTab === 'safety-center' && <SafetyCenterView />}

        {/* VIEW 4: ALERT HISTORY */}
        {currentTab === 'history' && <AlertHistoryView historyAlerts={historyAlerts} />}

        {/* VIEW 5: ABOUT & TECHNICAL SPECIFICATIONS */}
        {currentTab === 'about' && <AboutView />}

        {/* VIEW 6: SETTINGS */}
        {currentTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={updateSettings}
            onResetToDefaults={handleResetSettings}
          />
        )}
      </main>

      {/* Floating Red Alert AI Assistant */}
      <RedAlertAssistant currentAlert={currentAlert.severity !== 'SAFE' ? currentAlert : null} />

      {/* Full-Screen RED ALERT Overlay Modal */}
      {showOverlay && currentAlert.severity !== 'SAFE' && (
        <RedAlertOverlay
          alert={currentAlert}
          onDismiss={() => setShowOverlay(false)}
          onViewSafetyInstructions={() => {
            setShowOverlay(false);
            setCurrentTab('safety-center');
          }}
          onViewAlertDetails={() => {
            setShowOverlay(false);
            setCurrentTab('dashboard');
            const el = document.getElementById('current-safety-status-card');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          soundEnabled={settings.soundEnabled}
          onToggleSound={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          onTriggerSos={() => {
            setShowOverlay(false);
            setIsSosModalOpen(true);
          }}
        />
      )}

      {/* Emergency SOS & Rescue Flow Modal */}
      <SosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        defaultLocationName={location.name}
        defaultDisasterType={currentAlert.severity !== 'SAFE' ? currentAlert.disasterType : 'Flood'}
        defaultSeverity={currentAlert.severity !== 'SAFE' ? currentAlert.severity : 'CRITICAL'}
        activeSosRequest={activeSosRequest}
        onSosSubmitted={handleSosSubmitted}
        onCancelSos={handleCancelSos}
      />

      {/* Guided Disaster & Failover Demonstration Modal */}
      <DemoScenariosModal
        isOpen={isDemoScenarioOpen}
        onClose={() => setIsDemoScenarioOpen(false)}
        onTriggerSosModal={() => setIsSosModalOpen(true)}
        onSwitchToDashboard={() => setCurrentTab('rescue-hub')}
        onSwitchToAlerts={() => {
          handleSimulateDisaster('Heavy Rain');
          setCurrentTab('dashboard');
        }}
      />

      {/* Global Safety Footer */}
      <footer id="app-footer" className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-tech font-bold text-slate-200 uppercase tracking-wider">
              RED ALERT AI
            </span>
            <span>—</span>
            <span className="italic">“Know early. Act safely.”</span>
          </div>

          <div className="text-[11px] text-slate-400">
            Hackathon Demonstration Prototype • Always adhere strictly to official civil defense & NOAA directives.
          </div>

          <div className="font-mono-num text-[11px] text-slate-400">
            Gemini 3.8 Flash • Node/Express Backend
          </div>
        </div>
      </footer>
    </div>
  );
}
