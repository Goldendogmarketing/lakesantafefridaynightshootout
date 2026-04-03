import { getDb } from "@/lib/db";
import { WAIVER_TEXT } from "@/lib/schema";
import WaiverForm from "@/components/waiver/WaiverForm";

export const dynamic = 'force-dynamic';

export default function WaiverPage() {
  const db = getDb();
  const row = db.prepare("SELECT value FROM tournament_settings WHERE key = 'waiver_text'").get() as { value: string } | undefined;
  const waiverText = row?.value || WAIVER_TEXT;

  return (
    <div className="min-h-screen bg-[#faf6f0] py-8 sm:py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1a0e04]">Tournament Waiver</h1>
          <p className="text-[#4a2008]/70 mt-2">Lake Santa Fe Friday Night Shoot Out &bull; Melrose, Florida</p>
          <p className="text-gray-500 text-sm mt-1">Please read and sign the waiver below to participate</p>
        </div>
        <WaiverForm waiverText={waiverText} />
      </div>
    </div>
  );
}
