import { getDb } from "@/lib/db";
import type { TournamentWeek } from "@/types";
import SignupForm from "@/components/signup/SignupForm";

export const dynamic = 'force-dynamic';

export default async function SignupPage() {
  const sql = getDb();
  const weeks = await sql`SELECT * FROM tournament_weeks ORDER BY date ASC` as TournamentWeek[];
  const settingsRows = await sql`SELECT key, value FROM tournament_settings WHERE key IN ('upcoming_entry_fee', 'upcoming_time', 'upcoming_location')`;
  const settings: Record<string, string> = {};
  for (const row of settingsRows) {
    settings[row.key] = row.value;
  }

  return (
    <div className="min-h-screen bg-[#faf6f0] py-8 sm:py-12">
      <div className="max-w-lg mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1a0e04]">Tournament Sign Up</h1>
          <p className="text-[#4a2008]/70 mt-2">Lake Santa Fe Friday Night Shoot Out</p>
          <p className="text-gray-500 text-sm mt-1">
            {settings.upcoming_location || 'Melrose, FL'} &bull; {settings.upcoming_time || '6 PM - 9 PM'} &bull; {settings.upcoming_entry_fee || '$50'}/boat
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-sm text-[#4a2008]">
          <p><strong>Entry fee ({settings.upcoming_entry_fee || '$50'}) is paid in cash at the boat ramp.</strong> Signing up online reserves your spot. You must also sign the liability waiver before fishing.</p>
        </div>

        <SignupForm weeks={weeks} />
      </div>
    </div>
  );
}
