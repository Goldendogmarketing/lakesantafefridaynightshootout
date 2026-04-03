"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { TournamentWeek, WeekEntryWithParticipant, Participant } from "@/types";

interface Stats {
  totalBoats: number;
  totalPaid: number;
  totalUnpaid: number;
  totalPot: number;
}

export default function AdminEntriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [weeks, setWeeks] = useState<TournamentWeek[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [entries, setEntries] = useState<WeekEntryWithParticipant[]>([]);
  const [stats, setStats] = useState<Stats>({ totalBoats: 0, totalPaid: 0, totalUnpaid: 0, totalPot: 0 });
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<number | null>(null);
  const [boatNumber, setBoatNumber] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  useEffect(() => { loadWeeks(); loadParticipants(); }, []);
  useEffect(() => { if (selectedWeek) loadEntries(selectedWeek); }, [selectedWeek]);

  async function loadWeeks() {
    const res = await fetch('/api/weeks');
    const data = await res.json();
    setWeeks(data);
    if (data.length > 0 && !selectedWeek) setSelectedWeek(data[0].id);
  }

  async function loadEntries(weekId: number) {
    const res = await fetch(`/api/entries?weekId=${weekId}`);
    const data = await res.json();
    setEntries(data.entries);
    setStats(data.stats);
  }

  async function loadParticipants() {
    const res = await fetch('/api/participants');
    if (res.ok) {
      const data = await res.json();
      setParticipants(data);
    }
  }

  async function handleAddEntry(e: FormEvent) {
    e.preventDefault();
    if (!selectedParticipant || !selectedWeek) return;

    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participant_id: selectedParticipant,
        week_id: selectedWeek,
        boat_number: boatNumber || null,
      }),
    });

    if (res.status === 409) {
      alert('This participant is already entered for this week.');
      return;
    }

    setSelectedParticipant(null);
    setBoatNumber('');
    setSearchTerm('');
    loadEntries(selectedWeek);
  }

  async function togglePaid(entryId: number, currentPaid: boolean) {
    setEntries(prev => prev.map(e => e.id === entryId ? { ...e, paid: !currentPaid } : e));
    await fetch('/api/entries', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: entryId, paid: !currentPaid }),
    });
    if (selectedWeek) loadEntries(selectedWeek);
  }

  async function handleRemoveEntry(id: number) {
    if (!confirm('Remove this entry?')) return;
    await fetch('/api/entries', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (selectedWeek) loadEntries(selectedWeek);
  }

  const enteredIds = new Set(entries.map(e => e.participant_id));
  const filteredParticipants = participants.filter(p =>
    !enteredIds.has(p.id) &&
    (p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.phone.includes(searchTerm))
  );

  if (status === 'loading') return <div className="p-8">Loading...</div>;
  if (!session) return null;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Weekly Entries</h1>

      {/* Week Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Select Tournament Week</h2>
        <div className="flex flex-wrap gap-2">
          {weeks.map(w => (
            <button
              key={w.id}
              onClick={() => setSelectedWeek(w.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedWeek === w.id
                  ? 'bg-[#1a0e04] text-[#f5b731]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Week {w.week_number} ({w.date})
            </button>
          ))}
          {weeks.length === 0 && <p className="text-gray-500">No weeks created yet. Create one in Results management.</p>}
        </div>
      </div>

      {selectedWeek && (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-[#1a0e04]">{stats.totalBoats}</p>
              <p className="text-sm text-gray-500">Total Boats</p>
            </div>
            <div className="bg-green-50 rounded-xl shadow-sm border border-green-200 p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{stats.totalPaid}</p>
              <p className="text-sm text-green-600">Paid</p>
            </div>
            <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-4 text-center">
              <p className="text-2xl font-bold text-red-700">{stats.totalUnpaid}</p>
              <p className="text-sm text-red-600">Unpaid</p>
            </div>
            <div className="bg-orange-50 rounded-xl shadow-sm border border-orange-200 p-4 text-center">
              <p className="text-2xl font-bold text-[#c45e10]">${stats.totalPot}</p>
              <p className="text-sm text-[#c45e10]">Total Pot</p>
            </div>
          </div>

          {/* Add Participant */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Add Participant to Week</h2>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Participant</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setSelectedParticipant(null); }}
                    placeholder="Search by name or phone..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  {searchTerm && !selectedParticipant && filteredParticipants.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredParticipants.slice(0, 10).map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => { setSelectedParticipant(p.id); setSearchTerm(p.full_name); }}
                          className="w-full px-4 py-2 text-left hover:bg-orange-50 flex justify-between items-center"
                        >
                          <span className="font-medium text-gray-900">{p.full_name}</span>
                          <span className="text-sm text-gray-500">{p.phone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedParticipant && (
                    <p className="text-xs text-green-600 mt-1">Selected: {participants.find(p => p.id === selectedParticipant)?.full_name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Boat # (optional)</label>
                  <input
                    type="text"
                    value={boatNumber}
                    onChange={e => setBoatNumber(e.target.value)}
                    placeholder="e.g., 12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!selectedParticipant}
                className="bg-[#c45e10] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#e8940c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Week
              </button>
            </form>
          </div>

          {/* Entries Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Mobile cards */}
            <div className="sm:hidden">
              {entries.length === 0 && (
                <div className="p-8 text-center text-gray-500">No entries for this week yet.</div>
              )}
              {entries.map(entry => (
                <div key={entry.id} className="p-4 border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900">{entry.full_name}</span>
                    <button
                      onClick={() => togglePaid(entry.id, entry.paid)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        entry.paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {entry.paid ? 'PAID' : 'UNPAID'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">{entry.phone}</p>
                  {entry.team_partner_name && <p className="text-sm text-gray-500">Partner: {entry.team_partner_name}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    {entry.boat_number && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Boat #{entry.boat_number}</span>}
                    {entry.waiver_signed ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Waiver Signed</span>
                    ) : (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">No Waiver</span>
                    )}
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{entry.signup_source}</span>
                  </div>
                  <button onClick={() => handleRemoveEntry(entry.id)} className="text-red-600 text-sm font-medium mt-2">Remove</button>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <table className="w-full hidden sm:table">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Partner</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Boat #</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Waiver</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Paid</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Source</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{entry.full_name}</td>
                    <td className="px-4 py-3 text-gray-600">{entry.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{entry.team_partner_name || '-'}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{entry.boat_number || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      {entry.waiver_signed ? (
                        <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Signed</span>
                      ) : (
                        <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">Missing</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => togglePaid(entry.id, entry.paid)}
                        className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                          entry.paid
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {entry.paid ? 'PAID' : 'UNPAID'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        entry.signup_source === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {entry.signup_source === 'online' ? 'Online' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleRemoveEntry(entry.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
                    </td>
                  </tr>
                ))}
                {entries.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No entries for this week yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
