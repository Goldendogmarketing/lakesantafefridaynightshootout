import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import Link from "next/link";

export const dynamic = 'force-dynamic';

interface WaiverRow {
  id: number;
  participant_id: number;
  p1_name: string;
  p1_phone: string;
  p2_name: string | null;
  p1_signature_type: string;
  signed_at: string;
}

export default async function WaiversPage() {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const sql = getDb();
  const waivers = await sql`
    SELECT w.id, w.participant_id, w.p1_name, w.p1_phone, w.p2_name, w.p1_signature_type, w.signed_at
    FROM waivers w
    ORDER BY w.signed_at DESC
  ` as WaiverRow[];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Signed Waivers</h1>
      {waivers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No waivers signed yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Participant 1</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Participant 2</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Sig Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Signed</th>
                <th className="px-4 py-3 text-sm font-semibold text-gray-600"></th>
              </tr>
            </thead>
            <tbody>
              {waivers.map(w => (
                <tr key={w.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{w.p1_name}</td>
                  <td className="px-4 py-3 text-gray-600">{w.p1_phone}</td>
                  <td className="px-4 py-3 text-gray-600">{w.p2_name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      w.p1_signature_type === 'draw' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {w.p1_signature_type === 'draw' ? 'Drawn' : 'Typed'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{new Date(w.signed_at).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/waivers/${w.id}`} className="text-[#c45e10] hover:text-[#e8940c] text-sm font-medium">View &rarr;</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
