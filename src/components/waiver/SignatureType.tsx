"use client";

import { useState, useEffect } from "react";

interface SignatureTypeProps {
  onSignatureChange: (data: string) => void;
}

export default function SignatureType({ onSignatureChange }: SignatureTypeProps) {
  const [name, setName] = useState('');

  useEffect(() => {
    onSignatureChange(name.trim());
  }, [name, onSignatureChange]);

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Type your full name"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900"
      />
      {name.trim() && (
        <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg bg-white p-6 text-center">
          <p className="signature-typed text-4xl text-gray-800">{name}</p>
          <div className="border-t border-gray-300 mt-4 pt-2">
            <p className="text-xs text-gray-400">Electronic Signature</p>
          </div>
        </div>
      )}
    </div>
  );
}
