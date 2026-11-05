import { useMemo } from "react";
import {
  AQUA_SERVICES,
  AQUA_STATS,
  AQUA_STEPS,
  AQUA_TESTIMONIALS,
  AQUA_WHY,
  SERVICES,
  STATS,
  STEPS,
  TESTIMONIALS,
  WHY,
} from "./content";
import { useGeo } from "./store";

// Country/user ke hisaab se sahi text: Mithai wale visitor ko mithai ka, aqua-only ko water ka.
export default function useContent() {
  const { country } = useGeo();
  const sweets = country.categories.includes("sweets");
  const aqua = country.categories.includes("aqua");
  return useMemo(
    () =>
      sweets
        ? {
            sweets,
            aqua,
            STATS,
            WHY,
            STEPS,
            TESTIMONIALS,
            SERVICES: SERVICES.filter((s) => !s.aquaOnly || aqua),
          }
        : {
            sweets,
            aqua,
            STATS: AQUA_STATS,
            WHY: AQUA_WHY,
            STEPS: AQUA_STEPS,
            TESTIMONIALS: AQUA_TESTIMONIALS,
            SERVICES: AQUA_SERVICES,
          },
    [sweets, aqua],
  );
}
