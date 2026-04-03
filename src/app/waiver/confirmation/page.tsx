import Link from "next/link";

export default function WaiverConfirmation() {
  return (
    <div className="min-h-screen bg-[#faf6f0] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-orange-100 p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-[#1a0e04] mb-2">Waiver Signed!</h1>
        <p className="text-gray-600 mb-6">
          Your waiver has been submitted successfully. You&apos;re all set for the tournament. See you on the water!
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-[#c45e10] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#e8940c] transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/results"
            className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            View Results
          </Link>
        </div>
      </div>
    </div>
  );
}
