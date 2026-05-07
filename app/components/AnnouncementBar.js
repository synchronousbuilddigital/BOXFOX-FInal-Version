"use client";
import { useEffect, useState } from "react";

const DEFAULT_ANNOUNCEMENT = {
  enabled: true,
  text: "Free Delivery Across India on Orders Above ₹2000",
};

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState(DEFAULT_ANNOUNCEMENT);

  useEffect(() => {
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
    <div className="w-full bg-gray-950 text-white border-b border-white/10 overflow-hidden" suppressHydrationWarning>
      <div className="py-1.5 flex whitespace-nowrap animate-marquee">
        <div className="flex shrink-0">
          {[...Array(6)].map((_, i) => (
            <p key={i} className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] leading-none mb-0 text-white px-12">
              {announcement.text}
            </p>
          ))}
        </div>
        <div className="flex shrink-0">
          {[...Array(6)].map((_, i) => (
            <p key={`copy-${i}`} className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] leading-none mb-0 text-white px-12">
              {announcement.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

