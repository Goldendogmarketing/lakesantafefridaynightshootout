import Link from "next/link";
import { getDb } from "@/lib/db";
import type { Result, TournamentWeek } from "@/types";

async function getSettings(): Promise<Record<string, string>> {
  const sql = getDb();
  const rows = await sql`SELECT key, value FROM tournament_settings`;
  const settings: Record<string, string> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
}

async function getLastWeekResults(): Promise<{ week: TournamentWeek | null; results: Result[]; bigBass: Result | null }> {
  const sql = getDb();
  const weeks = await sql`SELECT * FROM tournament_weeks WHERE is_upcoming = false ORDER BY date DESC LIMIT 1`;
  const week = weeks[0] as TournamentWeek | undefined;

  if (!week) return { week: null, results: [], bigBass: null };

  const results = await sql`
    SELECT * FROM results WHERE week_id = ${week.id} ORDER BY placement ASC, total_weight DESC LIMIT 5
  ` as Result[];

  const bigBassRows = await sql`
    SELECT * FROM results WHERE week_id = ${week.id} AND big_bass_weight IS NOT NULL ORDER BY big_bass_weight DESC LIMIT 1
  `;

  return { week, results, bigBass: (bigBassRows[0] as Result) || null };
}

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const settings = await getSettings();
  const { week: lastWeek, results: lastResults, bigBass } = await getLastWeekResults();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1a0e04] via-[#4a2008] to-[#7c3a0e] text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-orange-900/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-2">
            <span className="text-[#f5b731]">Lake Santa Fe</span>
          </h1>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-1">Friday Night</h2>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#e8940c] mb-2">SHOOT OUT</h2>
          <p className="text-xl text-orange-200/70 italic">Bass Tournament</p>
          <p className="text-lg sm:text-xl text-orange-200/80 mb-2">
            Melrose, Florida &bull; Friday Nights &bull; 6 PM - 9 PM
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/waiver" className="bg-[#c45e10] text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-[#e8940c] transition-colors shadow-lg shadow-orange-900/50">
              Sign Waiver & Register
            </Link>
            <Link href="/results" className="bg-white/10 backdrop-blur text-white border border-[#f5b731]/40 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/20 transition-colors">
              View Results
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Tournament */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#1a0e04] to-[#4a2008] px-6 py-4">
            <h2 className="text-2xl font-bold text-[#f5b731]">Upcoming Tournament</h2>
          </div>
          <div className="p-6 sm:p-8">
            {settings.upcoming_announcement && (
              <p className="text-lg text-gray-700 mb-6 bg-orange-50 p-4 rounded-lg border-l-4 border-[#c45e10]">
                {settings.upcoming_announcement}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <InfoCard label="Date" value={settings.upcoming_date || 'TBA'} icon="📅" />
              <InfoCard label="Time" value={settings.upcoming_time || '6 PM - 9 PM'} icon="⏰" />
              <InfoCard label="Location" value={settings.upcoming_location || 'Lake Santa Fe, Melrose FL'} icon="📍" />
              <InfoCard label="Entry Fee" value={settings.upcoming_entry_fee || 'TBA'} icon="💰" />
            </div>
            <div className="mt-8 text-center">
              <Link href="/waiver" className="inline-block bg-[#c45e10] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#e8940c] transition-colors">
                Sign Waiver to Participate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Last Week's Winners */}
      {lastWeek && lastResults.length > 0 && (
        <section className="bg-[#2a1506]/5 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-2 text-[#1a0e04]">Last Week&apos;s Results</h2>
            <p className="text-gray-500 text-center mb-8">
              Week {lastWeek.week_number} &mdash; {lastWeek.date} at {lastWeek.location}
            </p>

            {bigBass && bigBass.big_bass_weight && (
              <div className="bg-gradient-to-r from-[#f5b731]/20 to-[#e8940c]/20 border-2 border-[#f5b731] rounded-xl p-6 mb-8 text-center max-w-md mx-auto">
                <p className="text-4xl mb-2">🏆</p>
                <p className="text-sm font-semibold text-[#9a4a0d] uppercase tracking-wide">Big Bass Winner</p>
                <p className="text-2xl font-bold text-[#1a0e04] mt-1">{bigBass.team_name}</p>
                <p className="text-lg text-[#4a2008]">{bigBass.big_bass_weight} lbs</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {lastResults.slice(0, 3).map((result, i) => (
                <div key={result.id} className="bg-white rounded-xl shadow-md p-6 text-center border border-orange-100">
                  <div className="text-3xl mb-2">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                  <p className="text-sm text-gray-500 font-medium">{i === 0 ? '1st Place' : i === 1 ? '2nd Place' : '3rd Place'}</p>
                  <p className="text-xl font-bold text-[#1a0e04] mt-1">{result.team_name}</p>
                  <p className="text-sm text-gray-500 mt-1">{result.angler1} & {result.angler2}</p>
                  <div className="mt-3 flex justify-center gap-4 text-sm">
                    <span className="bg-orange-50 text-[#c45e10] px-3 py-1 rounded-full font-medium">{result.total_weight} lbs</span>
                    <span className="bg-amber-50 text-[#9a4a0d] px-3 py-1 rounded-full font-medium">{result.num_fish} fish</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href={`/results/${lastWeek.id}`} className="text-[#c45e10] font-semibold hover:text-[#e8940c] transition-colors">
                View Full Results &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function InfoCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="text-center p-4 bg-orange-50/50 rounded-lg">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-lg font-bold text-[#1a0e04]">{value}</p>
    </div>
  );
}
