"use client";

/**
 * OrbitalHub — the Radial Orbital Timeline centerpiece of the Academy Foyer.
 *
 * Architecture:
 *  - SVG layer  : ring track, leading arc, outer dashed ring, inner ring, charge halos
 *  - HTML layer : interactive node overlays (dot + label + hit target) — no counter-rotation needed
 *  - Phase prop controls all visibility + animation states
 *
 * Motion language: "architectural not animated" — 120-second orbital drift, nodes anchored.
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type FoyerPhase = "ghost" | "materializing" | "idle" | "dissolving";

export interface FoyerNode {
  id: string;
  label: string;
  angleDeg: number;     // -90 = top, clockwise
  target: string;       // route to navigate to on select
  description: string;
  charge: number;       // 0–1, drives silver intensity without badge clutter
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const CX = 200;
const CY = 200;
const RADIUS = 152;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 955

export const FOYER_NODES: FoyerNode[] = [
  {
    id: "practice",
    label: "PRACTICE",
    angleDeg: -90,              // top / 12 o'clock
    target: "/",
    description: "Drills, sections & adaptive sets",
    charge: 0,
  },
  {
    id: "schedule",
    label: "SCHEDULE",
    angleDeg: -18,              // upper-right
    target: "/schedule",
    description: "Today's plan & milestones",
    charge: 0.6,
  },
  {
    id: "analytics",
    label: "ANALYTICS",
    angleDeg: 54,               // lower-right
    target: "/analytics",
    description: "Accuracy, trends & performance insight",
    charge: 0,
  },
  {
    id: "booking",
    label: "BOOKING",
    angleDeg: 126,              // lower-left
    target: "/booking",
    description: "Sessions & office hours",
    charge: 0.38,
  },
  {
    id: "classroom",
    label: "CLASSROOM",
    angleDeg: 198,              // upper-left
    target: "/classroom",
    description: "Assigned work, materials & submissions",
    charge: 0.82,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// GEOMETRY HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function svgPos(angleDeg: number, r = RADIUS) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

/** Node position as % of the 400×400 SVG container */
function pct(angleDeg: number, r = RADIUS) {
  const { x, y } = svgPos(angleDeg, r);
  return { xp: (x / 400) * 100, yp: (y / 400) * 100 };
}

type LabelAnchor = "above" | "right" | "below" | "left";

function anchor(angleDeg: number): LabelAnchor {
  const a = ((angleDeg % 360) + 360) % 360;
  if (a > 315 || a <= 45) return "above";
  if (a > 45 && a <= 135) return "right";
  if (a > 135 && a <= 225) return "below";
  return "left";
}

function labelStyle(a: LabelAnchor): React.CSSProperties {
  const base: React.CSSProperties = { position: "absolute", whiteSpace: "nowrap", pointerEvents: "none" };
  const GAP = "calc(100% + 14px)";
  switch (a) {
    case "above": return { ...base, bottom: GAP, left: "50%", transform: "translateX(-50%)" };
    case "right": return { ...base, left:   GAP, top:  "50%", transform: "translateY(-50%)" };
    case "below": return { ...base, top:    GAP, left: "50%", transform: "translateX(-50%)" };
    case "left":  return { ...base, right:  GAP, top:  "50%", transform: "translateY(-50%)" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface OrbitalHubProps {
  phase: FoyerPhase;
  selectedNodeId?: string | null;
  onSelectNode: (node: FoyerNode) => void;
}

export default function OrbitalHub({ phase, selectedNodeId, onSelectNode }: OrbitalHubProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const isGhost      = phase === "ghost";
  const isMat        = phase === "materializing";
  const isIdle       = phase === "idle";
  const isDissolving = phase === "dissolving";
  const isActive     = isIdle || isDissolving;

  const hoveredNode  = hovered ? FOYER_NODES.find(n => n.id === hovered) : null;

  // Ring dashoffset: full (hidden) in ghost phase, 0 (fully drawn) in all others
  const dashOffset = isGhost ? CIRCUMFERENCE : 0;

  return (
    <div className="relative w-full h-full select-none" aria-label="Academy navigation hub">
      {/* ── CSS keyframes (scoped inline) ── */}
      <style>{`
        @keyframes orbital-drift {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      {/* ════════════════════════════════════════
          SVG RING LAYER
          Handles: track, leading arc, decorative rings, charge halos
          ════════════════════════════════════════ */}
      <svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
        style={{ overflow: "visible" }}
      >
        {/* Outer decorative dashed ring */}
        <circle
          cx={CX} cy={CY} r={176}
          fill="none"
          stroke="white"
          strokeOpacity={isGhost ? 0.04 : 0.055}
          strokeWidth={0.5}
          strokeDasharray="2 10"
          style={{ transition: "stroke-opacity 2s ease" }}
        />

        {/* ── Rotating group: the main orbital track ── */}
        <g
          style={{
            transformOrigin: `${CX}px ${CY}px`,
            animation: isActive ? "orbital-drift 120s linear infinite" : "none",
          }}
        >
          {/* Full orbital ring — animates in via dashoffset */}
          <circle
            cx={CX} cy={CY} r={RADIUS}
            fill="none"
            stroke="white"
            strokeOpacity={isGhost ? 0.07 : 0.14}
            strokeWidth={0.75}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{
              transition:
                "stroke-dashoffset 2.2s cubic-bezier(0.25,0.46,0.45,0.94), stroke-opacity 1.5s ease",
            }}
          />
          {/* Brighter leading arc — upper-right quarter, gives directional sense */}
          <path
            d={`M ${CX} ${CY - RADIUS} A ${RADIUS} ${RADIUS} 0 0 1 ${CX + RADIUS} ${CY}`}
            fill="none"
            stroke="white"
            strokeOpacity={isGhost ? 0 : 0.26}
            strokeWidth={1}
            strokeLinecap="round"
            style={{ transition: "stroke-opacity 2s ease 0.9s" }}
          />
        </g>

        {/* Inner static ring */}
        <circle
          cx={CX} cy={CY} r={44}
          fill="none"
          stroke="white"
          strokeOpacity={isGhost ? 0.03 : 0.07}
          strokeWidth={0.5}
          style={{ transition: "stroke-opacity 2s ease" }}
        />

        {/* ── Charge halos (behind HTML node overlays) ── */}
        {FOYER_NODES.map(node => {
          if (!node.charge) return null;
          const p = svgPos(node.angleDeg);
          return (
            <circle
              key={`halo-${node.id}`}
              cx={p.x} cy={p.y}
              r={9 + node.charge * 8}
              fill="white"
              fillOpacity={isGhost ? 0 : node.charge * 0.055}
              style={{ transition: "fill-opacity 2.5s ease 0.5s" }}
            />
          );
        })}
      </svg>

      {/* ════════════════════════════════════════
          HTML NODE OVERLAYS
          Handles: interactive dots, labels, hover states, dissolve logic
          ════════════════════════════════════════ */}
      {FOYER_NODES.map((node, i) => {
        const { xp, yp }  = pct(node.angleDeg);
        const nodeAnchor  = anchor(node.angleDeg);
        const isSelected  = selectedNodeId === node.id;
        const isHov       = hovered === node.id;
        const isReceding  = isDissolving && !isSelected;
        const staggerDelay = isMat ? 0.65 + i * 0.12 : 0;

        return (
          <motion.div
            key={node.id}
            className="absolute z-10 cursor-pointer"
            style={{
              left: `${xp}%`,
              top:  `${yp}%`,
              transform: "translate(-50%, -50%)",
              // Generous hit target
              padding: "18px",
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: isGhost ? 0 : isReceding ? 0 : 1,
              scale:   isSelected ? 1.25 : 1,
              filter:  isSelected
                ? "brightness(2.2) drop-shadow(0 0 8px rgba(255,255,255,0.7))"
                : isReceding
                ? "brightness(0.25)"
                : "brightness(1)",
            }}
            transition={{
              opacity: { duration: 0.65, delay: staggerDelay },
              scale:   { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
              filter:  { duration: 0.55 },
            }}
            onMouseEnter={() => setHovered(node.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => !isDissolving && onSelectNode(node)}
          >
            {/* ── Node dot (7px) ── */}
            <div className="relative w-[7px] h-[7px]">

              {/* Hover ring */}
              <motion.div
                className="absolute rounded-full border border-white/[0.22]"
                style={{ inset: "-9px" }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: isHov ? 1 : 0, scale: isHov ? 1 : 0.6 }}
                transition={{ duration: 0.22 }}
              />

              {/* Dot */}
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: "white",
                  opacity:    isHov ? 1 : 0.4 + node.charge * 0.45,
                  boxShadow:  isHov
                    ? "0 0 12px rgba(255,255,255,0.8)"
                    : node.charge > 0.4
                    ? `0 0 ${node.charge * 7}px rgba(255,255,255,${0.3 + node.charge * 0.35})`
                    : "none",
                  transition: "opacity 0.3s, box-shadow 0.3s",
                }}
              />

              {/* ── Label ── */}
              <div style={labelStyle(nodeAnchor)}>
                <div
                  className="text-[9px] uppercase font-medium"
                  style={{
                    letterSpacing: "0.22em",
                    color: isHov
                      ? "rgba(255,255,255,0.88)"
                      : node.charge > 0.5
                      ? `rgba(255,255,255,${0.28 + node.charge * 0.22})`
                      : "rgba(255,255,255,0.22)",
                    transition: "color 0.3s",
                  }}
                >
                  {node.label}
                </div>

                {/* Charge bar — replaces the notification badge */}
                {node.charge > 0 && (
                  <div
                    className="mt-[3px] h-px rounded-full"
                    style={{
                      width: `${node.charge * 100}%`,
                      background: `rgba(255,255,255,${0.12 + node.charge * 0.28})`,
                      boxShadow:  `0 0 ${node.charge * 5}px rgba(255,255,255,${node.charge * 0.4})`,
                      transition: "width 1s ease, opacity 0.5s",
                    }}
                  />
                )}
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* ════════════════════════════════════════
          READING POCKET
          Center contextual display — updates on hover, fades between states
          ════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={hovered ?? "__default__"}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: isActive ? 1 : 0, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-center" style={{ width: 104 }}>
            {hoveredNode ? (
              <>
                <div
                  className="uppercase font-medium mb-1.5"
                  style={{ fontSize: 8, letterSpacing: "0.28em", color: "rgba(255,255,255,0.55)" }}
                >
                  {hoveredNode.label}
                </div>
                <div
                  className="leading-relaxed"
                  style={{ fontSize: 9, color: "rgba(255,255,255,0.27)" }}
                >
                  {hoveredNode.description}
                </div>
                {hoveredNode.charge > 0 && (
                  <div
                    className="mt-2 uppercase"
                    style={{
                      fontSize: 7,
                      letterSpacing: "0.25em",
                      color: `rgba(255,255,255,${0.18 + hoveredNode.charge * 0.3})`,
                    }}
                  >
                    {hoveredNode.charge > 0.65 ? "New activity" : "Updated"}
                  </div>
                )}
              </>
            ) : (
              <div
                className="uppercase"
                style={{ fontSize: 8, letterSpacing: "0.42em", color: "rgba(255,255,255,0.09)" }}
              >
                LSAT U
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
