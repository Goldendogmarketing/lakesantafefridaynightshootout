"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import type { TournamentWeek } from "@/types";

interface SignupFormProps {
  weeks: TournamentWeek[];
}

export default function SignupForm({ weeks }: SignupFormProps) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [weekId, setWeekId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasWaiver, setHasWaiver] = useState(true);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          partner_name: partnerName || null,
          week_id: parseInt(weekId),
        }),
      });

      const data = await res.json();

      if (res.status === 409) {
        setError(data.error || 'You are already signed up for this week!');
        return;
      }

      if (!res.ok) {
        setError(data.error || 'Failed to sign up. Please try again.');
        return;
      }

      setSuccess(true);
      setHasWaiver(data.hasWaiver);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-orange-100 p-8 text-center">
        <div className="text-6xl mb-4">🎣</div>
        <h2 className="text-2xl font-bold text-[#1a0e04] mb-2">You&apos;re Signed Up!</h2>
        <p className="text-gray-600 mb-6">
          Your spot is reserved. Remember to bring your <strong>${'$'}50 cash entry fee</strong> to the boat ramp.
        </p>

        {!hasWaiver && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 font-semibold mb-2">Waiver Required!</p>
            <p className="text-red-600 text-sm mb-3">You must sign the liability waiver before you can fish. No signature = no fishing.</p>
            <Link href="/waiver" className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
              Sign Waiver Now
            </Link>
          </div>
        )}

        {hasWaiver && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-green-700 font-semibold">Waiver is signed. You&apos;re all set!</p>
          </div>
        )}

        <div className="space-y-3">
          <Link href="/" className="block w-full bg-[#c45e10] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e8940c] transition-colors">
            Back to Home
          </Link>
          <Link href="/rules" className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            View Tournament Rules
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
        <h2 className="text-xl font-bold text-[#1a0e04] mb-4">Your Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text" required value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c45e10] focus:border-[#c45e10] text-gray-900"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
            <input
              type="tel" required value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c45e10] focus:border-[#c45e10] text-gray-900"
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Partner Name (optional)</label>
            <input
              type="text" value={partnerName}
              onChange={e => setPartnerName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c45e10] focus:border-[#c45e10] text-gray-900"
              placeholder="Your fishing partner's name"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-6">
        <h2 className="text-xl font-bold text-[#1a0e04] mb-4">Select Tournament Week *</h2>
        {weeks.length === 0 ? (
          <p className="text-gray-500">No upcoming tournaments scheduled yet. Check back soon!</p>
        ) : (
          <div className="space-y-2">
            {weeks.map(w => (
              <label
                key={w.id}
                className={`block border rounded-lg p-4 cursor-pointer transition-colors ${
                  weekId === String(w.id)
                    ? 'border-[#c45e10] bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <input
                  type="radio" name="week" value={w.id}
                  checked={weekId === String(w.id)}
                  onChange={e => setWeekId(e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#1a0e04]">Week {w.week_number}</p>
                    <p className="text-sm text-gray-500">{w.date} &bull; {w.location}</p>
                  </div>
                  {weekId === String(w.id) && (
                    <span className="text-[#c45e10] text-xl">&#10003;</span>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={submitting || !weekId || weeks.length === 0}
        className="w-full bg-[#c45e10] text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-[#e8940c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-900/30"
      >
        {submitting ? 'Signing Up...' : 'Sign Up for Tournament'}
      </button>

      <p className="text-center text-sm text-gray-500">
        Already signed up? Don&apos;t forget to <Link href="/waiver" className="text-[#c45e10] font-medium hover:underline">sign your waiver</Link>.
      </p>
    </form>
  );
}
