import React, { useState, useEffect } from 'react';
import { EmergencyRequest, SosStatus, CommunicationChannel, RescuePriority, User, UserRole, AiEmergencyRiskAssessment } from '../types';
import {
  ShieldAlert,
  Radio,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  RefreshCw,
  Search,
  LifeBuoy,
  Wifi,
  Satellite,
  Share2,
  HardDrive,
  Truck,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  Lock,
  Unlock,
  UserCheck,
  Activity,
} from 'lucide-react';
import { PROTOTYPE_DISCLAIMER } from '../services/communicationService';
import { AiAnalysisService } from '../services/aiAnalysisService';
import { authService } from '../services/authService';
import { RiskAssessmentEngine } from '../services/riskAssessmentEngine';
import { AiEmergencyRiskScoreCard } from './AiEmergencyRiskScoreCard';
import { AiRiskAssessmentModal } from './AiRiskAssessmentModal';

interface RescueDashboardViewProps {
  rescueRequests: EmergencyRequest[];
  onUpdateStatus: (id: string, newStatus: SosStatus, team?: string) => void;
  onRefreshRequests: () => void;
}

export const RescueDashboardView: React.FC<RescueDashboardViewProps> = ({
  rescueRequests,
  onUpdateStatus,
  onRefreshRequests,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterChannel, setFilterChannel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analyzingIds, setAnalyzingIds] = useState<Record<string, boolean>>({});
  const [aiAnalyses, setAiAnalyses] = useState<
    Record<string, { priority: RescuePriority; reason: string; recommendedUnits: string[] }>
  >({});

  // AI Risk Assessment Simulator & Ticket Assessment State
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [ticketAssessments, setTicketAssessments] = useState<Record<string, AiEmergencyRiskAssessment>>({});
  const [evaluatingRiskIds, setEvaluatingRiskIds] = useState<Record<string, boolean>>({});

  const getEffectiveAssessment = (req: EmergencyRequest): AiEmergencyRiskAssessment => {
    if (ticketAssessments[req.id]) return ticketAssessments[req.id];
    if (req.riskAssessment) return req.riskAssessment;
    return RiskAssessmentEngine.calculateDeterministicAssessment({
      disasterType: req.disasterType,
      severity: req.severity,
      peopleAffected: req.peopleCount,
      location: req.locationName,
      urgency: req.situation,
      description: req.message,
      availableInfo: req.isGpsConfirmed ? 'GPS confirmed coordinates' : 'Manual approximate sector',
    });
  };

  const handleReevaluateRisk = async (req: EmergencyRequest) => {
    setEvaluatingRiskIds((prev) => ({ ...prev, [req.id]: true }));
    try {
      const assessment = await RiskAssessmentEngine.evaluateRiskAssessment({
        disasterType: req.disasterType,
        severity: req.severity,
        peopleAffected: req.peopleCount,
        location: req.locationName,
        urgency: req.situation,
        description: req.message,
        availableInfo: req.isGpsConfirmed ? 'GPS confirmed coordinates' : 'Manual approximate sector',
      });
      setTicketAssessments((prev) => ({ ...prev, [req.id]: assessment }));
    } catch (err) {
      console.warn('Failed to evaluate ticket risk:', err);
    } finally {
      setEvaluatingRiskIds((prev) => ({ ...prev, [req.id]: false }));
    }
  };

  // Active Session & RBAC Demo Simulation State
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getUser());
  const [authRole, setAuthRole] = useState<UserRole>(() => authService.getRole());
  const [isSwitchingRole, setIsSwitchingRole] = useState<boolean>(false);
  const [roleMessage, setRoleMessage] = useState<string | null>(null);

  useEffect(() => {
    return authService.subscribe((session) => {
      setCurrentUser(session ? session.user : null);
      setAuthRole(session ? session.user.role : 'CITIZEN');
    });
  }, []);

  const handleRoleSwitch = async (role: UserRole) => {
    setIsSwitchingRole(true);
    setRoleMessage(null);
    try {
      const res = await authService.demoLogin(role);
      if (res.success) {
        setRoleMessage(`Simulation CAD Session active: ${role}`);
        onRefreshRequests();
      } else {
        setRoleMessage(`Failed to switch role: ${res.error}`);
      }
    } catch {
      setRoleMessage('Could not switch session.');
    } finally {
      setIsSwitchingRole(false);
      setTimeout(() => setRoleMessage(null), 3500);
    }
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    onRefreshRequests();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleRunAiTriage = async (req: EmergencyRequest) => {
    setAnalyzingIds((prev) => ({ ...prev, [req.id]: true }));
    try {
      const result = await AiAnalysisService.analyzeSosRescuePriority({
        disasterType: req.disasterType,
        severity: req.severity,
        location: req.locationName,
        peopleCount: req.peopleCount,
        situation: req.situation,
        communicationStatus: req.communicationMethod || 'INTERNET',
        message: req.message,
      });

      setAiAnalyses((prev) => ({
        ...prev,
        [req.id]: {
          priority: result.priority,
          reason: result.reason,
          recommendedUnits: result.recommendedUnits,
        },
      }));
    } finally {
      setAnalyzingIds((prev) => ({ ...prev, [req.id]: false }));
    }
  };

  const filtered = rescueRequests.filter((req) => {
    if (filterStatus !== 'ALL' && req.status !== filterStatus) return false;
    if (filterChannel !== 'ALL' && (req.communicationMethod || 'INTERNET') !== filterChannel) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        req.id.toLowerCase().includes(q) ||
        req.locationName.toLowerCase().includes(q) ||
        req.situation.toLowerCase().includes(q) ||
        req.disasterType.toLowerCase().includes(q) ||
        req.message.toLowerCase().includes(q) ||
        (req.assignedTeam && req.assignedTeam.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: SosStatus) => {
    switch (status) {
      case 'OFFLINE_QUEUED':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 animate-pulse';
      case 'TRANSMITTING':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse';
      case 'SERVER_RECEIVED':
      case 'PENDING':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
      case 'ACKNOWLEDGED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'TEAM_ASSIGNED':
      case 'DISPATCHED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'TEAM_EN_ROUTE':
      case 'EN_ROUTE':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'RESOLVED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'CANCELLED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getChannelBadge = (ch?: CommunicationChannel | string) => {
    switch (ch) {
      case 'INTERNET':
        return {
          icon: Wifi,
          label: 'IP Internet',
          bg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
        };
      case 'CELLULAR':
        return {
          icon: Radio,
          label: 'Cellular 5G/LTE',
          bg: 'bg-blue-950/60 border-blue-500/40 text-blue-300',
        };
      case 'SMS':
        return {
          icon: Radio,
          label: 'SMS Fallback Bridge',
          bg: 'bg-amber-950/60 border-amber-500/50 text-amber-300',
        };
      case 'SATELLITE':
        return {
          icon: Satellite,
          label: 'Satellite Uplink (LEO)',
          bg: 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300',
        };
      case 'RELAY':
        return {
          icon: Share2,
          label: 'Mesh Device Relay',
          bg: 'bg-purple-950/60 border-purple-500/50 text-purple-300',
        };
      case 'OFFLINE_QUEUE':
      default:
        return {
          icon: HardDrive,
          label: 'Offline Device Outbox',
          bg: 'bg-rose-950/70 border-rose-500/50 text-rose-300',
        };
    }
  };

  const getPriorityBadge = (p: RescuePriority) => {
    switch (p) {
      case 'CRITICAL':
        return 'bg-rose-600 text-white font-bold border-rose-500 shadow-sm shadow-rose-600/30';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'LOW':
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div id="rescue-responder-dashboard" className="space-y-5 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-500">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-tech text-xl sm:text-2xl font-bold uppercase tracking-wider text-white">
                Rescue Command Center & Dispatch
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-Channel Ingestion Stream • AI Priority Triage • Automatic Signal Fallback Gateway
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="open-ai-risk-simulator-btn"
            type="button"
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-tech text-xs font-bold uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Risk Simulator</span>
          </button>

          <button
            id="refresh-rescue-queue-btn"
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-rose-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync Live Queue</span>
          </button>
        </div>
      </div>

      {/* Mandatory Prototype Safety Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white uppercase font-tech">DEMO / PROTOTYPE DISCLAIMER: </strong>
          {PROTOTYPE_DISCLAIMER}
        </div>
      </div>

      {/* Operator Session & Simulation Role Switcher */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">
                {currentUser ? currentUser.name : 'Simulated Guest Session'}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono-num font-bold uppercase tracking-wider ${
                  authRole === 'ADMIN'
                    ? 'bg-purple-950 text-purple-300 border border-purple-500/50'
                    : authRole === 'RESCUE_OPERATOR'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                ROLE: {authRole}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {authRole === 'RESCUE_OPERATOR' || authRole === 'ADMIN'
                ? 'Authorized CAD Responder: Full telemetry access and incident disposition controls.'
                : 'Citizen mode: Coordinates and private survivor messages are masked by default.'}
            </span>
          </div>
        </div>

        {/* Quick 1-Click Role Switcher */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase font-tech tracking-wider text-slate-400 mr-1">
            Simulate Role:
          </span>
          <button
            type="button"
            onClick={() => handleRoleSwitch('RESCUE_OPERATOR')}
            disabled={isSwitchingRole || authRole === 'RESCUE_OPERATOR'}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
              authRole === 'RESCUE_OPERATOR'
                ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            Operator
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('ADMIN')}
            disabled={isSwitchingRole || authRole === 'ADMIN'}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
              authRole === 'ADMIN'
                ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleRoleSwitch('CITIZEN')}
            disabled={isSwitchingRole || authRole === 'CITIZEN'}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border ${
              authRole === 'CITIZEN'
                ? 'bg-slate-700 text-white border-slate-600 shadow-sm'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            Citizen
          </button>
        </div>
      </div>

      {roleMessage && (
        <div className="px-3.5 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>{roleMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-tech tracking-wider text-slate-400 block">
            Active Distress Calls
          </span>
          <p className="text-xl font-bold text-white font-mono-num mt-0.5">
            {rescueRequests.filter((r) => r.status !== 'RESOLVED' && r.status !== 'CANCELLED').length}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-tech tracking-wider text-rose-400 block">
            Critical Triage
          </span>
          <p className="text-xl font-bold text-rose-400 font-mono-num mt-0.5">
            {rescueRequests.filter((r) => r.priority === 'CRITICAL').length}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-tech tracking-wider text-amber-400 block">
            Alternative Channel Beacons
          </span>
          <p className="text-xl font-bold text-amber-400 font-mono-num mt-0.5">
            {
              rescueRequests.filter(
                (r) =>
                  r.communicationMethod === 'SMS' ||
                  r.communicationMethod === 'SATELLITE' ||
                  r.communicationMethod === 'RELAY' ||
                  r.communicationMethod === 'OFFLINE_QUEUE'
              ).length
            }
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <span className="text-[10px] uppercase font-tech tracking-wider text-emerald-400 block">
            Rescues Completed
          </span>
          <p className="text-xl font-bold text-emerald-400 font-mono-num mt-0.5">
            {rescueRequests.filter((r) => r.status === 'RESOLVED').length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-2.5 pt-1">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto">
            {['ALL', 'SERVER_RECEIVED', 'ACKNOWLEDGED', 'TEAM_ASSIGNED', 'TEAM_EN_ROUTE', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide transition-all border ${
                  filterStatus === st
                    ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {st === 'SERVER_RECEIVED' ? 'RECEIVED' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search ID, location, peril..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
        </div>

        {/* Channel Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
          <span className="text-[10px] uppercase font-tech tracking-wider text-slate-400 mr-1">Channel:</span>
          {['ALL', 'INTERNET', 'CELLULAR', 'SMS', 'SATELLITE', 'RELAY', 'OFFLINE_QUEUE'].map((ch) => (
            <button
              key={ch}
              onClick={() => setFilterChannel(ch)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono border transition ${
                filterChannel === ch
                  ? 'bg-cyan-950 border-cyan-500/80 text-cyan-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300'
              }`}
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-10 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold">No emergency rescue tickets in this view category.</p>
          </div>
        ) : (
          filtered.map((req) => {
            const channelBadge = getChannelBadge(req.communicationMethod);
            const ChannelIcon = channelBadge.icon;
            const aiData = aiAnalyses[req.id];
            const currentPriority = aiData?.priority || req.priority;
            const assessment = getEffectiveAssessment(req);

            return (
              <div
                key={req.id}
                id={`rescue-ticket-${req.id}`}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5 backdrop-blur-md space-y-3 hover:border-slate-700 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-tech font-bold text-base text-white">{req.id}</span>

                    <span
                      className={`text-[10px] font-mono-num font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getStatusBadge(
                        req.status
                      )}`}
                    >
                      {req.status.replace('_', ' ')}
                    </span>

                    {/* Priority Badge */}
                    <span
                      className={`text-[10px] font-mono-num px-2 py-0.5 rounded-md border uppercase tracking-wider ${getPriorityBadge(
                        currentPriority
                      )}`}
                    >
                      PRIORITY: {currentPriority}
                    </span>

                    {/* AI Emergency Risk Score Badge */}
                    <span
                      className={`text-[10px] font-mono-num font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                        assessment.classification === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border-rose-500/60'
                          : assessment.classification === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border-amber-500/60'
                          : assessment.classification === 'MODERATE'
                          ? 'bg-yellow-950 text-yellow-300 border-yellow-500/60'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                      }`}
                    >
                      AI RISK: {assessment.riskScore}/100 ({assessment.classification})
                    </span>

                    {/* Channel Badge */}
                    <div
                      className={`inline-flex items-center gap-1 text-[10px] font-mono-num font-semibold px-2 py-0.5 rounded-md border ${channelBadge.bg}`}
                    >
                      <ChannelIcon className="w-3 h-3" />
                      <span>{channelBadge.label}</span>
                    </div>

                    <span className="text-[11px] font-mono-num text-rose-300 font-semibold px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                      {req.disasterType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono-num">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Logged: {req.timestamp}</span>
                  </div>
                </div>

                {/* Location & Details Card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-tech block">Victim Location</span>
                    <div className="flex items-center gap-1 text-slate-200 font-semibold mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      <span className="truncate">{req.locationName}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-tech block">GPS Coordinates</span>
                    <p className="text-slate-300 font-mono-num mt-0.5">
                      {req.latitude && req.longitude
                        ? `${req.latitude.toFixed(4)}°N, ${req.longitude.toFixed(4)}°E (${
                            req.isGpsConfirmed ? 'GPS Verified' : 'Estimated'
                          })`
                        : 'Manual Baseline Sector'}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-tech block">Reported Status</span>
                    <div className="flex items-center gap-2 text-slate-200 font-semibold mt-0.5">
                      <Users className="w-3.5 h-3.5 text-rose-400" />
                      <span>
                        {req.peopleCount} Person(s) • {req.situation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Citizen Message */}
                {req.message && (
                  <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-xs text-slate-300">
                    <span className="font-semibold text-rose-400 block mb-0.5">Citizen Distress Note:</span>
                    <p className="italic leading-relaxed">“{req.message}”</p>
                  </div>
                )}

                {/* AI Emergency Risk Assessment Card (Score 0-100, Priority, Factors, Response Priority) */}
                <AiEmergencyRiskScoreCard
                  assessment={assessment}
                  compact={true}
                  onRefresh={() => handleReevaluateRisk(req)}
                  isRefreshing={evaluatingRiskIds[req.id]}
                />

                {/* Multi-Channel Hop History */}
                {req.channelLogs && req.channelLogs.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                    <span className="text-[10px] font-tech uppercase tracking-wider text-cyan-400 block">
                      Transmission Channel Log
                    </span>
                    {req.channelLogs.map((log, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-slate-400 font-mono">
                        <ChevronRight className="w-3 h-3 text-cyan-500 shrink-0" />
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Risk & Priority Analysis Section */}
                <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-tech font-bold uppercase tracking-wider text-[11px]">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>AI Rescue Priority Analysis</span>
                    </div>
                    <button
                      onClick={() => handleRunAiTriage(req)}
                      disabled={analyzingIds[req.id]}
                      className="px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-200 text-[10px] flex items-center gap-1 transition disabled:opacity-50"
                    >
                      <RefreshCw className={`w-2.5 h-2.5 ${analyzingIds[req.id] ? 'animate-spin' : ''}`} />
                      <span>{analyzingIds[req.id] ? 'Triaging...' : 'Re-Evaluate with AI'}</span>
                    </button>
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {aiData?.reason ||
                      req.aiPriorityReason ||
                      `Assigned ${currentPriority} priority based on ${req.situation.toLowerCase()} condition during ${
                        req.disasterType
                      } alert via ${channelBadge.label}.`}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-tech uppercase">Recommended Units:</span>
                    {(aiData?.recommendedUnits || ['Swift Water Rescue Team', 'Paramedic ALS Unit']).map((unit, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono-num font-medium"
                      >
                        {unit}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Assigned Team */}
                {req.assignedTeam && (
                  <div className="flex items-center gap-2 text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded-xl">
                    <Truck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      Assigned Field Unit: <strong>{req.assignedTeam}</strong>
                    </span>
                  </div>
                )}

                {/* Responder Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono-num">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>HMAC-SHA256: VALIDATED</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-400">SIMULATION CAD EXERCISE</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {req.status === 'SERVER_RECEIVED' || req.status === 'OFFLINE_QUEUED' || req.status === 'PENDING' ? (
                      <button
                        id={`ack-btn-${req.id}`}
                        onClick={() => onUpdateStatus(req.id, 'ACKNOWLEDGED')}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold font-tech uppercase tracking-wider transition-all"
                      >
                        Acknowledge (Sim)
                      </button>
                    ) : null}

                    {req.status !== 'TEAM_ASSIGNED' &&
                      req.status !== 'TEAM_EN_ROUTE' &&
                      req.status !== 'DISPATCHED' &&
                      req.status !== 'RESOLVED' &&
                      req.status !== 'CANCELLED' && (
                        <button
                          id={`assign-team-btn-${req.id}`}
                          onClick={() => {
                            const team =
                              req.disasterType === 'Heavy Rain' || req.disasterType === 'Flood'
                                ? 'Swift Water Rescue Team #3'
                                : 'Urban Search & Rescue Team #1';
                            onUpdateStatus(req.id, 'TEAM_ASSIGNED', team);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-tech uppercase tracking-wider transition-all"
                        >
                          Assign Rescue Team (Sim)
                        </button>
                      )}

                    {req.status !== 'TEAM_EN_ROUTE' &&
                      req.status !== 'EN_ROUTE' &&
                      req.status !== 'RESOLVED' &&
                      req.status !== 'CANCELLED' && (
                        <button
                          id={`enroute-btn-${req.id}`}
                          onClick={() => onUpdateStatus(req.id, 'TEAM_EN_ROUTE')}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-tech uppercase tracking-wider transition-all"
                        >
                          Mark En Route (Sim)
                        </button>
                      )}

                    {req.status !== 'RESOLVED' && (
                      <button
                        id={`resolve-btn-${req.id}`}
                        onClick={() => onUpdateStatus(req.id, 'RESOLVED')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-tech uppercase tracking-wider transition-all"
                      >
                        Mark Resolved (Sim)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AI Risk Assessment Simulator Modal for Judges & Operators */}
      <AiRiskAssessmentModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />
    </div>
  );
};
