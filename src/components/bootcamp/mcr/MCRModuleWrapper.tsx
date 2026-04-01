import React from 'react';
import { motion } from 'framer-motion';
import { MCRCard } from './MCRUIComponents';

export const MCRModuleWrapper = ({
  title,
  label,
  progress,
  narrationText,
  children,
}: {
  title: string;
  label: string;
  progress?: { current: number; total: number };
  narrationText?: string;
  children: React.ReactNode;
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
    <MCRCard label={label} title={title} focusMode={false} progress={progress} narrationText={narrationText}>
      {children}
    </MCRCard>
  </motion.div>
);
