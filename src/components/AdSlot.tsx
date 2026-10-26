"use client";
import React from "react";

/**
 * Ad/Sponsor slot component.
 * Renders nothing when no ad is configured (NEXT_PUBLIC_AD_SLOT_ID is absent).
 * Maintains a fixed aspect ratio so layout never jumps when an ad loads.
 */
interface AdSlotProps {
  /** Optional extra class names to apply to the wrapper */
  className?: string;
}

export function AdSlot({ className = "" }: AdSlotProps) {
  const configured = Boolean(process.env.NEXT_PUBLIC_AD_SLOT_ID);

  if (!configured) {
    // Render nothing — no layout shift, no placeholder space
    return null;
  }

  return (
    <div
      className={`w-full overflow-hidden rounded-lg border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 ${className}`}
      style={{ aspectRatio: "4/1", minHeight: "80px", maxHeight: "120px" }}
      aria-label="Sponsor"
    >
      {/* Ad or sponsor creative injected here by ad network */}
      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 dark:text-zinc-600">
        Advertisement
      </div>
    </div>
  );
}

