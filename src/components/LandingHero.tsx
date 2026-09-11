import React from 'react';
import {
  AlertOctagon,
  ArrowRight,
  Flame,
  Shield,
  Radio,
  Sparkles,
  Waves,
  Wind,
  Activity,
  Mountain,
  CloudLightning,
  Anchor,
  SunMedium,
} from 'lucide-react';

interface LandingHeroProps {
  onGoToDashboard: () => void;
  onSimulateRedAlert: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onGoToDashboard,
  onSimulateRedAlert,
}) => {
  const hazardPills = [
    { label: 'Flood', icon: Waves },
    { label: 'Cyclone', icon: Wind },
    { label: 'Earthquake', icon: Activity },
    { label: 'Landslide', icon: Mountain },
    { label: 'Storm', icon: CloudLightning },
    { label: 'Wildfire', icon: Flame },
    { label: 'Tsunami', icon: Anchor },
    { label: 'Heatwave', icon: SunMedium },
  ];

  return (
    <section id="landing-hero-section" className="py-8 sm:py-12 border-b border-slate-800/80 relative overflow-hidden">
      {/* Background ambient spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[250px] bg-rose-600/10 blur-[110px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto text-center space-y-6">
        {/* Top Emergency Pill Notice */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 shadow-md">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
          <span className="text-[11px] font-mono-num font-bold uppercase tracking-wider text-rose-300">
            Next-Gen Emergency Intelligence
          </span>
          <span className="text-[10px] text-slate-400">• v2.4 Active</span>
        </div>

        {/* Brand Headline */}
        <div className="space-y-3">
          <h1 className="font-tech text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-wider text-white">
            RED ALERT <span className="text-rose-500 drop-shadow-[0_0_25px_rgba(244,63,94,0.4)]">AI</span>
          </h1>
          <p className="font-tech text-lg sm:text-2xl text-slate-200 font-semibold tracking-wide">
            “Know early. Act safely.”
          </p>
          
          {/* Core Project Message required by specification */}
          <div className="max-w-3xl mx-auto py-2 space-y-2">
            <p className="text-base sm:text-lg text-rose-300 font-semibold leading-relaxed font-tech">
              RED ALERT AI is designed to keep emergency information moving even when one communication channel fails.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 font-mono tracking-wide uppercase">
              One app. Multiple communication paths. Worldwide emergency readiness.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            id="hero-go-to-dashboard-btn"
            onClick={onGoToDashboard}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-white text-slate-950 font-tech font-bold text-sm tracking-wider uppercase shadow-lg shadow-white/10 transition-all hover:scale-[1.02] active:scale-95"
          >
            <span>Launch Live Dashboard</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </button>

          <button
            id="hero-simulate-red-alert-btn"
            onClick={onSimulateRedAlert}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-tech font-bold text-sm tracking-wider uppercase shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Flame className="w-4 h-4 text-rose-100 animate-pulse" />
            <span>Simulate RED ALERT (Demo)</span>
          </button>
        </div>

        {/* Hazard pills row */}
        <div className="pt-4">
          <span className="text-[11px] uppercase tracking-widest text-slate-400 font-tech block mb-3">
            Monitored Hazard Matrices
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {hazardPills.map((hazard) => {
              const Icon = hazard.icon;
              return (
                <div
                  key={hazard.label}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 font-tech tracking-wide hover:border-slate-700 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-rose-400" />
                  <span>{hazard.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety & Hackathon Prototype Disclaimer */}
        <div className="max-w-3xl mx-auto p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 font-medium leading-relaxed text-left sm:text-center">
          <strong className="text-white uppercase font-tech tracking-wider mr-1">Prototype Notice:</strong>
          This is a hackathon prototype. Real-world emergency dispatch, SMS, satellite communication, rescue-team coordination, and country-specific emergency integrations require supported infrastructure, authorized providers, hardware, APIs, and partnerships.
        </div>
      </div>
    </section>
  );
};
