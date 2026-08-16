import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';
import { timeDateTool } from '../../../services/tools/TimeDateTool';

export const TimeWidget: React.FC = () => {
  const [timeInfo, setTimeInfo] = useState(timeDateTool.getCurrentTimeDate());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeInfo(timeDateTool.getCurrentTimeDate());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-4 rounded-3xl bg-slate-950/60 border border-white/15 backdrop-blur-2xl shadow-xl flex flex-col justify-between font-sans text-xs w-64">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 text-cyan-300">
          <Clock className="w-4 h-4" />
          <span className="font-bold text-white text-xs">System Time</span>
        </div>
        <span className="text-[10px] font-mono text-white/50 uppercase">Timezone</span>
      </div>

      <div className="my-2">
        <h3 className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-wider">{timeInfo.time}</h3>
        <p className="text-xs text-amber-200/90 font-medium">{timeInfo.day}</p>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/60 border-t border-white/10 pt-2">
        <Calendar className="w-3 h-3 text-purple-400" />
        <span>{timeInfo.date} {timeInfo.month} {timeInfo.year}</span>
      </div>
    </div>
  );
};
