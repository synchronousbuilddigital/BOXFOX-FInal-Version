"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function SiteLoader() {
  const [visible, setVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // 1. Check if first load
    const hasSeenLoader = localStorage.getItem("hasSeenLoader");
    const isCustomizationPage = pathname === "/customize" || pathname.includes("/customize");

    if (!hasSeenLoader || isCustomizationPage) {
      triggerLoader();
      if (!isCustomizationPage) {
        localStorage.setItem("hasSeenLoader", "true");
      }
    }
  }, [pathname]);

  const triggerLoader = () => {
    setVisible(true);
    setIsAnimating(true);

    // Total animation duration is 2s, plus a small buffer for page transition
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => setVisible(false), 500); // Small delay to ensure content transition starts
    }, 2500);

    return () => clearTimeout(timer);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Depth-Effect Logo Container */}
          <motion.div
            initial={{
              scale: 0.8,
              opacity: 0,
              filter: "blur(15px)",
              z: -100 // Visual depth cue
            }}
            animate={{
              scale: [0.8, 1.1, 1.0],
              opacity: 1,
              filter: "blur(0px)",
              z: 0
            }}
            transition={{
              duration: 2.2,
              ease: [0.16, 1, 0.3, 1], // Custom ease-in-out curve
            }}
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              perspective: "1000px"
            }}
          >
            {/* Soft Shadow Intensifying */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, boxShadow: "0 0 0 rgba(0,0,0,0)" }}
              animate={{
                scale: [0.8, 1.1, 1.0],
                opacity: 1,
                boxShadow: [
                  "0 10px 20px rgba(0,0,0,0.02)",
                  "0 40px 80px rgba(0,0,0,0.12)",
                  "0 25px 50px rgba(0,0,0,0.08)"
                ]
              }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
              style={{
                position: "absolute",
                width: "140%",
                height: "140%",
                borderRadius: "2rem",
                background: "transparent",
                zIndex: -1
              }}
            />

            {/* Main Logo */}
            <div style={{ position: "relative", overflow: "hidden", borderRadius: "2rem" }}>
              <img
                src="/BOXFOX-1.png"
                alt="BoxFox Logo"
                style={{
                  width: "280px",
                  height: "auto",
                  display: "block",
                  padding: "60px"
                }}
              />

              {/* Light Sweep Effect */}
              <motion.div
                initial={{ x: "-150%", skewX: -25 }}
                animate={{ x: "150%" }}
                transition={{
                  duration: 1.5,
                  delay: 0.5,
                  ease: "easeInOut",
                  repeat: 0
                }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "50%",
                  height: "100%",
                  background: "linear-gradient(to right, transparent, rgba(16,185,129,0.15), transparent)",
                  zIndex: 2,
                  pointerEvents: "none"
                }}
              />
            </div>

            {/* Background Ambient Glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 0.5, 0.2], scale: [0.5, 1.2, 1] }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
              style={{
                position: "absolute",
                width: "400px",
                height: "400px",
                background: "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)",
                borderRadius: "50%",
                zIndex: -2,
                pointerEvents: "none"
              }}
            />
          </motion.div>

          {/* Minimal Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            style={{
              position: "absolute",
              bottom: "40px",
              fontSize: "10px",
              fontWeight: "800",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              color: "#10b981",
              margin: 0
            }}
          >
            Premium Packaging Studio
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
