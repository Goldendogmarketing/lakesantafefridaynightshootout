"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface ParticipantDetail {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  team_partner_name: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  waiver_signed: number;
  waiver_id: number | null;
  created_at: string;
}

interface WeekHistoryEntry {
  id: number;
  week_id: number;
  week_number: number;
  date: string;
  location: string;
  paid: boolean;
  boat_number: string | null;
  signup_source: string;
}

export default function ParticipantDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [participant, setParticipant] = useState<ParticipantDetail | null>(null);
  const [history, setHistory] = useState<WeekHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/admin/login');
  }, [status, router]);

  useEffect(() => {
    if (params.id) loadData();
  }, [params.id]);

  async function loadData() {
    const res = await fetch(`/api/participants/${params.id}`);
    if (res.ok) {
      const data = await res.json();
      setParticipant(data.participant);
      setHistory(data.weekHistory);
    }
    setLoading(false);
  }

  if (status === 'loading' || loading) return <div className="p-8">Loading...</div>;
  if (!session || !participant) return null;

  return (
    <div>
      <Link href="/admin/participants" className="text-[#c45e10] hover:text-[#e8940c] font-medium mb-4 inline-block">
        &larr; Back to Participants
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">{participant.full_name}</h1>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Info</h2>
          <dl className="space-y-3">
            <div><dt className="text-sm text-gray-500">Phone</dt><dd className="font-medium text-gray-900">{participant.phone}</dd></div>
            {participant.email && <div><dt className="text-sm text-gray-500">Email</dt><dd className="font-medium text-gray-900">{participant.email}</dd></div>}
            <div><dt className="text-sm text-gray-500">Team Partner</dt><dd className="font-medium text-gray-900">{participant.team_partner_name || 'N/A'}</dd></div>
            {participant.emergency_contact_name && (
              <div><dt className="text-sm text-gray-500">Emergency Contact</dt><dd className="font-medium text-gray-900">{participant.emergency_contact_name} - {participant.emergency_contact_phone}</dd></div>
            )}
            <div><dt className="text-sm text-gray-500">Registered</dt><dd className="font-medium text-gray-900">{new Date(participant.created_at).toLocaleDateString()}</dd></div>
          </dl>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Status</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{participant.waiver_signed ? '✅' : '❌'}</span>
              <div>
                <p className="font-medium text-gray-900">Waiver {participant.waiver_signed ? 'Signed' : 'Not Signed'}</p>
                {participant.waiver_id && (
                  <Link href={`/admin/waivers/${participant.waiver_id}`} className="text-sm text-[#c45e10] hover:underline">View waiver</Link>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎣</span>
              <div>
                <p className="font-medium text-gray-900">{history.length} Week{history.length !== 1 ? 's' : ''} Fished</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Week History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Tournament History</h2>
        </div>
        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No tournament entries yet.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Week</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Boat #</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Paid</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Source</th>
              </tr>
            </thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">Week {h.week_number}</td>
                  <td className="px-4 py-3 text-gray-600">{h.date} - {h.location}</td>
                  <td className="px-4 py-3 text-center text-gray-600">{h.boat_number || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    {h.paid ? (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Paid</span>
                    ) : (
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">Unpaid</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      h.signup_source === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}>{h.signup_source}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
