import React from 'react';

export interface MCRModuleProps {
  key?: React.Key;
  focusMode: boolean;
  isCompleted: boolean;
  onComplete: () => void;
  userName: string;
}
