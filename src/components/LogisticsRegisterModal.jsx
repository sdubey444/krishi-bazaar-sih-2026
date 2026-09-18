import React, { useState } from 'react';
import { store } from '../services/store';
import {
  Truck,
  X,
  CheckCircle2,
  ShieldAlert,
  AlertCircle,
  FileText,
  User,
  Phone,
  MapPin,
  Scale
} from 'lucide-react';

export default function LogisticsRegisterModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('Mini Truck');
  const [vehicleModel, setVehicleModel] = useState('Tata 407');
  const [capacityTons, setCapacityTons] = useState(5);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [serviceArea, setServiceArea] = useState('Prayagraj');
  const [submitted, setSubmitted] = useState(false);
  const [registeredPartner, setRegisteredPartner] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || !vehicleNumber) return;

    const partnerData = {
      name,
      phone,
      vehicleType,
      vehicleModel,
      capacityTons: Number(capacityTons),
      vehicleNumber: vehicleNumber.toUpperCase().trim(),
      serviceArea
    };

    const newPartner = store.registerLogisticsPartner(partnerData);
    setRegisteredPartner(newPartner);
    setSubmitted(true);
  };

  const handleResetForm = () => {
    setName('');
    setPhone('');
    setVehicleNumber('');
    setSubmitted(false);
    setRegisteredPartner(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base">Become a Logistics Partner</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Service Provider
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Earn fair freight income delivering farm produce to buyers
              </p>
            </div>
          </div>

          <button
            onClick={handleResetForm}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-amber-600" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900">Application Submitted!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your vehicle details have been registered into the Krishi Bazaar fleet and are now <strong>Pending Admin Verification</strong>.
                </p>
              </div>

              {/* Registered Details Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="text-slate-500">Partner Name:</span>
                  <strong className="text-slate-800">{registeredPartner?.name}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="text-slate-500">Vehicle:</span>
                  <strong className="text-slate-800">{registeredPartner?.vehicleModel} ({registeredPartner?.vehicleType})</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="text-slate-500">Vehicle Number:</span>
                  <strong className="text-slate-900 font-mono font-black">{registeredPartner?.vehicleNumber}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="text-slate-500">Rated Capacity:</span>
                  <strong className="text-slate-800">{registeredPartner?.capacityTons} Ton ({registeredPartner?.capacityKg?.toLocaleString()} KG)</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200/80 pb-1.5">
                  <span className="text-slate-500">Service Area:</span>
                  <strong className="text-slate-800">{registeredPartner?.serviceArea}</strong>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">Verification Status:</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black uppercase">
                    Pending Verification
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 text-left max-w-sm mx-auto">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Admin will review your registration. Once approved, your vehicle will automatically receive matching delivery requests.
                </span>
              </div>

              <button
                onClick={handleResetForm}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow transition-colors"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Full Name <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs sm:text-sm bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mobile Number <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs sm:text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-white"
                  >
                    <option value="Mini Truck">Mini Truck (2-5 Ton)</option>
                    <option value="Medium Commercial Truck">Medium Truck (6-10 Ton)</option>
                    <option value="Heavy Multi-Axle Truck">Heavy Truck (11-15 Ton)</option>
                    <option value="Light Commercial Vehicle">Light Commercial (1-2.5 Ton)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">Vehicle Model</label>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="e.g. Tata 407, Eicher 2110"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-slate-500" />
                    <span>Payload Capacity</span>
                  </label>
                  <select
                    value={capacityTons}
                    onChange={(e) => setCapacityTons(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-white font-bold"
                  >
                    <option value={2.5}>2.5 Ton (2,500 KG)</option>
                    <option value={5}>5 Ton (5,000 KG)</option>
                    <option value={10}>10 Ton (10,000 KG)</option>
                    <option value={15}>15 Ton (15,000 KG)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-800">
                    Vehicle Number / Plate <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. UP70 AB 1234"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs font-mono font-bold uppercase bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Primary Service Area / Hub</span>
                </label>
                <select
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-xs bg-white"
                >
                  <option value="Prayagraj">Prayagraj & Surrounding Belts</option>
                  <option value="Kanpur">Kanpur Industrial & Mandi Hub</option>
                  <option value="Lucknow">Lucknow Central Depot</option>
                  <option value="Varanasi">Varanasi & Eastern UP</option>
                  <option value="Unnao">Unnao Regional Cluster</option>
                  <option value="Barabanki">Barabanki Agro Belt</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs space-y-1">
                <span className="font-bold text-slate-700 block">Transparent Payout Terms:</span>
                <p className="text-[11px] leading-relaxed">
                  Logistics partners receive <strong>90%</strong> of the total estimated trip delivery charge. Payout is processed upon buyer delivery receipt. Initial status will be <strong>Pending Verification</strong> until reviewed by State Admin.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow transition-colors flex items-center gap-1.5"
                >
                  <Truck className="w-4 h-4" />
                  <span>Submit Registration</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
