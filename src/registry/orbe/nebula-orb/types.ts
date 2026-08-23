import type React from 'react';

export type OrbState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'error'
  | 'disabled';

export interface NebulaOrbProps {
  state?: OrbState;
  size?: number;
  speed?: number;
  colorFrom?: string;
  colorTo?: string;
  levelRef?: React.MutableRefObject<number>;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export interface OrbStatusProps {
  state: OrbState;
  customText?: string;
  className?: string;
  showIcon?: boolean;
}
