"use client";

import { useRef, useEffect, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";

interface SignatureDrawProps {
  onSignatureChange: (data: string) => void;
}

export default function SignatureDraw({ onSignatureChange }: SignatureDrawProps) {
  const sigRef = useRef<SignatureCanvas>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const resizeCanvas = useCallback(() => {
    if (!sigRef.current || !wrapperRef.current) return;
    const canvas = sigRef.current.getCanvas();
    const wrapper = wrapperRef.current;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = wrapper.offsetWidth * ratio;
    canvas.height = 200 * ratio;
    canvas.style.width = `${wrapper.offsetWidth}px`;
    canvas.style.height = '200px';
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(ratio, ratio);
    }
    sigRef.current.clear();
    onSignatureChange('');
  }, [onSignatureChange]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Prevent page scrolling while drawing on mobile
  useEffect(() => {
    if (!sigRef.current) return;
    const canvas = sigRef.current.getCanvas();

    function preventScroll(e: TouchEvent) {
      if (e.target === canvas) {
        e.preventDefault();
      }
    }

    canvas.addEventListener('touchstart', preventScroll, { passive: false });
    canvas.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', preventScroll);
      canvas.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  function handleEnd() {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      onSignatureChange(sigRef.current.toDataURL('image/png'));
    }
  }

  function handleClear() {
    sigRef.current?.clear();
    onSignatureChange('');
  }

  return (
    <div>
      <div
        ref={wrapperRef}
        className="border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden"
      >
        <SignatureCanvas
          ref={sigRef}
          penColor="#1a1a1a"
          minWidth={1.5}
          maxWidth={3}
          onEnd={handleEnd}
          canvasProps={{
            className: "w-full touch-none",
          }}
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-gray-400">Sign above with your finger or mouse</p>
        <button
          type="button"
          onClick={handleClear}
          className="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
