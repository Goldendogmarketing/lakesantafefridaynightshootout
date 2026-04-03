import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import Link from "next/link";
import type { ParticipantWithWaiver } from "@/types";

export const dynamic = 'force-dynamic';

export default async function ParticipantsPage() {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const sql = getDb();
  const participants = await sql`
    SELECT p.*,
      CASE WHEN w.id IS NOT NULL THEN 1 ELSE 0 END as waiver_signed,
      w.id as waiver_id,
      w.signed_at
    FROM participants p
    LEFT JOIN waivers w ON w.participant_id = p.id
    ORDER BY p.created_at DESC
  ` as ParticipantWithWaiver[];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Participants</h1>
      {participants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No participants registered yet.</p>
        </div>
      ) : (
        <>
          <div className="sm:hidden space-y-4">
            {participants.map(p => (
              <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">{p.full_name}</span>
                  {p.waiver_signed ? (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Signed</span>
                  ) : (
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">Unsigned</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{p.phone}</p>
                <p className="text-sm text-gray-500">Partner: {p.team_partner_name || 'N/A'}</p>
                {p.waiver_id && (
                  <Link href={`/admin/waivers/${p.waiver_id}`} className="text-sm text-[#c45e10] font-medium mt-2 inline-block">View Waiver &rarr;</Link>
                )}
              </div>
            ))}
          </div>
          <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Team Partner</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Waiver</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Registered</th>
                  <th className="px-4 py-3 text-sm font-semibold text-gray-600"></th>
                </tr>
              </thead>
              <tbody>
                {participants.map(p => (
                  <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{p.full_name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{p.team_partner_name || 'N/A'}</td>
                    <td className="px-4 py-3 text-center">
                      {p.waiver_signed ? (
                        <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Signed</span>
                      ) : (
                        <span className="inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">Unsigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {p.waiver_id && (
                        <Link href={`/admin/waivers/${p.waiver_id}`} className="text-[#c45e10] hover:text-[#e8940c] text-sm font-medium">View</Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
