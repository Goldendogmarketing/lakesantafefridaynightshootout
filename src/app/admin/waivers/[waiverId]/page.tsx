import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import Link from "next/link";
import type { Waiver, Participant } from "@/types";

export const dynamic = 'force-dynamic';

export default async function WaiverDetailPage({ params }: { params: Promise<{ waiverId: string }> }) {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const { waiverId } = await params;
  const sql = getDb();

  const waivers = await sql`SELECT * FROM waivers WHERE id = ${waiverId}`;
  const waiver = waivers[0] as Waiver | undefined;
  if (!waiver) notFound();

  const participants = await sql`SELECT * FROM participants WHERE id = ${waiver.participant_id}`;
  const participant = participants[0] as Participant;

  return (
    <div>
      <Link href="/admin/waivers" className="text-[#c45e10] hover:text-[#e8940c] font-medium mb-4 inline-block">&larr; Back to Waivers</Link>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Waiver Details</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Participant 1 (Primary)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div><dt className="text-sm text-gray-500">Name</dt><dd className="font-medium text-gray-900">{waiver.p1_name}</dd></div>
          <div><dt className="text-sm text-gray-500">Phone</dt><dd className="font-medium text-gray-900">{waiver.p1_phone}</dd></div>
        </div>
        <SigDisplay data={waiver.p1_signature_data} type={waiver.p1_signature_type} label="Participant 1" />
      </div>

      {waiver.p2_name && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Participant 2</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div><dt className="text-sm text-gray-500">Name</dt><dd className="font-medium text-gray-900">{waiver.p2_name}</dd></div>
            <div><dt className="text-sm text-gray-500">Phone</dt><dd className="font-medium text-gray-900">{waiver.p2_phone || 'N/A'}</dd></div>
          </div>
          {waiver.p2_signature_data && waiver.p2_signature_type && (
            <SigDisplay data={waiver.p2_signature_data} type={waiver.p2_signature_type} label="Participant 2" />
          )}
        </div>
      )}

      {waiver.guardian_name && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Parent / Guardian</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div><dt className="text-sm text-gray-500">Name</dt><dd className="font-medium text-gray-900">{waiver.guardian_name}</dd></div>
            <div><dt className="text-sm text-gray-500">Relationship</dt><dd className="font-medium text-gray-900">{waiver.guardian_relationship || 'N/A'}</dd></div>
          </div>
          {waiver.guardian_signature_data && waiver.guardian_signature_type && (
            <SigDisplay data={waiver.guardian_signature_data} type={waiver.guardian_signature_type} label="Guardian" />
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Metadata</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div><dt className="text-gray-500">Signed At</dt><dd className="font-medium">{new Date(waiver.signed_at).toLocaleString()}</dd></div>
          <div><dt className="text-gray-500">IP Address</dt><dd className="font-medium">{waiver.ip_address || 'Unknown'}</dd></div>
          <div><dt className="text-gray-500">Registered</dt><dd className="font-medium">{new Date(participant.created_at).toLocaleString()}</dd></div>
        </dl>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Waiver Text (as signed)</h2>
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
          {waiver.waiver_text}
        </div>
      </div>
    </div>
  );
}

function SigDisplay({ data, type, label }: { data: string; type: string; label: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-2">{label} Signature ({type === 'draw' ? 'Hand Drawn' : 'Typed'})</p>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white text-center">
        {type === 'draw' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data} alt={`${label} signature`} className="max-w-full max-h-32 mx-auto" />
        ) : (
          <p className="signature-typed text-3xl text-gray-800">{data}</p>
        )}
      </div>
    </div>
  );
}
