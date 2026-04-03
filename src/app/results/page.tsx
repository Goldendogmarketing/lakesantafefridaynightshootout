import Link from "next/link";
import { getDb } from "@/lib/db";
import type { TournamentWeek } from "@/types";

export const dynamic = 'force-dynamic';

export default async function ResultsPage() {
  const sql = getDb();
  const weeks = await sql`SELECT * FROM tournament_weeks WHERE is_upcoming = false ORDER BY date DESC` as TournamentWeek[];

  return (
    <div className="min-h-screen bg-[#faf6f0] py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1a0e04] text-center mb-2">Tournament Results</h1>
        <p className="text-gray-500 text-center mb-8">View results from each week of the tournament series</p>

        {weeks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-12 text-center">
            <div className="text-4xl mb-4">🎣</div>
            <p className="text-gray-500 text-lg">No results posted yet. Check back after the first tournament!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {weeks.map(week => (
              <Link key={week.id} href={`/results/${week.id}`}
                className="block bg-white rounded-xl shadow-sm border border-orange-100 p-6 hover:shadow-md hover:border-[#c45e10]/30 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#1a0e04]">Week {week.week_number}</h2>
                    <p className="text-gray-500 mt-1">{week.date} &mdash; {week.location}</p>
                    {week.notes && <p className="text-gray-400 text-sm mt-1">{week.notes}</p>}
                  </div>
                  <span className="text-[#c45e10] font-medium">View Results &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
