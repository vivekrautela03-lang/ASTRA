import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Camera, RefreshCw, X, Sparkles, Box, Sun } from 'lucide-react';
import { cameraVisionService, type CameraFrameAnalysis } from '../../services/cameraVisionService';
import { voiceVisionEngine } from '../../services/voiceVisionEngine';

interface CameraVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CameraVisionModal: React.FC<CameraVisionModalProps> = ({ isOpen, onClose }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CameraFrameAnalysis | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      cameraVisionService.startCamera().then(videoEl => {
        if (videoEl && videoRef.current) {
          videoRef.current.srcObject = videoEl.srcObject;
          videoRef.current.play();
        }
      });
    } else {
      cameraVisionService.stopCamera();
    }

    return () => {
      cameraVisionService.stopCamera();
    };
  }, [isOpen]);

  const handleAnalyzeFrame = async () => {
    setAnalyzing(true);
    const result = await cameraVisionService.analyzeSurroundingsAndObject('Identify object held in hand and surroundings.');
    setAnalysis(result);
    setAnalyzing(false);

    // Announce out loud in female voice
    const speechSummary = `Sir, I have scanned your camera feed. You are holding a ${result.objectHeld}. ${result.surroundings.substring(0, 160)}`;
    voiceVisionEngine.speak(speechSummary, 'bilingual');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-3xl glass-panel bg-[#020617]/95 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden font-mono text-white flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                <Eye className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-200 tracking-wider">JARVIS SPATIAL VISION & OBJECT RETICLE</h3>
                <p className="text-[11px] text-white/50">Real-time WebCam feed analysis & object identification</p>
              </div>
            </div>

            <button
              onClick={() => {
                cameraVisionService.stopCamera();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* WebCam Video Display Container */}
          <div className="relative w-full h-80 rounded-2xl bg-black/90 border border-emerald-500/30 overflow-hidden flex items-center justify-center">
            {/* Live Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-2xl scale-x-[-1]"
            />

            {/* Targeting Reticle & Scanline Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-emerald-400/50 pointer-events-none animate-pulse flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            {/* HUD Status Pill */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 border border-emerald-400/40 text-[10px] text-emerald-300 font-mono flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>WEBCAM FEED ACTIVE • 60 FPS RETICLE LOCKED</span>
            </div>
          </div>

          {/* Controls & Action Button */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleAnalyzeFrame}
              disabled={analyzing}
              className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500/30 via-cyan-500/30 to-purple-500/30 hover:from-emerald-500/50 hover:via-cyan-500/50 hover:to-purple-500/50 border border-emerald-400/50 text-emerald-200 font-bold text-xs tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>ANALYZING OBJECT & SURROUNDINGS...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 text-emerald-400" />
                  <span>IDENTIFY OBJECT HELD & SURROUNDINGS</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Results Display */}
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl glass-card bg-emerald-950/20 border border-emerald-500/30 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between text-emerald-300 border-b border-emerald-500/20 pb-1.5">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold uppercase tracking-wider">Object Held:</span>
                  <span className="text-white font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-400/30">
                    {analysis.objectHeld}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-white/50">
                  <Sun className="w-3 h-3 text-amber-400" />
                  <span>{analysis.lighting}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Surroundings & Multimodal Synthesis:</p>
                <p className="text-xs text-white/90 font-sans leading-relaxed">{analysis.surroundings}</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] text-cyan-300">
                  Detected Features: {analysis.detectedItems.join(', ')}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
