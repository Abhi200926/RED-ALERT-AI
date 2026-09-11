import React from 'react';
import {
  ShieldAlert,
  Cpu,
  Radio,
  FileCode,
  Globe,
  CheckCircle,
  AlertTriangle,
  Server,
  Sparkles,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div id="about-architecture-view" className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Title & Brand statement */}
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-tech font-bold uppercase tracking-widest text-rose-500">
          Emergency Intelligence Prototype
        </span>
        <h1 className="font-tech text-3xl font-extrabold uppercase tracking-wide text-white mt-1">
          RED ALERT <span className="text-rose-500">AI</span>
        </h1>
        <p className="text-sm font-semibold text-slate-300 mt-1">
          “Know early. Act safely.” — AI-assisted natural disaster early-warning and emergency information platform.
        </p>
      </div>

      {/* Mandatory Hackathon Prototype & Safety Disclaimer */}
      <div className="rounded-2xl border-2 border-amber-500/50 bg-amber-950/20 p-5 backdrop-blur-md space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-tech font-bold text-sm uppercase tracking-wider">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>Important Safety & Hackathon Prototype Disclaimer</span>
        </div>
        <ul className="text-xs text-slate-300 leading-relaxed space-y-1.5 list-disc list-inside">
          <li>
            <strong className="text-white">Prototype Nature:</strong> RED ALERT AI is a technology concept and hackathon demonstration prototype. It is not a certified government or civil defense warning system.
          </li>
          <li>
            <strong className="text-white">No Guarantee:</strong> Artificial intelligence models cannot guarantee that a natural disaster is or is not happening. AI outputs represent probabilistic synthesis of telemetry parameters.
          </li>
          <li>
            <strong className="text-white">Authoritative Primacy:</strong> In all circumstances, users and responders must strictly follow directives from national and local civil protection authorities (e.g. FEMA, NOAA, USGS, JMA, BOM, Civil Defense).
          </li>
          <li>
            <strong className="text-white">Simulated Telemetry:</strong> All demo triggers are prominently designated with the <span className="text-amber-300 font-mono-num font-bold">DEMO ALERT</span> watermark.
          </li>
        </ul>
      </div>

      {/* System Architecture Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md space-y-5">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-6 h-6 text-rose-400" />
          <h2 className="font-tech text-lg font-bold text-white uppercase tracking-wider">
            System Architecture & Pipeline
          </h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          RED ALERT AI is designed with an edge-ready, four-tier disaster awareness pipeline:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-xs font-tech font-bold text-rose-400 uppercase flex items-center gap-1.5">
              <Radio className="w-4 h-4" /> 1. Telemetry Ingestion Layer
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Consumes multi-sensor time-series metrics (Doppler rain rates, seismic ground acceleration, river stage gauges, atmospheric pressure, and thermal infrared hotspots).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-xs font-tech font-bold text-rose-400 uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> 2. Gemini 3.8 Flash Severity Engine
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Server-side GenAI evaluates structured telemetry against disaster classification matrices, generating concise explanations, immediate survival actions, and confidence bounds.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-xs font-tech font-bold text-rose-400 uppercase flex items-center gap-1.5">
              <Server className="w-4 h-4" /> 3. Alert Broadcast & Spatial Mapping
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Calculates threat radii and geofence overlaps. Renders real-time vector GIS radar maps with epicenter coordinates, danger perimeter buffers, and spatial telemetry stations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="text-xs font-tech font-bold text-rose-400 uppercase flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> 4. Life-Safety Client UI & Audio
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              High-visibility mobile/desktop command interface featuring dual-frequency EAS siren synthesis (Web Audio API), push notifications, and disaster-specific Go-Bag checklists.
            </p>
          </div>
        </div>
      </div>

      {/* Guide for Connecting Real Authoritative APIs */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2.5">
          <Globe className="w-6 h-6 text-rose-400" />
          <h2 className="font-tech text-lg font-bold text-white uppercase tracking-wider">
            Connecting Real-World Authoritative APIs
          </h2>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The application codebase decouples the alert interface from data acquisition. In production deployments, replace the mock generator in <code className="text-rose-300 font-mono-num bg-slate-950 px-1 py-0.5 rounded">src/data/mockDisasters.ts</code> with direct endpoints:
        </p>

        <div className="space-y-3">
          {[
            {
              name: 'USGS Earthquake Hazards Program API',
              url: 'https://earthquake.usgs.gov/fdsnws/event/1/',
              format: 'GeoJSON feeds with M4.5+ real-time quakes, hypocenter depths, and shake maps.',
            },
            {
              name: 'NOAA National Weather Service (NWS) Alerts API',
              url: 'https://api.weather.gov/alerts/active',
              format: 'CAP (Common Alerting Protocol) JSON with active tornado, flash flood, and cyclone warnings.',
            },
            {
              name: 'Global Disaster Alert and Coordination System (GDACS)',
              url: 'https://www.gdacs.org/xml/rss.xml',
              format: 'UN/EC multi-hazard alerts for tsunamis, volcanic eruptions, and tropical cyclones.',
            },
            {
              name: 'Open-Meteo Severe Weather & Air Quality API',
              url: 'https://api.open-meteo.com/v1/forecast',
              format: 'Free high-resolution atmospheric telemetry including CAPE, wind squalls, and precipitation rates.',
            },
          ].map((api, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{api.name}</span>
                <span className="text-[11px] font-mono-num text-rose-400 truncate max-w-xs">{api.url}</span>
              </div>
              <p className="text-[11px] text-slate-400">{api.format}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Gemini Integration Details */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md space-y-3">
        <div className="flex items-center gap-2.5">
          <FileCode className="w-6 h-6 text-rose-400" />
          <h2 className="font-tech text-lg font-bold text-white uppercase tracking-wider">
            Google Gemini AI Configuration
          </h2>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Gemini API queries execute exclusively on the backend (<code className="text-rose-300 font-mono-num bg-slate-950 px-1 py-0.5 rounded">server.ts</code>) using the official <code className="text-rose-300 font-mono-num bg-slate-950 px-1 py-0.5 rounded">@google/genai</code> TypeScript SDK.
        </p>
        <div className="p-3.5 rounded-xl bg-slate-950 font-mono-num text-xs text-slate-300 border border-slate-800 space-y-1">
          <div className="text-slate-400">// Model & Telemetry Ingestion</div>
          <div>Model: <span className="text-rose-400">gemini-3.8-flash</span></div>
          <div>Endpoint: <span className="text-emerald-400">POST /api/analyze-risk</span></div>
          <div>Chat Endpoint: <span className="text-emerald-400">POST /api/chat-assistant</span></div>
          <div>Environment Secret: <span className="text-amber-400">process.env.GEMINI_API_KEY</span></div>
        </div>
      </div>
    </div>
  );
};
