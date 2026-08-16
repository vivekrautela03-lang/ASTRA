import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, Video, CameraIcon, AlertTriangle } from 'lucide-react';
import { cameraTool, type CameraState } from '../../../services/tools/CameraTool';

interface CameraWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onFrameCaptured?: (frameDataUrl: string) => void;
}

export const CameraWidget: React.FC<CameraWidgetProps> = ({
  isOpen,
  onClose,
  onFrameCaptured
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camState, setCamState] = useState<CameraState>({
    active: false,
    permissionGranted: false,
    error: null,
    stream: null
  });

  const handleStartCamera = async () => {
    const res = await cameraTool.startCamera();
    setCamState(res);
    if (res.stream && videoRef.current) {
      videoRef.current.srcObject = res.stream;
    }
  };

  const handleStopCamera = () => {
    cameraTool.stopCamera();
    setCamState({
      active: false,
      permissionGranted: false,
      error: null,
      stream: null
    });
  };

  useEffect(() => {
    if (isOpen) {
      handleStartCamera();
    } else {
      handleStopCamera();
    }
    return () => {
      cameraTool.stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCapture = () => {
    if (videoRef.current) {
      const dataUrl = cameraTool.captureFrame(videoRef.current);
      if (dataUrl && onFrameCaptured) {
        onFrameCaptured(dataUrl);
      }
    }
  };

  return (
    <div className="p-4 rounded-3xl bg-slate-950/80 border border-amber-500/30 backdrop-blur-3xl shadow-2xl flex flex-col gap-3 font-sans text-xs w-80">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 text-cyan-300">
          <Camera className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white text-xs">Camera Vision Module</span>
        </div>
        <button onClick={onClose} className="p-1 text-white/50 hover:text-white">
          <CameraOff className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="relative w-full h-44 rounded-2xl bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center">
        {camState.active ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : camState.error ? (
          <div className="p-4 text-center text-rose-300 text-[11px] flex flex-col items-center gap-1.5">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <span>{camState.error}</span>
          </div>
        ) : (
          <div className="text-white/50 text-[11px] flex flex-col items-center gap-1.5">
            <Video className="w-5 h-5 text-amber-300 animate-pulse" />
            <span>Initializing secure camera stream...</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        {camState.active ? (
          <>
            <button
              onClick={handleCapture}
              className="flex-1 py-2 rounded-xl bg-amber-500/80 hover:bg-amber-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <CameraIcon className="w-3.5 h-3.5" />
              <span>Capture Frame</span>
            </button>
            <button
              onClick={handleStopCamera}
              className="ml-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
            >
              Stop
            </button>
          </>
        ) : (
          <button
            onClick={handleStartCamera}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Start Camera</span>
          </button>
        )}
      </div>
    </div>
  );
};
