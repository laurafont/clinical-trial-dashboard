import { useMemo } from "react";

import type { ParticipantRead } from "../types/api";

export interface DashboardMetrics {
  total: number;
  treatmentCount: number;
  controlCount: number;
  activeCount: number;
  completedCount: number;
  withdrawnCount: number;
  genderBreakdown: { F: number; M: number; Other: number };
}

export function useDashboardMetrics(
  participants: ParticipantRead[],
): DashboardMetrics {
  return useMemo(() => {
    const total = participants.length;
    let treatmentCount = 0;
    let controlCount = 0;
    let activeCount = 0;
    let completedCount = 0;
    let withdrawnCount = 0;
    const genderBreakdown = { F: 0, M: 0, Other: 0 };

    for (const p of participants) {
      if (p.study_group === "treatment") treatmentCount++;
      else controlCount++;

      if (p.status === "active") activeCount++;
      else if (p.status === "completed") completedCount++;
      else withdrawnCount++;

      if (p.gender === "F") genderBreakdown.F++;
      else if (p.gender === "M") genderBreakdown.M++;
      else genderBreakdown.Other++;
    }

    return {
      total,
      treatmentCount,
      controlCount,
      activeCount,
      completedCount,
      withdrawnCount,
      genderBreakdown,
    };
  }, [participants]);
}
