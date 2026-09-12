import React from 'react';
import { TimelineEvent } from '../types';
import { AlertLevelBadge } from './AlertLevelBadge';
import { Activity, Clock, PlayCircle, CheckCircle } from 'lucide-react';

interface TimelineProps {
  events: TimelineEvent[];
}

export const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <div
      id="live-alert-timeline-card"
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-rose-500" />
          <h2 className="text-base font-tech uppercase tracking-wider text-slate-200">
            Live Alert & Telemetry Timeline
          </h2>
        </div>
        <span className="text-[11px] font-mono-num text-emerald-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Real-time Event Stream
        </span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
        {/* Render Start Marker */}
        <div id="timeline-render-start" className="relative group transition-all">
          <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-slate-950 bg-emerald-500 ring-2 ring-emerald-500/30 flex items-center justify-center" />
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono-num text-emerald-300">
            <span className="flex items-center gap-1.5 font-bold">
              <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>[RENDER START] Latest Incoming Telemetry</span>
            </span>
            <span className="text-[10px] text-emerald-400/80">Active Stream</span>
          </div>
        </div>

        {events.map((evt) => {
          const isCritical = evt.severity === 'CRITICAL';
          const isWarning = evt.severity === 'WARNING';

          return (
            <div
              key={evt.id}
              id={`timeline-event-${evt.id}`}
              className="relative group transition-all"
            >
              {/* Timeline marker node */}
              <div
                className={`absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 transition-colors ${
                  isCritical
                    ? 'bg-rose-500 ring-2 ring-rose-500/40'
                    : isWarning
                    ? 'bg-amber-400'
                    : evt.severity === 'WATCH'
                    ? 'bg-yellow-400'
                    : 'bg-emerald-400'
                }`}
              />

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono-num font-bold text-slate-200 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {evt.time}
                    </span>
                    <span className="text-xs font-tech font-semibold text-slate-400">
                      [{evt.disasterType}]
                    </span>
                  </div>
                  <AlertLevelBadge severity={evt.severity} size="sm" />
                </div>

                <p className="text-sm font-medium text-slate-200">{evt.title}</p>

                <div className="mt-2 text-[11px] text-slate-400 font-mono-num">
                  Source: <span className="text-slate-300 font-normal">{evt.source}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Render End Marker */}
        <div id="timeline-render-end" className="relative group transition-all pt-1">
          <div className="absolute -left-[23px] top-2.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 bg-slate-600 ring-2 ring-slate-600/30 flex items-center justify-center" />
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] font-mono-num text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>[RENDER END] Baseline Events Buffer</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono-num">{events.length} events logged</span>
          </div>
        </div>
      </div>
    </div>
  );
};
