import React, { useState, useEffect } from 'react';
import { locationService } from '../services/locationService';
import { INDIA_STATES_AND_UTS, INDIA_AGRICULTURAL_HUBS } from '../data/indiaLocationData';
import { MapPin, Navigation, Check, X, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

export default function LocationSelectorModal({ isOpen, onClose }) {
  const [currentLoc, setCurrentLoc] = useState(() => locationService.getLocationContext());
  const [selectedState, setSelectedState] = useState(currentLoc.state || 'Uttar Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState(currentLoc.district || 'Prayagraj');
  const [selectedMandi, setSelectedMandi] = useState(currentLoc.mandi || 'Mundera Mandi');
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState('');
  const [gpsStatusType, setGpsStatusType] = useState('info'); // 'info' | 'success' | 'error'

  useEffect(() => {
    return locationService.subscribe(loc => {
      setCurrentLoc(loc);
      setSelectedState(loc.state);
      setSelectedDistrict(loc.district);
      setSelectedMandi(loc.mandi);
    });
  }, []);

  if (!isOpen) return null;

  const stateData = INDIA_AGRICULTURAL_HUBS[selectedState];
  const availableDistricts = stateData?.districts || [];
  const activeDistrictObj = availableDistricts.find(d => d.name === selectedDistrict) || availableDistricts[0];
  const availableMandis = activeDistrictObj?.primaryMandis || [`${selectedDistrict} APMC`];

  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    const data = INDIA_AGRICULTURAL_HUBS[stateName];
    if (data && data.districts.length > 0) {
      const firstDist = data.districts[0];
      setSelectedDistrict(firstDist.name);
      setSelectedMandi(firstDist.primaryMandis[0] || `${firstDist.name} Mandi`);
    } else {
      setSelectedDistrict('Main District');
      setSelectedMandi('State Central Mandi');
    }
  };

  const handleDistrictChange = (distName) => {
    setSelectedDistrict(distName);
    const dist = availableDistricts.find(d => d.name === distName);
    if (dist && dist.primaryMandis.length > 0) {
      setSelectedMandi(dist.primaryMandis[0]);
    } else {
      setSelectedMandi(`${distName} Mandi`);
    }
  };

  const handleApplyLocation = () => {
    locationService.setManualLocation({
      state: selectedState,
      district: selectedDistrict,
      mandi: selectedMandi
    });
    setGpsStatusMessage('Location updated successfully.');
    setGpsStatusType('success');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleDetectGps = async () => {
    setIsLocatingGps(true);
    setGpsStatusMessage('Requesting device GPS coordinates...');
    setGpsStatusType('info');

    const result = await locationService.requestDeviceGps();
    setIsLocatingGps(false);

    if (result.success) {
      setGpsStatusMessage(`GPS detected! Nearest agricultural cluster: ${result.location.district}, ${result.location.state} (${result.location.mandi}).`);
      setGpsStatusType('success');
      setTimeout(() => {
        onClose();
      }, 900);
    } else {
      setGpsStatusMessage(result.error || 'GPS detection failed. Please select your location manually below.');
      setGpsStatusType('error');
    }
  };

  const quickHubs = [
    { label: 'Prayagraj (UP)', state: 'Uttar Pradesh', district: 'Prayagraj' },
    { label: 'Ludhiana (Punjab)', state: 'Punjab', district: 'Ludhiana' },
    { label: 'Nashik (Maharashtra)', state: 'Maharashtra', district: 'Nashik' },
    { label: 'Shimla (Himachal)', state: 'Himachal Pradesh', district: 'Shimla' },
    { label: 'Azadpur (Delhi)', state: 'Delhi', district: 'North Delhi' },
    { label: 'Coimbatore (TN)', state: 'Tamil Nadu', district: 'Coimbatore' },
    { label: 'Kota (Rajasthan)', state: 'Rajasthan', district: 'Kota' },
    { label: 'Rajkot (Gujarat)', state: 'Gujarat', district: 'Rajkot' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-brand-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Select Agricultural Location</h3>
              <p className="text-[11px] text-emerald-100">India-Wide Market & Logistics Context</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Active Detected Location Pill */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-700 block">
                Current Active Location
              </span>
              <p className="text-sm font-black text-slate-900">
                {currentLoc.mandi ? `${currentLoc.mandi}, ` : ''}{currentLoc.district}, {currentLoc.state}
              </p>
              <span className="text-[10px] text-slate-500">
                Source: {currentLoc.source === 'gps' ? 'Device GPS (Verified)' : currentLoc.isManual ? 'User Selected' : 'Platform Default'}
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Check className="w-4 h-4" />
            </div>
          </div>

          {/* GPS Locate Button */}
          <div>
            <button
              onClick={handleDetectGps}
              disabled={isLocatingGps}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black shadow transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLocatingGps ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Acquiring GPS Position...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4 text-amber-300" />
                  <span>Use My Device Location (Dynamic GPS)</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-400 mt-1 text-center">
              Requires browser location permission. Real coordinates only; never simulated.
            </p>
          </div>

          {gpsStatusMessage && (
            <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              gpsStatusType === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' :
              gpsStatusType === 'error' ? 'bg-rose-100 text-rose-900 border border-rose-200' :
              'bg-blue-100 text-blue-900 border border-blue-200'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{gpsStatusMessage}</span>
            </div>
          )}

          {/* Quick Select Hub Chips */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-600">Quick Agricultural Hubs:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickHubs.map(hub => (
                <button
                  key={hub.label}
                  onClick={() => {
                    setSelectedState(hub.state);
                    handleStateChange(hub.state);
                    handleDistrictChange(hub.district);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-800 text-[11px] font-semibold text-slate-700 border border-slate-200 transition-colors"
                >
                  {hub.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hierarchical Dropdowns */}
          <div className="space-y-3 pt-1 border-t border-slate-100">
            {/* 1. State / UT */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">1. State / Union Territory</label>
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {INDIA_STATES_AND_UTS.map(st => (
                  <option key={st.code} value={st.name}>
                    {st.name} ({st.type === 'Union Territory' ? 'UT' : 'State'})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. District */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">2. District / Agricultural Zone</label>
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {availableDistricts.length > 0 ? (
                  availableDistricts.map(d => (
                    <option key={d.name} value={d.name}>
                      {d.name}
                    </option>
                  ))
                ) : (
                  <option value={selectedDistrict}>{selectedDistrict}</option>
                )}
              </select>
            </div>

            {/* 3. Primary Mandi */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">3. Primary Mandi / Market Yard</label>
              <select
                value={selectedMandi}
                onChange={(e) => setSelectedMandi(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {availableMandis.map(m => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApplyLocation}
              className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold shadow-sm transition-colors"
            >
              Set Active Location
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
