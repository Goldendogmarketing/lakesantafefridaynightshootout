import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const db = getDb();
  const participantCount = (db.prepare('SELECT COUNT(*) as count FROM participants').get() as { count: number }).count;
  const waiverCount = (db.prepare('SELECT COUNT(*) as count FROM waivers').get() as { count: number }).count;
  const weekCount = (db.prepare('SELECT COUNT(*) as count FROM tournament_weeks').get() as { count: number }).count;
  const unsignedCount = participantCount - waiverCount;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Participants" value={participantCount} icon="👥" color="bg-emerald-50 text-emerald-700" />
        <StatCard label="Waivers Signed" value={waiverCount} icon="📝" color="bg-blue-50 text-blue-700" />
        <StatCard label="Unsigned Waivers" value={unsignedCount} icon="⚠️" color="bg-yellow-50 text-yellow-700" />
        <StatCard label="Tournament Weeks" value={weekCount} icon="📅" color="bg-purple-50 text-purple-700" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Link href="/admin/participants" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-2">👥 Manage Participants</h2>
          <p className="text-gray-500">View all registered participants and their waiver status</p>
        </Link>
        <Link href="/admin/results" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-2">🏆 Manage Results</h2>
          <p className="text-gray-500">Add and edit weekly tournament results</p>
        </Link>
        <Link href="/admin/waivers" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-2">📝 Review Waivers</h2>
          <p className="text-gray-500">View signed waivers and signatures</p>
        </Link>
        <Link href="/admin/settings" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-2">⚙️ Tournament Settings</h2>
          <p className="text-gray-500">Update tournament info and announcements</p>
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div className={`rounded-xl p-6 ${color}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm font-medium mt-1">{label}</p>
    </div>
  );
}
