// /src/hooks/useSupabaseDetections.ts
"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { SupabaseDetection } from "@/types/lpr"; // optional types

export function useSupabaseDetections() {
  const [recentDetections, setRecentDetections] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchDetectionData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: recent } = await supabase
        .from("detections")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      setRecentDetections(recent || []);

      const { count } = await supabase
        .from("detections")
        .select("*", { count: "exact", head: true });

      setTotalCount(count ?? 0);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveDetection = useCallback(
    async (det: {
      plate_number: string;
      confidence: number;
      status: string;
      time_ms: number;
    }) => {
      const { data, error } = await supabase.from("detections").insert(det);

      if (error) {
        console.error("Supabase insert error:", {
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return null;
      }
      return data;
    },
    []
  );

  return {
    recentDetections,
    totalCount,
    loading,
    fetchDetectionData,
    saveDetection,
  };
}
