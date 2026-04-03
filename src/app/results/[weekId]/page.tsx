import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import Image from "next/image";
import type { TournamentWeek, Result, WeekPhoto } from "@/types";

export const dynamic = 'force-dynamic';

export default async function WeekResultsPage({ params }: { params: Promise<{ weekId: string }> }) {
  const { weekId } = await params;
  const db = getDb();

  const week = db.prepare('SELECT * FROM tournament_weeks WHERE id = ?').get(weekId) as TournamentWeek | undefined;
  if (!week) notFound();

  const results = db.prepare(
    'SELECT * FROM results WHERE week_id = ? ORDER BY placement ASC, total_weight DESC'
  ).all(week.id) as Result[];

  const bigBass = db.prepare(
    'SELECT * FROM results WHERE week_id = ? AND big_bass_weight IS NOT NULL ORDER BY big_bass_weight DESC LIMIT 1'
  ).get(week.id) as Result | undefined;

  const photos = db.prepare(
    'SELECT * FROM week_photos WHERE week_id = ? ORDER BY created_at ASC'
  ).all(week.id) as WeekPhoto[];

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4">
        <Link href="/results" className="text-[#065f46] hover:text-[#059669] font-medium mb-4 inline-block">
          &larr; All Results
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">Week {week.week_number} Results</h1>
        <p className="text-gray-500 mb-8">{week.date} &mdash; {week.location}</p>

        {/* Big Bass */}
        {bigBass && bigBass.big_bass_weight && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-8 flex items-center gap-4">
            <span className="text-4xl">🏆</span>
            <div>
              <p className="text-sm font-semibold text-yellow-700 uppercase tracking-wide">Big Bass</p>
              <p className="text-xl font-bold text-gray-900">{bigBass.team_name} &mdash; {bigBass.big_bass_weight} lbs</p>
              <p className="text-sm text-gray-500">{bigBass.angler1} & {bigBass.angler2}</p>
            </div>
          </div>
        )}

        {results.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No results posted for this week yet.</p>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-4">
              {results.map((result, i) => (
                <div key={result.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${result.placement || i + 1}`}</span>
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold">{result.total_weight} lbs</span>
                  </div>
                  <p className="font-bold text-gray-900">{result.team_name}</p>
                  <p className="text-sm text-gray-500">{result.angler1} & {result.angler2}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>{result.num_fish} fish</span>
                    {result.big_bass_weight && <span>Big Bass: {result.big_bass_weight} lbs</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Place</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Team</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Anglers</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Fish</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Weight</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Big Bass</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, i) => (
                    <tr key={result.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-gray-900">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''} {result.placement || i + 1}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{result.team_name}</td>
                      <td className="px-4 py-3 text-gray-600">{result.angler1} & {result.angler2}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{result.num_fish}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700">{result.total_weight} lbs</td>
                      <td className="px-4 py-3 text-right text-gray-500">{result.big_bass_weight ? `${result.big_bass_weight} lbs` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map(photo => (
                <div key={photo.id} className="group">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                    <Image
                      src={photo.filename}
                      alt={photo.caption || 'Tournament photo'}
                      width={400}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  {photo.caption && (
                    <p className="text-sm text-gray-500 mt-1">{photo.caption}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
