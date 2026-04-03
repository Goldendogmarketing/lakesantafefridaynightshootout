export default function Footer() {
  return (
    <footer className="bg-[#1a0e04] text-gray-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-lg font-semibold text-[#f5b731] mb-1">Lake Santa Fe Friday Night Shoot Out</p>
        <p className="text-sm text-orange-200/60">Bass Tournament &bull; Melrose, Florida</p>
        <p className="text-sm mt-4 text-gray-500">&copy; {new Date().getFullYear()} Lake Santa Fe Shoot Out. All rights reserved.</p>
        <p className="text-xs mt-3 text-gray-600">Built by <a href="https://ihelpbuild.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#f5b731] transition-colors">ihelpbuild.com</a></p>
      </div>
    </footer>
  );
}
