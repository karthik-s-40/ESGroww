// Re-export all engine functions for backward compatibility of imports
export * from "./emissions-engine";
export * from "./benchmark-engine";
export * from "./calculation-engine";
// Also expose the new centralized calculation utilities for consumers that
// import from `@/lib/esgCalculations` so they automatically get the BRD
// calculation helpers without changing every import site.
export * from "./calculations";