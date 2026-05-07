"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

// Banners can now be images or videos
const banners = [
  {
    id: 1,
    type: "image",
    image: "https://res.cloudinary.com/dklavcjrl/image/upload/v1778148608/hero_banners/luxury5.jpg",
    alt: "Premium Traditional Packaging - Red Luxury Style",
  },
  {
    id: 2,
    type: "image",
    image: "https://res.cloudinary.com/dklavcjrl/image/upload/v1778148610/hero_banners/luxury6.jpg",
    alt: "Bespoke Jewelry Packaging - Elegant Black",
  },
  {
    id: 3,
    type: "image",
    image: "https://res.cloudinary.com/dklavcjrl/image/upload/v1778148611/hero_banners/luxury7.jpg",
    alt: "Artisan Chocolate Packaging - White Gold Accent",
  },
  {
    id: 4,
    type: "video",
    src: "https://res.cloudinary.com/dklavcjrl/video/upload/v1778148613/hero_banners/hero_video_2.mp4",
    alt: "Boxfox Premium Production Video",
  },
  {
    id: 5,
    type: "video",
    src: "https://res.cloudinary.com/dklavcjrl/video/upload/v1778148615/hero_banners/hero_video.mp4",
    alt: "Boxfox Premium Hero Video",
  }
];


export default function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  // Ensure we always have a valid banner
  const currentBanner = banners && banners.length > 0 ? banners[currentIndex % banners.length] : null;

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0.8
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0.8
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = useCallback((newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + banners.length) % banners.length);
  }, []);

  // Autoplay Logic - Pauses if Hovered OR if it's currently a Video
  useEffect(() => {
    if (isHovered) return;

    // If it's a video, the video's "onEnded" event will trigger the next slide instead!
    if (banners[currentIndex].type === "video") return;

    const timer = setInterval(() => {
      paginate(1);
    }, 2000); // 2 second interval for both mobile and desktop
    return () => clearInterval(timer);
  }, [isHovered, currentIndex, paginate]);

  // Restart video every time we slide back to it
  useEffect(() => {
    if (banners[currentIndex].type === "video" && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
    }
  }, [currentIndex]);

  return (

    <section
      className="relative w-full bg-[#111] overflow-hidden pt-[65px]"
      suppressHydrationWarning
    >

      {/* ── Slider fills the half-hero area ── */}
      <div
        className="relative w-full h-[250px] sm:h-[400px] md:h-[500px] group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Slides */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.8 },
              opacity: { duration: 0.6, ease: "easeInOut" }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) paginate(1);
              else if (swipe > swipeConfidenceThreshold) paginate(-1);
            }}
            className="absolute inset-0 w-full h-full"
          >
            {currentBanner && currentBanner.type === "image" ? (
              <>
                {/* Immersive blurred background to fill the frame */}
                <div
                  className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40 scale-110"
                  style={{
                    backgroundImage: `url('${currentBanner.image}')`,
                    filter: "blur(40px) saturate(1.8)",
                  }}
                />

                {/* Sharp foreground — contained to keep products/designs perfectly visible */}
                <Image
                  src={currentBanner.image}
                  alt={currentBanner.alt}
                  fill
                  className="relative z-10"
                  style={{ objectFit: "contain", objectPosition: "center" }}
                  priority={currentIndex === 0}
                  sizes="100vw"
                  quality={95}
                />
              </>
            ) : currentBanner && currentBanner.type === "video" ? (
              <>
                {/* Blurred Video Background */}
                <video
                  src={currentBanner.src}
                  muted
                  playsInline
                  autoPlay
                  loop
                  className="absolute inset-0 w-full h-full bg-cover opacity-30 scale-110 blur-3xl saturate-150"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />

                {/* Main Video — contained to prevent cropping sensitive content */}
                <video
                  ref={(el) => {
                    if (el) {
                      videoRef.current = el;
                      el.play().catch(() => { });
                    }
                  }}
                  src={currentBanner.src}
                  muted
                  playsInline
                  onEnded={() => paginate(1)}
                  className="relative z-10 w-full h-full pointer-events-none"
                  style={{ objectFit: "contain", objectPosition: "center" }}
                />
              </>
            ) : null}


            {/* Dark wash for text visibility — stronger from bottom-left */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/20 to-transparent pointer-events-none z-20" />
          </motion.div>
        </AnimatePresence>

        {/* ── CTA Overlay (bottom-left) ── */}
        <div className="hidden sm:block absolute bottom-0 left-0 right-0 z-30 px-6 sm:px-10 lg:px-16 pb-12 sm:pb-16">
          <div className="max-w-xl">
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.25em] text-[#D4AF37] mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
            >
              Premium Custom Packaging
            </motion.p>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.55 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-black text-white leading-[1.08] tracking-tight mb-5 drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
            >
              Design. Print.<br />
              <span className="bg-gradient-to-r from-[#D4AF37] via-[#F9F295] via-[#E6B830] via-[#F9F295] to-[#B8860B] bg-clip-text text-transparent">Deliver.</span>
            </motion.h1>

            {/* Sub text */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="text-sm sm:text-base text-white font-medium mb-7 max-w-xs sm:max-w-sm leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            >
              India&apos;s most trusted packaging partner — duplex, rigid & corrugated boxes with AI-powered custom prints.
            </motion.p>



            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="flex flex-wrap items-center gap-3"
            >
              <a
                href="/customize"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] hover:brightness-110 text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.55)] transition-all duration-300 hover:scale-[1.03] active:scale-95"
              >
                Start Designing
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
              <a
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-black/20 hover:bg-black/40 border border-white/40 hover:border-[#D4AF37] text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-full backdrop-blur-md shadow-lg transition-all duration-300 hover:scale-[1.03] active:scale-95"
              >
                Browse Collection
              </a>
            </motion.div>

          </div>
        </div>

        {/* ── Prev / Next arrows ── */}
        <button
          onClick={(e) => { e.stopPropagation(); paginate(-1); }}
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-white/80 hover:bg-white text-gray-900 shadow-lg transition-all duration-200 backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-90"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); paginate(1); }}
          className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-30 p-2.5 sm:p-3 rounded-full bg-white/80 hover:bg-white text-gray-900 shadow-lg transition-all duration-200 backdrop-blur-sm opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-90"
          aria-label="Next slide"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* ── Slide indicators ── */}
        <div className="absolute bottom-5 right-6 sm:right-10 lg:right-16 z-30 flex items-center gap-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              className={`transition-all duration-300 rounded-full ${idx === currentIndex
                ? "w-6 sm:w-8 h-[3px] bg-white"
                : "w-[3px] h-[3px] bg-white/50 hover:bg-white/80"
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
