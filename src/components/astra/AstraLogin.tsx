import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Mail } from 'lucide-react';
import AstraOrb from './AstraOrb';
import LiquidGlassBackground from './LiquidGlassBackground';
import { AstraLogo } from './AstraLogo';

interface AstraLoginProps {
  onAuthenticate: (user: { email: string; name: string }) => void;
}

export const AstraLogin: React.FC<AstraLoginProps> = ({ onAuthenticate }) => {
  const [isBooting, setIsBooting] = useState(false);
  const [bootPhase, setBootPhase] = useState<'idle' | 'expanding' | 'online'>('idle');

  const handleStartBoot = (userEmail = 'operator@astra.os', userName = 'Chief Architect') => {
    setIsBooting(true);
    setBootPhase('expanding');

    setTimeout(() => {
      setBootPhase('online');
      setTimeout(() => {
        onAuthenticate({ email: userEmail, name: userName });
      }, 1200);
    }, 1500);
  };

  return (
    <div className="relative w-screen h-screen bg-[#000000] overflow-hidden flex flex-col items-center justify-center select-none">
      {/* Dynamic Liquid Glass Background Layer */}
      <LiquidGlassBackground />

      {/* Centerpiece Astra Energy Orb */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <div
          className={`transition-all duration-1000 ${
            bootPhase === 'expanding'
              ? 'scale-125 brightness-150'
              : bootPhase === 'online'
              ? 'scale-100'
              : 'scale-90'
          }`}
        >
          <AstraOrb size={bootPhase === 'expanding' ? 520 : 420} color="#00BFFF" state={isBooting ? 'THINKING' : 'IDLE'} />
        </div>

        {/* Booting Sequence HUD */}
        {isBooting ? (
          <div className="flex flex-col items-center gap-3.5 mt-4 animate-in fade-in zoom-in duration-500">
            <div className="flex items-center gap-2.5 px-5 py-2 rounded-full liquid-glass-pill text-cyan-300 text-xs font-mono tracking-widest shadow-[0_0_25px_rgba(0,191,255,0.4)]">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>
                {bootPhase === 'expanding'
                  ? 'SYNCHRONIZING NEURAL MATRIX...'
                  : 'ASTRA CORE ONLINE • WELCOME'}
              </span>
            </div>
            <div className="w-52 h-1.5 bg-white/10 rounded-full overflow-hidden liquid-glass-card">
              <div
                className={`h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 ${
                  bootPhase === 'expanding' ? 'w-2/3' : 'w-full'
                }`}
              />
            </div>
          </div>
        ) : (
          /* Liquid Glass Login Card Experience with Pure Transparent Logo */
          <div className="flex flex-col items-center gap-6 mt-2 max-w-sm w-full p-8 rounded-3xl liquid-glass z-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <AstraLogo size="lg" align="center" showSubtitle={true} />

            {/* Actions */}
            <div className="w-full flex flex-col gap-3">
              {/* Instant Operator Access */}
              <button
                type="button"
                onClick={() => handleStartBoot('operator@astra.os', 'Operator')}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#00BFFF] to-blue-600 hover:brightness-110 text-white font-semibold text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,191,255,0.45)] transition-all active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                <span>LAUNCH OPERATING SYSTEM</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={() => handleStartBoot('user@google.com', 'Google User')}
                className="w-full py-3 px-4 rounded-2xl liquid-glass-chip text-white/90 text-xs font-medium flex items-center justify-center gap-2.5 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Continue with Email */}
              <button
                type="button"
                onClick={() => handleStartBoot('developer@enterprise.io', 'Enterprise User')}
                className="w-full py-3 px-4 rounded-2xl liquid-glass-chip text-white/90 text-xs font-medium flex items-center justify-center gap-2.5 transition-all"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Continue with Email</span>
              </button>
            </div>

            {/* Footer Trust Indicator */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/40">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quantum-Encrypted Neural Session</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AstraLogin;
