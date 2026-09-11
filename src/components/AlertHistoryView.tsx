import React, { useState } from 'react';
import { Alert, AlertSeverity } from '../types';
import { AlertLevelBadge } from './AlertLevelBadge';
import {
  History,
  Filter,
  Search,
  MapPin,
  Clock,
  Radio,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';

interface AlertHistoryViewProps {
  historyAlerts: Alert[];
}

export const AlertHistoryView: React.FC<AlertHistoryViewProps> = ({
  historyAlerts,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'WATCH' | 'DEMO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredAlerts = historyAlerts.filter((alert) => {
    // Filter matching
    if (filter === 'CRITICAL' && alert.severity !== 'CRITICAL') return false;
    if (filter === 'WARNING' && alert.severity !== 'WARNING') return false;
    if (filter === 'WATCH' && alert.severity !== 'WATCH') return false;
    if (filter === 'DEMO' && !alert.isDemo) return false;

    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        alert.title.toLowerCase().includes(q) ||
        alert.location.toLowerCase().includes(q) ||
        alert.disasterType.toLowerCase().includes(q) ||
        alert.source.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div id="alert-history-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <History className="w-6 h-6 text-rose-500" />
            <h1 className="font-tech text-2xl font-bold uppercase tracking-wider text-white">
              Emergency Alert Event Archive
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical catalog of verified telemetry warnings, demo alerts, and civil protection advisories
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            id="history-search-input"
            type="text"
            placeholder="Search by hazard, city, or source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-tech uppercase text-slate-400 flex items-center gap-1.5 mr-1">
          <Filter className="w-3.5 h-3.5" />
          Filter:
        </span>
        {[
          { key: 'ALL', label: 'All Alerts' },
          { key: 'CRITICAL', label: 'Critical Only' },
          { key: 'WARNING', label: 'Warnings' },
          { key: 'WATCH', label: 'Watches' },
          { key: 'DEMO', label: 'Demo / Simulated' },
        ].map((btn) => (
          <button
            key={btn.key}
            id={`filter-${btn.key.toLowerCase()}`}
            onClick={() => setFilter(btn.key as typeof filter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              filter === btn.key
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Alerts Count */}
      <div className="text-xs text-slate-400 font-mono-num flex items-center justify-between">
        <span>Showing {filteredAlerts.length} recorded alerts</span>
        <span className="text-slate-400">Timestamp format: ISO / Local Telemetry</span>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400">
            <ShieldAlert className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium">No alerts matched your active filter criteria.</p>
          </div>
        ) : (
          filteredAlerts.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                id={`history-item-${item.id}`}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm transition-all hover:border-slate-700"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <AlertLevelBadge severity={item.severity} size="sm" />
                      {item.isDemo ? (
                        <span className="text-[10px] font-mono-num font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/40">
                          DEMO ALERT
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono-num font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/40">
                          AUTHORITATIVE
                        </span>
                      )}
                      <span className="text-xs font-mono-num text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {item.timestamp}
                      </span>
                    </div>

                    <h2 className="text-base font-tech font-bold text-white tracking-wide">
                      {item.title}
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono-num">
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        {item.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Radio className="w-3.5 h-3.5 text-slate-400" />
                        Source: {item.source}
                      </span>
                    </div>
                  </div>

                  <button
                    id={`toggle-history-${item.id}`}
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-semibold self-start sm:self-center"
                  >
                    <span>{isExpanded ? 'Hide Details' : 'View Full Telemetry'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Expanded Telemetry & AI Review */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800 space-y-4 animate-in fade-in duration-200">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Sensor parameters */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(item.parameters).map(([key, val]) => (
                        <div key={key} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                          <span className="text-[10px] font-mono-num uppercase text-slate-400 block truncate">{key}</span>
                          <span className="text-xs font-semibold text-rose-300">{val}</span>
                        </div>
                      ))}
                    </div>

                    {/* AI analysis snapshot */}
                    {item.aiAnalysis && (
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <span className="text-xs font-tech font-bold uppercase text-rose-400">
                          AI Telemetry Interpretation:
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {item.aiAnalysis.explanation}
                        </p>
                        <div className="text-[11px] text-slate-400 italic">
                          {item.aiAnalysis.disclaimer}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
