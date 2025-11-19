import QRCode from "qrcode";
import { X } from "lucide-react";
import { motion } from "framer-motion";
import { CLIENT_URL } from "@/lib/dbconfig";
import React, { useEffect, useMemo, useRef, useState } from "react";

interface SuccessProps {
  resetFlow: () => void;
  setOpenQR: (open: boolean) => void;
  currentTeam: string;
}

const QR = ({ resetFlow, setOpenQR, currentTeam }: SuccessProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const qrLink = useMemo(() => {
    let baseUrl: string = `${CLIENT_URL}companion`;

    if (!currentTeam) return baseUrl;
    const params = new URLSearchParams({ sharedTeam: currentTeam });
    return `${baseUrl}?${params.toString()}`;
  }, [currentTeam]);

  useEffect(() => {
    const renderQR = async () => {
      if (!canvasRef.current) return;

      try {
        await QRCode.toCanvas(canvasRef.current, qrLink, {
          width: 240,
          margin: 1,
          color: {
            dark: "#0F0F0F",
            light: "#FFFFFF",
          },
        });
        setQrError(null);
      } catch (err) {
        console.error("Failed to render QR code:", err);
        setQrError("Unable to generate QR code");
      }
    };

    renderQR();
    setCopyState("idle");
  }, [qrLink]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrLink);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2000);
    } catch (err) {
      console.error("Failed to copy QR link:", err);
      setCopyState("failed");
      setTimeout(() => setCopyState("idle"), 2000);
    }
  };

  return (
    <motion.div
      className="space-y-1"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <button
        type="button"
        className="absolute top-4 right-4 text-white/70 hover:text-white"
        onClick={() => {
          resetFlow();
          setOpenQR(false);
        }}
        aria-label="Close QR flow"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="space-y-5 bg-[#1A1918] p-5 rounded-lg">
        <div>
          <p className="text-[#FFCC8A] text-xs">INVEST IN A PROJECT</p>
          <h2 className="text-white text-xl font-semibold mt-1 leading-tight">
            Team QR Code
          </h2>
        </div>

        <div className="flex flex-col items-center gap-3 text-sm text-[#B8B8B8]">
          <div className="bg-white rounded-xl p-4">
            {qrError ? (
              <p className="text-red-500">{qrError}</p>
            ) : (
              <canvas
                ref={canvasRef}
                className="w-[200px] h-[200px] object-contain"
                aria-label="Team QR code"
              />
            )}
          </div>
          <p className="text-center text-xs text-[#FFCC8A]">
            Share this QR to send investors to your page.
          </p>
          <div className="w-full flex flex-col items-center gap-2">
            <p className="text-xs break-all text-[#B8B8B8] text-center">
              {qrLink}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg bg-[#DE7D02] hover:bg-[#f29224] px-4 py-2 text-xs font-semibold text-white transition-colors"
            >
              {copyState === "copied"
                ? "Link copied!"
                : copyState === "failed"
                  ? "Copy failed"
                  : "Copy link"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QR;
