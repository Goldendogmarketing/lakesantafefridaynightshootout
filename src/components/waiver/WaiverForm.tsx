"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import SignatureDraw from "./SignatureDraw";
import SignatureType from "./SignatureType";

interface WaiverFormProps {
  waiverText: string;
}

type SigMode = 'draw' | 'type';

export default function WaiverForm({ waiverText }: WaiverFormProps) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showP2, setShowP2] = useState(false);
  const [showGuardian, setShowGuardian] = useState(false);

  // Participant 1
  const [p1Name, setP1Name] = useState('');
  const [p1Phone, setP1Phone] = useState('');
  const [p1SigMode, setP1SigMode] = useState<SigMode>('draw');
  const [p1SigData, setP1SigData] = useState('');

  // Participant 2
  const [p2Name, setP2Name] = useState('');
  const [p2Phone, setP2Phone] = useState('');
  const [p2SigMode, setP2SigMode] = useState<SigMode>('draw');
  const [p2SigData, setP2SigData] = useState('');

  // Guardian
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('');
  const [guardianSigMode, setGuardianSigMode] = useState<SigMode>('draw');
  const [guardianSigData, setGuardianSigData] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!p1SigData) {
      setError('Participant 1 signature is required.');
      return;
    }
    if (showP2 && p2Name && !p2SigData) {
      setError('Participant 2 signature is required if name is provided.');
      return;
    }
    if (showGuardian && guardianName && !guardianSigData) {
      setError('Parent/Guardian signature is required if name is provided.');
      return;
    }
    if (!agreed) {
      setError('Please agree to the waiver terms.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/waiver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          p1_name: p1Name,
          p1_phone: p1Phone,
          p1_signature_data: p1SigData,
          p1_signature_type: p1SigMode,
          p2_name: showP2 && p2Name ? p2Name : null,
          p2_phone: showP2 && p2Phone ? p2Phone : null,
          p2_signature_data: showP2 && p2SigData ? p2SigData : null,
          p2_signature_type: showP2 && p2SigData ? p2SigMode : null,
          guardian_name: showGuardian && guardianName ? guardianName : null,
          guardian_relationship: showGuardian && guardianRelationship ? guardianRelationship : null,
          guardian_signature_data: showGuardian && guardianSigData ? guardianSigData : null,
          guardian_signature_type: showGuardian && guardianSigData ? guardianSigMode : null,
          waiver_text: waiverText,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to submit waiver. Please try again.');
        return;
      }

      router.push('/waiver/confirmation');
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Waiver Text */}
      <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
        <h2 className="text-xl font-bold text-[#1a0e04] mb-4">Liability Waiver & Release</h2>
        <div className="max-h-72 overflow-y-auto bg-[#faf6f0] border border-orange-200 rounded-lg p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {waiverText}
        </div>
      </div>

      {/* Participant 1 - Required */}
      <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold text-[#1a0e04]">Participant 1</h2>
          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Required</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Print Name *</label>
            <input
              type="text" required value={p1Name}
              onChange={e => setP1Name(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c45e10] focus:border-[#c45e10] text-gray-900"
              placeholder="Full legal name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              type="tel" required value={p1Phone}
              onChange={e => setP1Phone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c45e10] focus:border-[#c45e10] text-gray-900"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <SignatureBlock
          label="Participant 1 Signature"
          sigMode={p1SigMode}
          onModeChange={(m) => { setP1SigMode(m); setP1SigData(''); }}
          onSignatureChange={setP1SigData}
        />
      </div>

      {/* Participant 2 Toggle */}
      {!showP2 && (
        <button
          type="button"
          onClick={() => setShowP2(true)}
          className="w-full border-2 border-dashed border-orange-300 rounded-xl py-4 text-[#c45e10] font-medium hover:bg-orange-50 transition-colors"
        >
          + Add Participant 2
        </button>
      )}

      {/* Participant 2 - Optional */}
      {showP2 && (
        <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1a0e04]">Participant 2</h2>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">Optional</span>
            </div>
            <button type="button" onClick={() => { setShowP2(false); setP2Name(''); setP2Phone(''); setP2SigData(''); }}
              className="text-sm text-red-600 hover:text-red-800 font-medium">Remove</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Print Name</label>
              <input
                type="text" value={p2Name}
                onChange={e => setP2Name(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c45e10] focus:border-[#c45e10] text-gray-900"
                placeholder="Full legal name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel" value={p2Phone}
                onChange={e => setP2Phone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c45e10] focus:border-[#c45e10] text-gray-900"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <SignatureBlock
            label="Participant 2 Signature"
            sigMode={p2SigMode}
            onModeChange={(m) => { setP2SigMode(m); setP2SigData(''); }}
            onSignatureChange={setP2SigData}
          />
        </div>
      )}

      {/* Guardian Toggle */}
      {!showGuardian && (
        <button
          type="button"
          onClick={() => setShowGuardian(true)}
          className="w-full border-2 border-dashed border-orange-300 rounded-xl py-4 text-[#c45e10] font-medium hover:bg-orange-50 transition-colors"
        >
          + Add Parent / Guardian (required if under 18)
        </button>
      )}

      {/* Guardian - Optional */}
      {showGuardian && (
        <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-[#1a0e04]">Parent / Guardian</h2>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">If under 18</span>
            </div>
            <button type="button" onClick={() => { setShowGuardian(false); setGuardianName(''); setGuardianRelationship(''); setGuardianSigData(''); }}
              className="text-sm text-red-600 hover:text-red-800 font-medium">Remove</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Print Name</label>
              <input
                type="text" value={guardianName}
                onChange={e => setGuardianName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c45e10] focus:border-[#c45e10] text-gray-900"
                placeholder="Guardian full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
              <input
                type="text" value={guardianRelationship}
                onChange={e => setGuardianRelationship(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c45e10] focus:border-[#c45e10] text-gray-900"
                placeholder="e.g., Parent, Legal Guardian"
              />
            </div>
          </div>

          <SignatureBlock
            label="Parent/Guardian Signature"
            sigMode={guardianSigMode}
            onModeChange={(m) => { setGuardianSigMode(m); setGuardianSigData(''); }}
            onSignatureChange={setGuardianSigData}
          />
        </div>
      )}

      {/* Date */}
      <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Date:</span>
          <span className="font-medium text-gray-900">
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-2">Tournament Director: Nick Foster &bull; Lake Santa Fe Friday Night Shoot Out &bull; Melrose, Florida</p>
      </div>

      {/* Agreement Checkbox */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox" checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-1 w-5 h-5 text-[#c45e10] rounded focus:ring-[#c45e10] accent-[#c45e10]"
          />
          <span className="text-sm text-gray-700 font-medium">
            I HAVE READ THIS WAIVER, UNDERSTAND IT, AND SIGN IT VOLUNTARILY. I understand that by signing, I am giving up legal rights and remedies.
          </span>
        </label>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#c45e10] text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-[#e8940c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-900/30"
      >
        {submitting ? 'Submitting...' : 'Sign & Submit Waiver'}
      </button>
    </form>
  );
}

function SignatureBlock({
  label,
  sigMode,
  onModeChange,
  onSignatureChange,
}: {
  label: string;
  sigMode: SigMode;
  onModeChange: (mode: SigMode) => void;
  onSignatureChange: (data: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="flex rounded-lg border border-gray-300 overflow-hidden mb-3">
        <button
          type="button"
          onClick={() => onModeChange('draw')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            sigMode === 'draw' ? 'bg-[#1a0e04] text-[#f5b731]' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Draw Signature
        </button>
        <button
          type="button"
          onClick={() => onModeChange('type')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            sigMode === 'type' ? 'bg-[#1a0e04] text-[#f5b731]' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Type Signature
        </button>
      </div>
      {sigMode === 'draw' ? (
        <SignatureDraw onSignatureChange={onSignatureChange} />
      ) : (
        <SignatureType onSignatureChange={onSignatureChange} />
      )}
    </div>
  );
}
