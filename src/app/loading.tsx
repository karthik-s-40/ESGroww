"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Top Loading Line */}
      <div className="absolute top-0 left-0 h-[3px] w-full overflow-hidden">
        <motion.div
          className="h-full w-[40%] bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
          initial={{ x: "-100%" }}
          animate={{ x: "250%" }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Subtle Top Glow */}
      <div className="absolute top-0 left-0 h-[1px] w-full bg-emerald-400/20 blur-sm" />
    </div>
  );
}