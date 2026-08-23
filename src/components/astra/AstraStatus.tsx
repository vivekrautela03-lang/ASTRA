import React from 'react';
import type { OrbState } from '../../registry/orbe/nebula-orb/types';
import { OrbStatus } from '../../registry/orbe/nebula-orb/OrbStatus';

export interface AstraStatusProps {
  orbState: OrbState;
  statusMessage?: string;
  className?: string;
}

export const AstraStatus: React.FC<AstraStatusProps> = ({
  orbState,
  statusMessage,
  className = ''
}) => {
  return (
    <div className={`w-full flex justify-center py-1 ${className}`}>
      <OrbStatus
        state={orbState}
        customText={statusMessage}
        className="px-3 py-1 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-md"
      />
    </div>
  );
};
