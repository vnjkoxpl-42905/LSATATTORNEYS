"use client";

/**
 * AcademyFoyer
 *
 * Layer 1 of the post-login arrival sequence.
 *
 * Flow:
 *   1. Auth.tsx completes login → navigate('/foyer', { state: { showWelcome, welcomeName } })
 *   2. Foyer mounts → WelcomeLoading overlay renders at z-9999 over the ghost hub
 *   3. WelcomeLoading completes → phase transitions ghost → materializing → idle
 *   4. Student selects a node → phase transitions idle → dissolving → navigate(target)
 *
 * Return visits (no location.state.showWelcome): hub renders at full opacity immediately.
 */

import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import WelcomeLoading from "@/components/WelcomeLoading";
import OrbitalHub, { FoyerPhase, FoyerNode } from "@/components/foyer/OrbitalHub";

export default function AcademyFoyer() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, loading: authLoading } = useAuth();

  // ── Location state injected by Auth.tsx on fresh login ──────────────────────
  const state = location.state as { showWelcome?: boolean; welcomeName?: string } | null;
  const showWelcomeFromState = state?.showWelcome ?? false;
  const welcomeName = state?.welcomeName
    ?? user?.user_metadata?.username
    ?? user?.user_metadata?.display_name
    ?? user?.email?.split("@")[0]
    ?? "there";

  // ── Session guard: ensure Welcome doesn't replay on back-navigation ─────────
  // Once mounted with showWelcome=true, replace the history entry with no state.
  React.useEffect(() => {
    if (showWelcomeFromState) {
      navigate("/foyer", { replace: true, state: null });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auth guard ───────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  // ── Phase state machine ──────────────────────────────────────────────────────
  // On fresh login: start in "ghost" (hub faint underneath Welcome overlay)
  // On return visit: start in "idle" (hub fully visible immediately)
  const [phase, setPhase] = React.useState<FoyerPhase>(
    showWelcomeFromState ? "ghost" : "idle"
  );
  const [showWelcome, setShowWelcome] = React.useState(showWelcomeFromState);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
  const matTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const navTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Cleanup timers on unmount ────────────────────────────────────────────────
  React.useEffect(() => {
    return () => {
      if (matTimerRef.current) clearTimeout(matTimerRef.current);
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  // ── Welcome → Materialization handoff ───────────────────────────────────────
  const handleWelcomeComplete = React.useCallback(() => {
    setShowWelcome(false);       // unmount WelcomeLoading
    setPhase("materializing");   // start ring draw-in + node stagger

    // Allow materialization to play (~2.4s) then settle to idle
    matTimerRef.current = setTimeout(() => {
      setPhase("idle");
    }, 2400);
  }, []);

  // ── Node selection → Dissolve → Navigate ────────────────────────────────────
  const handleSelectNode = React.useCallback((node: FoyerNode) => {
    setSelectedNodeId(node.id);
    setPhase("dissolving");

    navTimerRef.current = setTimeout(() => {
      navigate(node.target);
    }, 950);
  }, [navigate]);

  // ── Don't render until auth is resolved ─────────────────────────────────────
  if (authLoading || !user) return null;

  return (
    <div className="fixed inset-0 bg-[#000000] overflow-hidden">

      {/* ── LSAT U wordmark — ultra-faint brand anchor ── */}
      <div className="absolute top-8 inset-x-0 flex justify-center z-30 pointer-events-none">
        <span
          className="uppercase font-medium select-none"
          style={{ fontSize: 9, letterSpacing: "0.42em", color: "rgba(255,255,255,0.09)" }}
        >
          LSAT U
        </span>
      </div>

      {/* ── Orbital Hub ── */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        {/* Square container — responsive, limited to 80% of both viewport axes */}
        <div style={{ width: "min(440px, 80vw, 80vh)", height: "min(440px, 80vw, 80vh)" }}>
          <OrbitalHub
            phase={phase}
            selectedNodeId={selectedNodeId}
            onSelectNode={handleSelectNode}
          />
        </div>
      </div>

      {/* ── Bottom prompt — appears once idle ── */}
      <AnimatePresence>
        {phase === "idle" && (
          <motion.div
            className="absolute bottom-9 inset-x-0 flex justify-center z-30 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <span
              className="uppercase select-none"
              style={{ fontSize: 8, letterSpacing: "0.38em", color: "rgba(255,255,255,0.09)" }}
            >
              Select a module
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dissolve vignette — deepens during node selection ── */}
      <AnimatePresence>
        {phase === "dissolving" && (
          <motion.div
            className="absolute inset-0 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background:
                "radial-gradient(ellipse 60% 60% at 50% 50%, transparent 20%, rgba(0,0,0,0.7) 80%, #000 100%)",
            }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </AnimatePresence>

      {/* ── Welcome overlay — sits at z-9999 over the ghost hub ── */}
      {showWelcome && (
        <WelcomeLoading
          userName={welcomeName}
          onComplete={handleWelcomeComplete}
        />
      )}
    </div>
  );
}
