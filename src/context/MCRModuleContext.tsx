import React, { createContext, useContext } from 'react';
import { MCRModuleProps } from '@/types/mainConclusionRole';

const MCRModuleContext = createContext<Omit<MCRModuleProps, 'key'>>({
  focusMode: false,
  isCompleted: false,
  onComplete: () => {},
  userName: 'Student'
});

export const MCRModuleProvider = MCRModuleContext.Provider;
export const useMCRModuleContext = () => useContext(MCRModuleContext);
