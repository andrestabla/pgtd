"use client";

// Hook de la medición vigente EFECTIVA: consulta /api/td/maturity y cae al
// seed estático (A2) mientras carga o si no hay sesión. Cuando el corte A3
// se publica desde la plataforma, los tableros que usan este hook conmutan.

import { useCallback, useEffect, useState } from "react";
import { SCORES } from "@/data/demo";
import type { ScoresMap } from "@/components/charts";
import type { VariableCapture } from "@/server/store";

export type MaturityApi = {
  assessments: { id: string; label: string; period: string; status: string; note: string }[];
  current: { id: string; label: string; period: string; scores: ScoresMap };
  previous: { id: string; label: string; period: string; scores: ScoresMap } | null;
  published: boolean;
  capture: {
    vars: Record<string, VariableCapture>;
    progress: { total: number; perception: number; dik: number; level: number };
  };
};

export function useMaturity() {
  const [data, setData] = useState<MaturityApi | null>(null);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/td/maturity");
      if (res.ok) setData(await res.json());
    } catch { /* seed como respaldo */ }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const scores: ScoresMap = data?.current.scores ?? SCORES;
  const lineScoreOf = (n: number) => {
    const dims = Object.values(scores[n]);
    return dims.reduce((a, d) => a + d.value, 0) / dims.length;
  };
  const institution = [1, 2, 3, 4].reduce((a, n) => a + lineScoreOf(n), 0) / 4;
  const prevLineScoreOf = (n: number) => {
    const prev = data?.previous?.scores;
    if (!prev) return null;
    const dims = Object.values(prev[n]);
    return dims.reduce((a, d) => a + d.value, 0) / dims.length;
  };

  return { data, refetch, scores, lineScoreOf, prevLineScoreOf, institution };
}
