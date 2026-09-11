import React, { useState } from 'react';
import { DisasterType } from '../types';
import { SAFETY_GUIDES } from '../data/mockDisasters';
import {
  ShieldAlert,
  ShieldCheck,
  PhoneCall,
  Luggage,
  Waves,
  Wind,
  Activity,
  Mountain,
  CloudLightning,
  Flame,
  Anchor,
  SunMedium,
  CheckSquare,
  Square,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const SafetyCenterView: React.FC = () => {
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterType>('Flood');
  const [activeTab, setActiveTab] = useState<'during' | 'before' | 'after'>('during');

  // Interactive Emergency Go-Bag checklist
  const [goBagItems, setGoBagItems] = useState<Record<string, boolean>>({
    'Potable Water (4 liters per person/day)': true,
    '3-Day Supply of Non-Perishable Food': true,
    'Battery-powered or Hand-crank NOAA Radio': true,
    'High-intensity LED Flashlight & Extra Batteries': true,
    'Comprehensive First Aid Kit & Prescription Meds': false,
    'Multi-tool / Swiss Army Knife': false,
    'Emergency Thermal Mylar Blanket': true,
    'Whistle (to signal for help)': false,
    'N95 Particle Filter Respirator Masks': true,
    'Waterproof Pouch with Passports & Insurance Docs': false,
    'Portable Power Bank & Phone Cables': true,
  });

  const toggleGoBag = (item: string) => {
    setGoBagItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const getDisasterIcon = (type: DisasterType) => {
    switch (type) {
      case 'Flood': return Waves;
      case 'Cyclone': return Wind;
      case 'Earthquake': return Activity;
      case 'Landslide': return Mountain;
      case 'Severe Storm': return CloudLightning;
      case 'Wildfire': return Flame;
      case 'Tsunami': return Anchor;
      case 'Extreme Heat': return SunMedium;
      default: return ShieldCheck;
    }
  };

  const currentGuide = SAFETY_GUIDES[selectedDisaster];
  const CurrentIcon = getDisasterIcon(selectedDisaster);

  const completedCount = Object.values(goBagItems).filter(Boolean).length;
  const totalCount = Object.keys(goBagItems).length;

  return (
    <div id="safety-center-view" className="space-y-8 animate-in fade-in duration-300">
      {/* Paramount Official Authority Disclaimer Banner */}
      <div className="rounded-2xl border-2 border-rose-500/50 bg-gradient-to-r from-rose-950/40 via-slate-900 to-rose-950/40 p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/40 flex-shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-tech text-lg sm:text-xl font-bold uppercase text-white tracking-wide">
              Official Emergency Safety Center
            </h1>
            <p className="text-sm font-semibold text-rose-300 mt-0.5">
              “Always follow instructions from official emergency authorities.”
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-300 max-w-sm text-center sm:text-right font-medium">
          In any active crisis, obey evacuation orders issued by local police, firefighters, and civil defense agencies immediately.
        </div>
      </div>

      {/* Disaster Selector Horizontal Ribbon */}
      <div>
        <h2 className="text-xs font-tech uppercase tracking-wider text-slate-400 mb-3">
          Select Disaster Preparedness Guide
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {(Object.keys(SAFETY_GUIDES) as DisasterType[]).map((type) => {
            const Icon = getDisasterIcon(type);
            const isSelected = selectedDisaster === type;

            return (
              <button
                key={type}
                id={`safety-tab-${type.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSelectedDisaster(type)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-rose-400'}`} />
                <span className="font-tech text-xs font-bold tracking-wide leading-tight">
                  {type}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Guide Details Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-rose-400">
              <CurrentIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-tech text-xl font-bold text-white uppercase tracking-wider">
                {currentGuide.disasterType} Action Protocols
              </h3>
              <p className="text-xs text-slate-400 max-w-xl mt-0.5 leading-relaxed">
                {currentGuide.summary}
              </p>
            </div>
          </div>

          {/* Before / During / After Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              id="guide-tab-before"
              onClick={() => setActiveTab('before')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'before'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Before (Preparation)
            </button>
            <button
              id="guide-tab-during"
              onClick={() => setActiveTab('during')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'during'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              During (Active Crisis)
            </button>
            <button
              id="guide-tab-after"
              onClick={() => setActiveTab('after')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'after'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              After (Recovery)
            </button>
          </div>
        </div>

        {/* Action Items List */}
        <div className="space-y-3">
          <h4 className="text-xs font-tech uppercase tracking-wider text-rose-400 font-bold">
            {activeTab === 'during'
              ? 'Immediate Life-Safety Directives (During Event)'
              : activeTab === 'before'
              ? 'Preparedness & Mitigation Actions (Before Event)'
              : 'Post-Disaster Safety & Inspection (After Event)'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentGuide[activeTab].map((instruction, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-sm text-slate-200 leading-relaxed"
              >
                <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-mono-num text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border border-rose-500/40">
                  {idx + 1}
                </span>
                <span>{instruction}</span>
              </div>
            ))}
          </div>

          {/* Evacuation Tip Highlight */}
          <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-3 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">Evacuation Priority Tip: </span>
              {currentGuide.evacuationTip}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Emergency Go-Bag + Emergency Hotlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Go-Bag Checklist */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Luggage className="w-5 h-5 text-rose-400" />
              <h3 className="font-tech text-base font-bold text-white uppercase tracking-wider">
                Emergency Go-Bag Checklist (72-Hour Survival Kit)
              </h3>
            </div>
            <span className="text-xs font-mono-num font-semibold text-rose-400 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
              {completedCount} / {totalCount} Packed
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Keep this pre-packed backpack by your front exit for instant Grab-and-Go evacuation:
          </p>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {Object.entries(goBagItems).map(([item, checked]) => (
              <button
                key={item}
                onClick={() => toggleGoBag(item)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-xs transition-all ${
                  checked
                    ? 'bg-slate-950/80 border-emerald-500/30 text-slate-200'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                {checked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                )}
                <span className={checked ? 'line-through text-slate-400' : 'font-medium'}>
                  {item}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Global Emergency Hotlines Directory */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2.5">
            <PhoneCall className="w-5 h-5 text-rose-400" />
            <h3 className="font-tech text-base font-bold text-white uppercase tracking-wider">
              Emergency Contacts Directory
            </h3>
          </div>

          <p className="text-xs text-slate-400">
            Memorize or keep offline hard copies of these vital emergency service numbers:
          </p>

          <div className="space-y-2.5">
            {[
              { region: 'North America (USA & Canada)', number: '911', desc: 'All Emergencies (Police, Fire, EMS)' },
              { region: 'European Union & UK', number: '112 / 999', desc: 'Unified European Emergency Line' },
              { region: 'Asia-Pacific (Japan / Korea)', number: '119 (Fire/EMS) / 110 (Police)', desc: 'Direct Dispatch Services' },
              { region: 'Australia & New Zealand', number: '000 / 111', desc: 'Triple Zero Emergency Network' },
              { region: 'International Disaster Relief (Red Cross)', number: '+1-800-RED-CROSS', desc: 'Disaster Shelter & Relief Inquiry' },
            ].map((contact, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="text-[11px] text-slate-400 block font-normal">{contact.region}</span>
                  <span className="text-xs text-slate-300 font-medium">{contact.desc}</span>
                </div>
                <span className="text-xs font-mono-num font-bold px-2.5 py-1 rounded bg-rose-950/60 text-rose-300 border border-rose-500/30">
                  {contact.number}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
