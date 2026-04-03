import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import type { TournamentWeek, Result, WeekPhoto } from "@/types";

export const dynamic = 'force-dynamic';

export default async function WeekResultsPage({ params }: { params: Promise<{ weekId: string }> }) {
  const { weekId } = await params;
  const sql = getDb();

  const weeks = await sql`SELECT * FROM tournament_weeks WHERE id = ${weekId}`;
  const week = weeks[0] as TournamentWeek | undefined;
  if (!week) notFound();

  const results = await sql`
    SELECT * FROM results WHERE week_id = ${week.id} ORDER BY placement ASC, total_weight DESC
  ` as Result[];

  const bigBassRows = await sql`
    SELECT * FROM results WHERE week_id = ${week.id} AND big_bass_weight IS NOT NULL ORDER BY big_bass_weight DESC LIMIT 1
  `;
  const bigBass = bigBassRows[0] as Result | undefined;

  const photos = await sql`
    SELECT * FROM week_photos WHERE week_id = ${week.id} ORDER BY created_at ASC
  ` as WeekPhoto[];

  return (
    <div className="min-h-screen bg-[#faf6f0] py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4">
        <Link href="/results" className="text-[#c45e10] hover:text-[#e8940c] font-medium mb-4 inline-block">
          &larr; All Results
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-[#1a0e04] mb-1">Week {week.week_number} Results</h1>
        <p className="text-gray-500 mb-8">{week.date} &mdash; {week.location}</p>

        {bigBass && bigBass.big_bass_weight && (
          <div className="bg-gradient-to-r from-[#f5b731]/20 to-[#e8940c]/20 border-2 border-[#f5b731] rounded-xl p-6 mb-8 flex items-center gap-4">
            <span className="text-4xl">🏆</span>
            <div>
              <p className="text-sm font-semibold text-[#9a4a0d] uppercase tracking-wide">Big Bass</p>
              <p className="text-xl font-bold text-[#1a0e04]">{bigBass.team_name} &mdash; {bigBass.big_bass_weight} lbs</p>
              <p className="text-sm text-gray-500">{bigBass.angler1} & {bigBass.angler2}</p>
            </div>
          </div>
        )}

        {results.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-12 text-center">
            <p className="text-gray-500">No results posted for this week yet.</p>
          </div>
        ) : (
          <>
            <div className="sm:hidden space-y-4">
              {results.map((result, i) => (
                <div key={result.id} className="bg-white rounded-xl shadow-sm border border-orange-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${result.placement || i + 1}`}</span>
                    <span className="bg-orange-100 text-[#c45e10] px-3 py-1 rounded-full text-sm font-bold">{result.total_weight} lbs</span>
                  </div>
                  <p className="font-bold text-[#1a0e04]">{result.team_name}</p>
                  <p className="text-sm text-gray-500">{result.angler1} & {result.angler2}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>{result.num_fish} fish</span>
                    {result.big_bass_weight && <span>Big Bass: {result.big_bass_weight} lbs</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1a0e04] text-[#f5b731]">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Place</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Team</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Anglers</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Fish</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Weight</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Big Bass</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, i) => (
                    <tr key={result.id} className="border-b border-orange-50 last:border-0 hover:bg-orange-50/50">
                      <td className="px-4 py-3 font-bold text-[#1a0e04]">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''} {result.placement || i + 1}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#1a0e04]">{result.team_name}</td>
                      <td className="px-4 py-3 text-gray-600">{result.angler1} & {result.angler2}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{result.num_fish}</td>
                      <td className="px-4 py-3 text-right font-bold text-[#c45e10]">{result.total_weight} lbs</td>
                      <td className="px-4 py-3 text-right text-gray-500">{result.big_bass_weight ? `${result.big_bass_weight} lbs` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {photos.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold text-[#1a0e04] mb-4">Photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map(photo => (
                <div key={photo.id} className="group">
                  <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                    <Image src={photo.filename} alt={photo.caption || 'Tournament photo'} width={400} height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                  </div>
                  {photo.caption && <p className="text-sm text-gray-500 mt-1">{photo.caption}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
