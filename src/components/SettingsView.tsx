import React, { useState } from 'react';
import { AgencySettings } from '../types';
import { Building, CreditCard, Shield, RefreshCw, CheckCircle2 } from 'lucide-react';

interface SettingsViewProps {
  settings: AgencySettings;
  onSaveSettings: (settings: AgencySettings) => void;
  onResetDemoData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  onResetDemoData,
}) => {
  const [formData, setFormData] = useState<AgencySettings>({ ...settings });
  const [savedToast, setSavedToast] = useState(false);

  const handleChange = (field: keyof AgencySettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {savedToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Agency configuration and invoice bank settings updated.</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-neutral-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Agency & Billing Settings
        </h1>
        <p className="text-xs text-neutral-500 mt-1 font-mono">
          Configure agency letterhead, banking wire instructions, default currencies, and contract terms
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Agency Profile */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Building className="w-4 h-4 text-neutral-700" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 font-mono">
              Travel Agency Profile & Letterhead
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Agency Name</label>
              <input
                type="text"
                value={formData.agencyName}
                onChange={(e) => handleChange('agencyName', e.target.value)}
                required
                className="w-full border border-neutral-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full border border-neutral-300 rounded-lg p-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Operations Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="w-full border border-neutral-300 rounded-lg p-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full border border-neutral-300 rounded-lg p-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full border border-neutral-300 rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Headquarters Address (Appears on Invoices & Vouchers)</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full border border-neutral-300 rounded-lg p-2"
            />
          </div>
        </div>

        {/* Banking & Remittance Wire Instructions */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <CreditCard className="w-4 h-4 text-neutral-700" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 font-mono">
              Invoicing & Bank Remittance Instructions
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Tax Registration / EIN / VAT</label>
              <input
                type="text"
                value={formData.taxRegistrationNumber}
                onChange={(e) => handleChange('taxRegistrationNumber', e.target.value)}
                className="w-full border border-neutral-300 rounded-lg p-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Beneficiary Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                className="w-full border border-neutral-300 rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">SWIFT / BIC Code</label>
              <input
                type="text"
                value={formData.swiftBic}
                onChange={(e) => handleChange('swiftBic', e.target.value)}
                className="w-full border border-neutral-300 rounded-lg p-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">IBAN or Account Number</label>
              <input
                type="text"
                value={formData.ibanOrAccountNumber}
                onChange={(e) => handleChange('ibanOrAccountNumber', e.target.value)}
                className="w-full border border-neutral-300 rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Default Invoicing Terms & Deposit Conditions</label>
            <textarea
              rows={3}
              value={formData.termsConditions}
              onChange={(e) => handleChange('termsConditions', e.target.value)}
              className="w-full border border-neutral-300 rounded-lg p-2 leading-relaxed"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={onResetDemoData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg font-medium shadow-2xs transition-colors cursor-pointer"
          >
            Save Agency Settings
          </button>
        </div>
      </form>
    </div>
  );
};
