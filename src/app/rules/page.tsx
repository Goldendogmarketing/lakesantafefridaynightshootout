import Link from "next/link";

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-[#faf6f0] py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1a0e04]">Official Tournament Rules</h1>
          <p className="text-[#4a2008]/70 mt-2">Little Lake Santa Fe Boat Ramp (21B) &bull; Melrose, Florida &bull; Every Friday 6&ndash;9 PM</p>
          <a
            href="/tournament-rules.pdf"
            target="_blank"
            className="inline-block mt-4 bg-[#c45e10] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#e8940c] transition-colors text-sm"
          >
            Download PDF Version
          </a>
        </div>

        {/* Entry Fee & Payouts */}
        <RuleSection title="Entry Fee & Payouts">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-lg font-bold text-[#1a0e04] mb-2">$50 per boat</p>
              <p className="text-gray-700">$40 &rarr; Tournament Pot</p>
              <p className="text-gray-700">$10 &rarr; Big Bass Pot</p>
              <p className="text-gray-700 mt-2"><strong>Big Bass</strong> = heaviest single bass</p>
            </div>
            <div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#1a0e04] text-[#f5b731]">
                    <th className="px-4 py-2 text-left text-sm font-semibold">Boats</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold">Places Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-orange-100"><td className="px-4 py-2 text-gray-700">1&ndash;10</td><td className="px-4 py-2 text-gray-700">1st</td></tr>
                  <tr className="border-b border-orange-100 bg-orange-50/50"><td className="px-4 py-2 text-gray-700">11&ndash;20</td><td className="px-4 py-2 text-gray-700">1st&ndash;2nd</td></tr>
                  <tr className="border-b border-orange-100"><td className="px-4 py-2 text-gray-700">21&ndash;30</td><td className="px-4 py-2 text-gray-700">1st&ndash;3rd</td></tr>
                  <tr className="bg-orange-50/50"><td className="px-4 py-2 text-gray-700">31&ndash;40</td><td className="px-4 py-2 text-gray-700">1st&ndash;4th</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </RuleSection>

        {/* Tournament Format */}
        <RuleSection title="Tournament Format">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1a0e04] text-[#f5b731]">
                <th className="px-4 py-2 text-left text-sm font-semibold">Team Size</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Limit</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Min Length</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Scoring</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="px-4 py-3 text-gray-700">1&ndash;2 anglers/boat</td><td className="px-4 py-3 text-gray-700">5 bass/boat</td><td className="px-4 py-3 text-gray-700">12 inches</td><td className="px-4 py-3 text-gray-700">Total weight</td></tr>
            </tbody>
          </table>
        </RuleSection>

        {/* Fishing Waters */}
        <RuleSection title="Fishing Waters">
          <p className="text-gray-700">
            All navigable waters are open: <strong>Lake Santa Fe, Little Lake Santa Fe, and all connecting canals.</strong> If you can legally get your boat there, you can fish there.
          </p>
        </RuleSection>

        {/* Check-in / Return Rule */}
        <RuleSection title="Check-In / Return Rule">
          <div className="bg-red-50 border-2 border-red-400 rounded-xl p-6 text-center">
            <p className="text-lg font-bold text-[#1a0e04] mb-1">ALL BOATS MUST BE INSIDE THE CANAL AT 21B BY</p>
            <p className="text-5xl font-extrabold text-red-700 my-2">9:00 PM</p>
            <p className="text-gray-700 mt-2">Inside the canal entrance = on time. Not inside by 9:00 PM = <strong className="text-red-700">DISQUALIFIED.</strong></p>
          </div>
        </RuleSection>

        {/* Penalties */}
        <RuleSection title="Penalties">
          <table className="w-full border-collapse mb-3">
            <thead>
              <tr className="bg-[#1a0e04] text-[#f5b731]">
                <th className="px-4 py-2 text-left text-sm font-semibold">Violation</th>
                <th className="px-4 py-2 text-left text-sm font-semibold">Penalty</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-orange-100"><td className="px-4 py-3 text-gray-700">Dead fish at weigh-in</td><td className="px-4 py-3 text-gray-700 font-semibold">&ndash;1 lb per dead fish</td></tr>
              <tr><td className="px-4 py-3 text-gray-700">Short fish (under 12&quot;)</td><td className="px-4 py-3 text-gray-700 font-semibold">&ndash;1 lb per short fish</td></tr>
            </tbody>
          </table>
          <p className="text-sm text-gray-500">Penalties are deducted from your total weight.</p>
        </RuleSection>

        {/* Tiebreaker */}
        <RuleSection title="Tiebreaker">
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li><strong>Team with the bigger single bass</strong> wins the tie.</li>
            <li>If neither team has a qualifying Big Bass, the tied teams combine and <strong>split the prize money evenly.</strong></li>
          </ol>
        </RuleSection>

        {/* Fishing Rules */}
        <RuleSection title="Fishing Rules">
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2"><span className="text-[#c45e10] font-bold mt-0.5">&#8226;</span><span><strong>Artificial lures ONLY</strong> &mdash; no live bait</span></li>
            <li className="flex items-start gap-2"><span className="text-[#c45e10] font-bold mt-0.5">&#8226;</span><span><strong>No trolling</strong></span></li>
            <li className="flex items-start gap-2"><span className="text-[#c45e10] font-bold mt-0.5">&#8226;</span><span>One rod and reel per angler at a time</span></li>
            <li className="flex items-start gap-2"><span className="text-[#c45e10] font-bold mt-0.5">&#8226;</span><span>Forward-facing sonar and all sonar tech <strong>ARE allowed</strong></span></li>
          </ul>
        </RuleSection>

        {/* Safety & Legal */}
        <RuleSection title="Safety & Legal">
          <p className="text-gray-700 mb-3">Follow all Florida boating laws at all times:</p>
          <ul className="space-y-2 text-gray-700 mb-4">
            <li className="flex items-start gap-2"><span className="text-[#c45e10] font-bold mt-0.5">&#8226;</span><span>Navigation lights on and working</span></li>
            <li className="flex items-start gap-2"><span className="text-[#c45e10] font-bold mt-0.5">&#8226;</span><span>Kill switch in use while running</span></li>
            <li className="flex items-start gap-2"><span className="text-[#c45e10] font-bold mt-0.5">&#8226;</span><span>Coast Guard&ndash;approved life jacket for everyone on board</span></li>
            <li className="flex items-start gap-2"><span className="text-[#c45e10] font-bold mt-0.5">&#8226;</span><span>Safe, responsible boat operation</span></li>
          </ul>
          <p className="text-gray-700">Must comply with FWC and Coast Guard regs. <strong className="text-red-700">Breaking safety rules = disqualification and possible ban.</strong></p>
        </RuleSection>

        {/* Sportsmanship & Conduct */}
        <RuleSection title="Sportsmanship & Conduct">
          <p className="text-gray-700 mb-3"><strong>Sportsmanship is mandatory.</strong> Be respectful to anglers, staff, and the public.</p>
          <p className="text-gray-700 mb-3">
            You will be <strong>disqualified</strong> for: unsportsmanlike behavior, conflict, threatening language, unsafe boating, or cheating. Serious misconduct = permanent ban and possible law enforcement.
          </p>
          <p className="text-gray-700 font-semibold">Tournament officials can refuse entry to anyone.</p>
        </RuleSection>

        {/* Sign-Up Requirements */}
        <RuleSection title="Sign-Up Requirements">
          <p className="text-gray-700 mb-4">
            Every angler must sign the <strong>Tournament Rules Agreement</strong> and <strong>Liability Waiver</strong> before fishing. No signature = no fishing. By signing you confirm you&apos;ve read these rules, agree to follow them, take responsibility for your own safety, and release organizers from liability.
          </p>
          <Link href="/waiver" className="inline-block bg-[#c45e10] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e8940c] transition-colors">
            Sign Waiver Now
          </Link>
        </RuleSection>

        {/* Final Statement */}
        <div className="bg-gradient-to-r from-[#1a0e04] to-[#4a2008] rounded-xl p-6 text-center mt-6 mb-4">
          <p className="text-[#f5b731] text-xl font-extrabold tracking-wide">ALL DECISIONS BY TOURNAMENT OFFICIALS ARE FINAL.</p>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">Tournament Director: Nick Foster &bull; Lake Santa Fe Friday Night Shoot Out &bull; Melrose, Florida</p>
      </div>
    </div>
  );
}

function RuleSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-[#6b3410] to-[#8b4513] px-6 py-3">
        <h2 className="text-lg font-bold text-[#f5b731] uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
