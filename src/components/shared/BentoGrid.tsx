"use client";

import React from "react";

interface BentoGridProps {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
  className?: string;
  leftClassName?: string;
  centerClassName?: string;
  rightClassName?: string;
}

export default function BentoGrid({
  left,
  center,
  right,
  className = "",
  leftClassName = "xl:col-span-3",
  centerClassName = "xl:col-span-5",
  rightClassName = "xl:col-span-4",
}: BentoGridProps) {
  return (
    <div className={`flex-1 min-h-0 grid grid-cols-1 gap-3 xl:grid-cols-12 ${className}`}>
      <div className={`min-h-0 min-w-0 ${leftClassName}`}>{left}</div>
      <div className={`min-h-0 min-w-0 ${centerClassName}`}>{center}</div>
      <div className={`min-h-0 min-w-0 ${rightClassName}`}>{right}</div>
    </div>
  );
}