"use client";
import { useEffect, useState } from "react";

const DEFAULT_ANNOUNCEMENT = {
  enabled: true,
  text: "Free Delivery Across India on Orders Above ₹2000",
};

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState(DEFAULT_ANNOUNCEMENT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let isMounted = true;

    const fetchAnnouncement = async () => {
      try {
        const res = await fetch("/api/announcement", { cache: "no-store" });
        const data = await res.json();
        if (!isMounted) return;
        if (res.ok && data?.data) {
          setAnnouncement({
            enabled: typeof data.data.enabled === "boolean" ? data.data.enabled : true,
            text: typeof data.data.text === "string" && data.data.text.trim() ? data.data.text.trim() : DEFAULT_ANNOUNCEMENT.text,
          });
        }
      } catch {
      }
    };

    fetchAnnouncement();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!announcement.enabled) return null;


  return (
    <div className="w-full bg-gray-950 text-white border-b border-white/10 overflow-hidden relative" suppressHydrationWarning>
      {/* Side Fade Gradient Overlays for Premium Aesthetic */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-gray-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-gray-950 to-transparent z-10 pointer-events-none" />

      <div className="py-2.5 flex whitespace-nowrap animate-marquee">
        <div className="flex shrink-0 items-center">
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] leading-none text-white px-12 inline-block">
            {announcement.text}
          </span>
          {mounted && [...Array(5)].map((_, i) => (
            <span key={i} aria-hidden="true" className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] leading-none text-white px-12 inline-block">
              {announcement.text}
            </span>
          ))}
        </div>
        {mounted && (
          <div className="flex shrink-0 items-center" aria-hidden="true">
            {[...Array(6)].map((_, i) => (
              <span key={`copy-${i}`} className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] leading-none text-white px-12 inline-block">
                {announcement.text}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

