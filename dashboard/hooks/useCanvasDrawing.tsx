// /src/hooks/useCanvasDrawing.ts
"use client";

import { useCallback } from "react";
import type { PlateResult } from "@/types/lpr";

/**
 * drawMultiPlateResults
 *
 * - canvas: overlay canvas
 * - imageEl: HTMLImageElement (upload) OR HTMLVideoElement (live)
 * - plates: backend detection results
 *
 * Assumptions:
 * - plate_box coords are ABSOLUTE pixel coords in model input space
 * - char_boxes coords are RELATIVE to plate crop
 */
export function useCanvasDrawing() {
  const drawMultiPlateResults = useCallback(
    (
      canvas: HTMLCanvasElement | null,
      imageEl: HTMLImageElement | HTMLVideoElement | null,
      plates: PlateResult[] | null
    ) => {
      if (!canvas || !imageEl || !plates || plates.length === 0) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // ==============================
      // 1️⃣ Get DISPLAY size
      // ==============================
      const rect = imageEl.getBoundingClientRect();
      const displayW = rect.width;
      const displayH = rect.height;

      if (!displayW || !displayH) return;

      // Canvas must match what user sees
      canvas.width = displayW;
      canvas.height = displayH;

      // ==============================
      // 2️⃣ Get SOURCE size (model space)
      // ==============================
      let sourceW = 0;
      let sourceH = 0;

      if (imageEl instanceof HTMLImageElement) {
        sourceW = imageEl.naturalWidth;
        sourceH = imageEl.naturalHeight;
      } else {
        sourceW = imageEl.videoWidth;
        sourceH = imageEl.videoHeight;
      }

      if (!sourceW || !sourceH) return;

      // ==============================
      // 3️⃣ Scaling factors
      // ==============================
      const scaleX = displayW / sourceW;
      const scaleY = displayH / sourceH;

      // Clear previous frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ==============================
      // 4️⃣ Draw plates
      // ==============================
      plates.forEach((plate, pIndex) => {
        const pb = plate.plate_box;
        if (!pb) return;

        // Plate box (ABSOLUTE → SCALED)
        const x1 = pb.x_min * scaleX;
        const y1 = pb.y_min * scaleY;
        const w = (pb.x_max - pb.x_min) * scaleX;
        const h = (pb.y_max - pb.y_min) * scaleY;

        // Plate rectangle
        ctx.strokeStyle = "#00FF88";
        ctx.lineWidth = 3;
        ctx.strokeRect(x1, y1, w, h);

        // Label
        ctx.fillStyle = "#00FF88";
        ctx.font = "14px Arial";
        ctx.fillText(
          `${pIndex + 1}: ${plate.plate_number ?? ""}`,
          x1 + 4,
          Math.max(14, y1 - 6)
        );

        // ==============================
        // 5️⃣ Draw character boxes
        // ==============================
        ctx.strokeStyle = "#FF66CC";
        ctx.lineWidth = 1.5;

        plate.char_boxes?.forEach((cb) => {
          const cx =
            (pb.x_min + cb.x_min) * scaleX;
          const cy =
            (pb.y_min + cb.y_min) * scaleY;
          const cw =
            (cb.x_max - cb.x_min) * scaleX;
          const ch =
            (cb.y_max - cb.y_min) * scaleY;

          ctx.strokeRect(cx, cy, cw, ch);
        });
      });
    },
    []
  );

  return { drawMultiPlateResults };
}
