"use client";
import { motion } from "framer-motion";

/**
 * GPU-composited floating paths.
 * Perf: static <path> elements (no pathOffset/pathLength repaints).
 * All motion is via motion.div translate x/y + opacity — fully composited on GPU.
 */
function FloatingPaths({ position, delay = 0 }: { position: number; delay?: number }) {
    const paths = Array.from({ length: 36 }, (_, i) => ({
        id: i,
        d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
            380 - i * 5 * position
        } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
            152 - i * 5 * position
        } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
            684 - i * 5 * position
        } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
        width: 0.5 + i * 0.03,
        strokeOpacity: 0.15 + (i / 35) * 0.15,
    }));

    return (
        <motion.div
            className="absolute inset-[-40px] pointer-events-none will-change-transform"
            animate={{
                x: [-30, 30, -30],
                y: [-15, 15, -15],
                opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear", delay }}
        >
            <svg
                className="w-full h-full text-white"
                viewBox="0 0 696 316"
                fill="none"
                preserveAspectRatio="xMidYMid slice"
            >
                <title>Background Paths</title>
                {paths.map((path) => (
                    <path
                        key={path.id}
                        d={path.d}
                        stroke="currentColor"
                        strokeWidth={path.width}
                        strokeOpacity={path.strokeOpacity}
                    />
                ))}
            </svg>
        </motion.div>
    );
}

/**
 * Standalone background paths overlay (no layout, no title).
 * Used as a background layer inside existing containers.
 */
export function BackgroundPaths() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <FloatingPaths position={1} delay={0} />
            <FloatingPaths position={-1} delay={7} />
        </div>
    );
}
