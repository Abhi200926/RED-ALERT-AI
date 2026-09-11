import React, { useState } from 'react';
import { CountryEmergencyConfig } from '../types';
import {
  WORLDWIDE_COUNTRIES,
  LocationService,
} from '../services/locationService';
import { Globe, PhoneCall, ShieldAlert, ChevronDown, Check, X } from 'lucide-react';

interface WorldwideEmergencyBarProps {
  selectedCountry: CountryEmergencyConfig;
  onSelectCountry: (country: CountryEmergencyConfig) => void;
}

export const WorldwideEmergencyBar: React.FC<WorldwideEmergencyBarProps> = ({
  selectedCountry,
  onSelectCountry,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCountryPick = (country: CountryEmergencyConfig) => {
    LocationService.setDefaultCountryCode(country.code);
    onSelectCountry(country);
    setIsOpen(false);
  };

  return (
    <>
      <div className="bg-slate-900/90 border-b border-slate-800 text-xs text-slate-300">
        <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
          {/* Active Country & Universal Number */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="Change country / emergency region"
            >
              <span className="text-base leading-none">{selectedCountry.flag}</span>
              <span className="font-semibold">{selectedCountry.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            <span className="text-slate-500 hidden sm:inline">•</span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Emergency:</span>
              <a
                href={`tel:${selectedCountry.universalEmergency.split('/')[0].trim()}`}
                className="inline-flex items-center gap-1 font-mono-num font-bold text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-500/40 px-2 py-0.5 rounded transition"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Call {selectedCountry.universalEmergency}</span>
              </a>
            </div>
          </div>

          {/* Agency & Disclaimer hint */}
          <div className="hidden md:flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
            <span className="truncate max-w-xs">{selectedCountry.disasterAgency}</span>
          </div>
        </div>
      </div>

      {/* Country Selection Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-rose-400" />
                <h3 className="font-tech text-base font-bold uppercase tracking-wider text-white">
                  Worldwide Emergency Presets
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 max-h-[65vh] overflow-y-auto space-y-2">
              <p className="text-xs text-slate-400 mb-3">
                Select your operational country to adapt emergency phone numbers (e.g. 911, 999, 112, 119) and regional civil disaster authorities.
              </p>

              <div className="grid grid-cols-1 gap-2">
                {WORLDWIDE_COUNTRIES.map((country) => {
                  const isSelected = country.code === selectedCountry.code;
                  return (
                    <button
                      key={country.code}
                      onClick={() => handleCountryPick(country)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-rose-950/40 border-rose-500/60 text-white'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{country.flag}</span>
                        <div>
                          <div className="font-semibold text-sm flex items-center gap-2">
                            <span>{country.name}</span>
                            <span className="font-mono-num text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-rose-300 border border-slate-700">
                              Dial {country.universalEmergency}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {country.disasterAgency}
                          </div>
                        </div>
                      </div>

                      {isSelected && <Check className="w-5 h-5 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-slate-950 border-t border-slate-800 text-right">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
