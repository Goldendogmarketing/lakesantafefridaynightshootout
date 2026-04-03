import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await auth();
  if (!session) redirect('/admin/login');

  const sql = getDb();
  const [pCount, wCount, weekCount, entryCount, unpaidCount] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM participants`,
    sql`SELECT COUNT(*) as count FROM waivers`,
    sql`SELECT COUNT(*) as count FROM tournament_weeks`,
    sql`SELECT COUNT(*) as count FROM week_entries we JOIN tournament_weeks tw ON tw.id = we.week_id WHERE tw.is_upcoming = true`,
    sql`SELECT COUNT(*) as count FROM week_entries we JOIN tournament_weeks tw ON tw.id = we.week_id WHERE tw.is_upcoming = true AND we.paid = false`,
  ]);

  const participantCount = Number(pCount[0].count);
  const waiverCount = Number(wCount[0].count);
  const weekCountNum = Number(weekCount[0].count);
  const upcomingEntries = Number(entryCount[0].count);
  const unpaidEntries = Number(unpaidCount[0].count);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard label="Total Participants" value={participantCount} icon="👥" color="bg-orange-50 text-[#c45e10]" />
        <StatCard label="Waivers Signed" value={waiverCount} icon="📝" color="bg-blue-50 text-blue-700" />
        <StatCard label="Tournament Weeks" value={weekCountNum} icon="📅" color="bg-purple-50 text-purple-700" />
        <StatCard label="Upcoming Entries" value={upcomingEntries} icon="🎣" color="bg-green-50 text-green-700" />
        <StatCard label="Unpaid (Upcoming)" value={unpaidEntries} icon="💰" color="bg-yellow-50 text-yellow-700" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/entries" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-2">📋 Weekly Entries</h2>
          <p className="text-gray-500">Manage signups and track payments for each week</p>
        </Link>
        <Link href="/admin/participants" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-2">👥 Participants</h2>
          <p className="text-gray-500">View all registered participants and history</p>
        </Link>
        <Link href="/admin/results" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-2">🏆 Results</h2>
          <p className="text-gray-500">Add and edit weekly tournament results</p>
        </Link>
        <Link href="/admin/waivers" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-2">📝 Waivers</h2>
          <p className="text-gray-500">View signed waivers and signatures</p>
        </Link>
        <Link href="/admin/settings" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-2">⚙️ Settings</h2>
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
